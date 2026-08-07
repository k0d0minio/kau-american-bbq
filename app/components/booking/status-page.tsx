import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Ban,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Mail,
  MailCheck,
  Phone,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Nav } from "@/app/components/nav";
import { Footer } from "@/app/components/footer";
import { site } from "@/lib/site";
import { getBookingByManageToken } from "@/lib/db/queries";
import { getCancellationPolicy } from "@/lib/settings";
import { formatDate, todayAtRestaurant } from "@/lib/booking/dates";
import { isService } from "@/lib/booking/availability";
import { isDiningFormat } from "@/lib/booking/dining-formats";
import { formatMoney } from "@/lib/booking/pricing";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { fill } from "@/lib/i18n/format";
import { localeHref, type Locale } from "@/lib/i18n/config";
import { CancelControls } from "./cancel-controls";

const STATUS_ICONS: Record<string, LucideIcon> = {
  pending: Clock,
  approved: CalendarCheck,
  completed: CheckCircle2,
  declined: XCircle,
  cancelled: Ban,
};

type StatusKey = keyof ReturnType<typeof getDictionary>["bookingStatus"]["states"];

/**
 * The private reservation status page. Reached from the confirmation email or
 * straight after submitting the form, so it renders in whichever language the
 * guest booked in.
 */
export async function BookingStatus({
  token,
  submitted,
  locale,
}: {
  token: string;
  submitted: boolean;
  locale: Locale;
}) {
  const row = await getBookingByManageToken(token);
  if (!row) notFound();

  const dict = getDictionary(locale);
  const t = dict.bookingStatus;
  const { booking, space, guest } = row;
  const policy = await getCancellationPolicy();
  const today = todayAtRestaurant();
  const isCompleted = booking.status === "approved" && booking.endDate <= today;
  const statusKey = (isCompleted ? "completed" : booking.status) as StatusKey;
  const status = t.states[statusKey];
  const StatusIcon = STATUS_ICONS[statusKey] ?? Clock;

  const total = booking.finalTotalCents ?? booking.quotedTotalCents;
  const paymentLine: string | null =
    booking.status !== "approved"
      ? null
      : booking.paymentStatus === "paid"
        ? t.payment.paid
        : booking.paymentStatus === "deposit_paid"
          ? fill(t.payment.depositPaid, {
              amount: booking.depositCents ? ` (${formatMoney(booking.depositCents)})` : "",
            })
          : booking.paymentStatus === "refunded"
            ? t.payment.refunded
            : t.payment.pending;

  const detailRows: Array<[string, React.ReactNode]> = [
    [t.reference, <strong key="ref">{booking.reference}</strong>],
    [
      t.where,
      <Link
        key="space"
        href={localeHref(locale, `/spaces/${space.slug}`)}
        className="font-medium text-char-700 hover:text-ember"
      >
        {space.name}
      </Link>,
    ],
    [t.date, formatDate(booking.startDate, locale)],
    ...(isService(booking.service)
      ? ([[t.sitting, dict.booking.services[booking.service]]] as Array<[string, string]>)
      : []),
    ...(isDiningFormat(booking.diningFormat)
      ? ([
          [t.served, dict.booking.formats[booking.diningFormat].label],
        ] as Array<[string, string]>)
      : []),
    [t.partySize, String(booking.partySize)],
    ...(booking.eventType ? ([[t.occasion, booking.eventType]] as Array<[string, string]>) : []),
    [t.bookedBy, `${guest.firstName} ${guest.lastName}`],
  ];

  return (
    <>
      <Nav locale={locale} />
      <main className="bg-bone">
        {/* Dark header band (keeps the fixed nav legible). */}
        <section className="bg-char-900 px-5 pb-16 pt-32 text-center sm:pb-20 sm:pt-40">
          <div className="mx-auto max-w-2xl">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-bone/10 text-ember-soft">
              <StatusIcon className="size-7" />
            </span>
            <h1 className="mt-5 font-display text-3xl font-light text-bone sm:text-5xl">
              {status.title}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-sm leading-relaxed text-bone/80 sm:text-base">
              {status.body}
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-2xl space-y-6 px-5 py-12 sm:px-8 sm:py-16">
          {submitted ? (
            <p className="flex items-start gap-2.5 rounded-2xl bg-char-50 px-5 py-4 text-sm leading-relaxed text-char-700">
              <MailCheck className="mt-0.5 size-4 shrink-0" />
              {fill(t.submitted, { email: guest.email })}
            </p>
          ) : null}

          {booking.status === "approved" && booking.cancelRequestedAt ? (
            <p className="flex items-start gap-2.5 rounded-2xl bg-ember/10 px-5 py-4 text-sm leading-relaxed text-[#7c2d12]">
              <Clock className="mt-0.5 size-4 shrink-0" />
              {t.cancelPending}
            </p>
          ) : null}

          <div className="rounded-3xl border border-char-100 bg-bone-100 p-6 shadow-soft sm:p-7">
            <h2 className="font-display text-xl text-char-900">{t.details}</h2>
            <dl className="mt-4 divide-y divide-char-100">
              {detailRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-stone">{label}</dt>
                  <dd className="text-right text-sm text-ink">{value}</dd>
                </div>
              ))}
              {total > 0 ? (
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-stone">
                    {booking.status === "pending" ? t.estimatedTotal : t.total}
                  </dt>
                  <dd className="text-right text-sm font-semibold text-ink">
                    {formatMoney(total)}
                  </dd>
                </div>
              ) : null}
            </dl>
            {total > 0 && booking.status === "pending" ? (
              <p className="mt-3 text-xs leading-relaxed text-stone">{t.estimateNote}</p>
            ) : null}
            {total > 0 && paymentLine ? (
              <p className="mt-3 rounded-xl bg-bone px-4 py-3 text-sm text-ink-soft">
                {paymentLine}
              </p>
            ) : null}
          </div>

          {booking.status === "pending" ? (
            <div className="rounded-3xl border border-char-100 bg-bone-100 p-6 sm:p-7">
              <h2 className="font-display text-xl text-char-900">{t.changeOfPlans}</h2>
              <p className="mb-4 mt-2 text-sm leading-relaxed text-ink-soft">{t.withdrawBody}</p>
              <CancelControls token={booking.manageToken} mode="withdraw" locale={locale} />
            </div>
          ) : null}

          {booking.status === "approved" &&
          !isCompleted &&
          !booking.cancelRequestedAt ? (
            <div className="rounded-3xl border border-char-100 bg-bone-100 p-6 sm:p-7">
              <h2 className="font-display text-xl text-char-900">{t.changeOfPlans}</h2>
              <p className="mb-4 mt-2 text-sm leading-relaxed text-ink-soft">{t.cancelBody}</p>
              <CancelControls token={booking.manageToken} mode="request" locale={locale} />
            </div>
          ) : null}

          {policy ? (
            <div className="rounded-3xl border border-char-100 bg-bone-100 p-6 sm:p-7">
              <h2 className="font-display text-xl text-char-900">{t.policy}</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone">{policy}</p>
            </div>
          ) : null}

          <p className="text-center text-sm text-ink-soft">
            {t.questions}{" "}
            <a href={site.phoneHref} className="inline-flex items-center gap-1 font-medium text-char-700 hover:text-ember">
              <Phone className="size-3.5" />
              {site.phone}
            </a>{" "}
            {t.orEmail}{" "}
            <a
              href={`mailto:${site.email}?subject=${t.mailSubject} ${booking.reference}`}
              className="inline-flex items-center gap-1 font-medium text-char-700 hover:text-ember"
            >
              <Mail className="size-3.5" />
              {site.email}
            </a>
          </p>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
