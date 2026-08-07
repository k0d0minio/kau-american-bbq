"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { bookings, guests, type Booking } from "@/lib/db/schema";
import { getAvailabilityData, getSpaceBySlug } from "@/lib/db/queries";
import { todayAtRestaurant } from "@/lib/booking/dates";
import {
  bookingWindow,
  isService,
  reservationEndDate,
  validateRequest,
} from "@/lib/booking/availability";
import { computeQuote } from "@/lib/booking/pricing";
import { makeManageToken, makeReference } from "@/lib/booking/tokens";
import { isDiningFormat } from "@/lib/booking/dining-formats";
import { EVENT_TYPE_VALUES } from "@/lib/booking/event-types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { validationMessage } from "@/lib/i18n/format";
import { defaultLocale, isLocale, localeHref } from "@/lib/i18n/config";
import { getCancellationPolicy, getNotifyEmail } from "@/lib/settings";
import {
  ownerNewRequestEmail,
  requestReceivedEmail,
  sendEmail,
} from "@/lib/email";

export type BookingFormState = { error?: string };

function cleanText(value: FormDataEntryValue | null, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestBooking(
  _previous: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  // The form carries the language it was rendered in, so the errors and the
  // page we land on afterwards stay in the guest's language.
  const localeRaw = cleanText(formData.get("locale"), 5);
  const locale = isLocale(localeRaw) ? localeRaw : defaultLocale;
  const dict = getDictionary(locale);
  const t = dict.bookingForm.errors;

  // Honeypot: real guests never fill this. Bots get waved through to the
  // homepage without a hint that anything was filtered.
  if (cleanText(formData.get("website"), 100)) redirect(localeHref(locale, "/"));

  const slug = cleanText(formData.get("space"), 100);
  const date = cleanText(formData.get("date"), 10);
  const serviceRaw = cleanText(formData.get("service"), 10);
  const diningFormatRaw = cleanText(formData.get("diningFormat"), 10);
  const firstName = cleanText(formData.get("firstName"), 80);
  const lastName = cleanText(formData.get("lastName"), 80);
  const email = cleanText(formData.get("email"), 200).toLowerCase();
  const phone = cleanText(formData.get("phone"), 40);
  const message = cleanText(formData.get("message"), 2000);
  const partySize = Number(cleanText(formData.get("partySize"), 5));
  const eventTypeRaw = cleanText(formData.get("eventType"), 60);

  if (!firstName || !lastName) {
    return { error: t.name };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: t.email };
  }

  let manageToken: string;
  try {
    const space = await getSpaceBySlug(slug);
    if (!space || !space.active) {
      return { error: t.spaceClosed };
    }

    // The occasion is optional for every space now, but still has to be one
    // of ours.
    const eventType = EVENT_TYPE_VALUES.find((v) => v === eventTypeRaw) ?? null;
    const service = isService(serviceRaw) ? serviceRaw : null;
    const diningFormat = isDiningFormat(diningFormatRaw) ? diningFormatRaw : null;
    if (!diningFormat) {
      return { error: t.format };
    }

    // Authoritative availability check against fresh data.
    const today = todayAtRestaurant();
    const window = bookingWindow(space, today);
    const availability = await getAvailabilityData(today, window.lastEnd);
    const validation = validateRequest(
      space,
      { date, service, partySize },
      today,
      availability.bookings,
      availability.blackouts
    );
    if (!validation.ok) return { error: validationMessage(validation.error, dict.booking.errors) };

    const startDate = date;
    const endDate = reservationEndDate(date);
    // Reservations are free; only event-priced spaces carry a quote.
    const quote = computeQuote(space, startDate, endDate);

    // Guests are deduplicated by email; details refresh to the latest request
    // but a blank phone never wipes one we already have.
    const [guest] = await db
      .insert(guests)
      .values({ email, firstName, lastName, phone: phone || null })
      .onConflictDoUpdate({
        target: guests.email,
        set: {
          firstName,
          lastName,
          ...(phone ? { phone } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    // Reference and token collisions are astronomically rare but cheap to
    // retry — the unique constraints are the arbiter.
    let booking: Booking | null = null;
    for (let attempt = 0; attempt < 3 && !booking; attempt++) {
      try {
        const [row] = await db
          .insert(bookings)
          .values({
            reference: makeReference(),
            manageToken: makeManageToken(),
            spaceId: space.id,
            guestId: guest.id,
            status: "pending",
            startDate,
            endDate,
            service,
            diningFormat,
            partySize,
            eventType,
            guestMessage: message || null,
            quotedTotalCents: quote.totalCents,
            blocksEstate: space.blocksEstate,
            source: "website",
          })
          .returning();
        booking = row;
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        const isUniqueCollision =
          text.includes("bookings_reference_unique") ||
          text.includes("bookings_manage_token_unique");
        if (!isUniqueCollision) throw error;
      }
    }
    if (!booking) {
      return { error: t.save };
    }
    manageToken = booking.manageToken;

    // Emails are best-effort; the request is already safely stored.
    const policy = await getCancellationPolicy();
    const emailData = {
      reference: booking.reference,
      spaceName: space.name,
      isEvent: space.isEvent,
      startDate,
      endDate,
      service,
      partySize,
      guestFirstName: firstName,
      manageToken: booking.manageToken,
      quote,
      policy,
    };
    await Promise.all([
      sendEmail({
        to: email,
        ...requestReceivedEmail(emailData),
      }),
      sendEmail({
        to: await getNotifyEmail(),
        replyTo: email,
        ...ownerNewRequestEmail({
          ...emailData,
          guestFullName: `${firstName} ${lastName}`,
          guestEmail: email,
          guestPhone: phone || null,
          message: message || null,
          eventType,
        }),
      }),
    ]);
  } catch (error) {
    console.error("Booking request failed:", error);
    return { error: t.send };
  }

  redirect(`${localeHref(locale, `/bookings/${manageToken}`)}?submitted=1`);
}
