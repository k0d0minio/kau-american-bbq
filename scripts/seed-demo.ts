// Fills the platform with realistic demo data — guests, reservations across
// every status, closures and enquiries — so KAU can be shown off end to end
// (public availability, the admin pipeline, the guests CRM, the dashboard
// stats). It is NOT a schema migration: it seeds *content*, on demand, and is
// safe to run against any database that already has the booking-platform
// tables and the KAU space (created by migrations 0002, 0003 and 0005).
//
//   DATABASE_URL="postgres://..." npm run db:seed:demo
//   DATABASE_URL="postgres://..." npm run db:seed:demo -- --reset   # wipe only
//
// Why a script and not a static SQL seed: reservations carry unique references
// and secret tokens, and their dates are anchored to *today* so the demo always
// shows a live mix of past sittings, upcoming covers and fresh requests. A
// hardcoded SQL file would drift into the past and can't compute any of that.
//
// Idempotent: every run first removes the data it previously created (demo
// guests are tagged by a reserved email domain, closures by their reason) and
// then re-inserts a fresh set. Real guests, real reservations and owner-created
// closures are never touched.
import "dotenv/config";
import { inArray, like } from "drizzle-orm";
import { db } from "../lib/db";
import {
  blackouts,
  bookings,
  enquiries,
  guests,
  spaces,
  type NewBlackout,
  type NewBooking,
  type NewEnquiry,
  type NewGuest,
} from "../lib/db/schema";
import { addDays, todayAtRestaurant, type ISODate } from "../lib/booking/dates";
import { isOpenDay, type Service } from "../lib/booking/availability";
import type { DiningFormat } from "../lib/booking/dining-formats";
import { computeQuote } from "../lib/booking/pricing";
import { makeManageToken, makeReference } from "../lib/booking/tokens";

// Everything demo is tagged so a reset can find and remove exactly what this
// script created — and nothing else.
const DEMO_EMAIL_DOMAIN = "demo.kaubarbecue.dev";
const today = todayAtRestaurant();

// A stable millisecond clock for created/decided timestamps, anchored to the
// start of today in Lisbon so repeat runs land on tidy round times.
const NOW = new Date(`${today}T12:00:00Z`).getTime();
const DAY_MS = 86_400_000;
/** A timestamp `days` from today (negative = in the past), for created_at etc. */
function ts(days: number): Date {
  return new Date(NOW + days * DAY_MS);
}

// ---------------------------------------------------------------------------
// Guests — one row per person, deduplicated by email (the demo domain).
// ---------------------------------------------------------------------------

type GuestSeed = Omit<NewGuest, "email"> & { key: string };

const GUESTS: GuestSeed[] = [
  { key: "sousa", firstName: "Mariana", lastName: "Sousa", phone: "+351 91 234 5678", notes: "Regular — always Sunday lunch, always the counter.", createdAt: ts(-380) },
  { key: "ferreira", firstName: "Tiago", lastName: "Ferreira", phone: "+351 96 118 2244", notes: "Brings clients from Lisbon. Books dinner, asks for the beef rib.", createdAt: ts(-300) },
  { key: "matos", firstName: "Beatriz", lastName: "Matos", phone: "+351 93 552 0917", notes: "Asked about full-venue hire for a company party.", createdAt: ts(-250) },
  { key: "carvalho", firstName: "Nuno", lastName: "Carvalho", phone: "+351 92 704 6631", notes: "Followed KAU from the NOS Alive pop-up.", createdAt: ts(-220) },
  { key: "lopes", firstName: "Inês", lastName: "Lopes", phone: "+351 91 880 3345", notes: "Vegetarian in the group — always checks the sides.", createdAt: ts(-190) },
  { key: "rodrigues", firstName: "André", lastName: "Rodrigues", phone: "+351 96 445 1120", notes: null, createdAt: ts(-160) },
  { key: "santos", firstName: "Catarina", lastName: "Santos", phone: "+351 93 219 7708", notes: "Big family table every few months.", createdAt: ts(-140) },
  { key: "almeida", firstName: "Miguel", lastName: "Almeida", phone: "+351 92 663 4409", notes: "Food writer — came in after the Time Out piece.", createdAt: ts(-120) },
  { key: "pereira", firstName: "Rita", lastName: "Pereira", phone: "+351 91 337 5582", notes: null, createdAt: ts(-95) },
  { key: "costa", firstName: "Diogo", lastName: "Costa", phone: "+351 96 902 1174", notes: "First visit — driving up from Ericeira.", createdAt: ts(-70) },
  { key: "martins", firstName: "Sofia", lastName: "Martins", phone: "+351 93 774 6650", notes: "Birthday dinner in the works.", createdAt: ts(-45) },
  { key: "silva", firstName: "Joana", lastName: "Silva", phone: "+351 91 445 9982", notes: null, createdAt: ts(-30) },
  { key: "gomes", firstName: "Pedro", lastName: "Gomes", phone: "+351 92 118 3367", notes: "Wants the counter every time — likes watching the cut.", createdAt: ts(-20) },
  { key: "fonseca", firstName: "Helena", lastName: "Fonseca", phone: "+351 96 550 7723", notes: null, createdAt: ts(-12) },
  { key: "ribeiro", firstName: "Bruno", lastName: "Ribeiro", phone: "+351 93 806 2215", notes: "Called about a last-minute Saturday table.", createdAt: ts(-6) },
  { key: "azevedo", firstName: "Marta", lastName: "Azevedo", phone: "+351 91 662 4438", notes: null, createdAt: ts(-2) },
];

function emailFor(g: GuestSeed): string {
  return `${g.firstName}.${g.lastName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "") + `@${DEMO_EMAIL_DOMAIN}`;
}

/** Nudge an offset forward until it lands on a day KAU actually serves. */
function openDayOffset(offset: number): number {
  let n = offset;
  while (!isOpenDay(addDays(today, n))) n += 1;
  return n;
}

// ---------------------------------------------------------------------------
// Reservations — a lifelike spread across statuses and time. Every reservation
// is a single date plus a sitting; approved covers stay well inside the room's
// capacity so the public availability stays honest. Pending, declined and
// cancelled rows never block covers, so they can sit wherever tells a good
// story. Offsets are nudged onto Thursday–Sunday, the days KAU serves.
// ---------------------------------------------------------------------------

type BookingSeed = {
  guestKey: string;
  status: NonNullable<NewBooking["status"]>;
  /** Offset in days from today (negative = past), nudged onto an open day. */
  startOffset: number;
  service: Service;
  diningFormat: DiningFormat;
  partySize: number;
  eventType?: string;
  /** Full-venue private hire: takes the whole restaurant for that sitting. */
  blocksEstate?: boolean;
  guestMessage?: string;
  paymentStatus?: NonNullable<NewBooking["paymentStatus"]>;
  source?: NonNullable<NewBooking["source"]>;
  decisionNote?: string;
  adminNotes?: string;
  /** Days before the reservation that the request came in. */
  leadDays: number;
};

const BOOKINGS: BookingSeed[] = [
  // ---- Past sittings (history + guests CRM + the "past" tab) ---------------
  { guestKey: "sousa", status: "approved", startOffset: -90, service: "lunch", diningFormat: "counter", partySize: 4, guestMessage: "The usual Sunday — counter if you have it.", source: "website", leadDays: 10, adminNotes: "Regular. Knows the whole menu." },
  { guestKey: "ferreira", status: "approved", startOffset: -60, service: "dinner", diningFormat: "table", partySize: 6, guestMessage: "Clients coming up from Lisbon — we'll want the beef rib.", source: "phone", leadDays: 14 },
  { guestKey: "carvalho", status: "approved", startOffset: -45, service: "dinner", diningFormat: "counter", partySize: 2, guestMessage: "Been following since the NOS Alive pop-up.", source: "website", leadDays: 7 },
  { guestKey: "almeida", status: "approved", startOffset: -30, service: "lunch", diningFormat: "table", partySize: 3, guestMessage: "Writing about the room — happy to sit wherever.", source: "email", leadDays: 9, adminNotes: "Time Out follow-up piece." },

  // ---- Upcoming, confirmed (capacity + dashboard arrivals) ------------------
  { guestKey: "costa", status: "approved", startOffset: 3, service: "lunch", diningFormat: "table", partySize: 2, guestMessage: "First time — driving up from Ericeira.", source: "website", leadDays: 6 },
  { guestKey: "santos", status: "approved", startOffset: 5, service: "lunch", diningFormat: "table", partySize: 8, guestMessage: "The whole family, grandparents included.", source: "website", leadDays: 21 },
  { guestKey: "gomes", status: "approved", startOffset: 5, service: "dinner", diningFormat: "counter", partySize: 2, guestMessage: "Counter seats please — we like the show.", source: "website", leadDays: 11 },
  { guestKey: "lopes", status: "approved", startOffset: 12, service: "dinner", diningFormat: "table", partySize: 5, guestMessage: "One vegetarian in the group — what are the sides?", source: "website", leadDays: 15, adminNotes: "Flagged to the kitchen: smoked eggplant + mac & cheese." },
  { guestKey: "rodrigues", status: "approved", startOffset: 19, service: "dinner", diningFormat: "table", partySize: 4, source: "phone", leadDays: 8 },
  { guestKey: "sousa", status: "approved", startOffset: 26, service: "lunch", diningFormat: "counter", partySize: 4, guestMessage: "Same as always.", source: "website", leadDays: 12 },

  // ---- Pending requests (the admin inbox / dashboard "needs a decision") ----
  { guestKey: "pereira", status: "pending", startOffset: 9, service: "dinner", diningFormat: "table", partySize: 6, guestMessage: "Flexible by a day either way if dinner is full.", source: "website", leadDays: 4 },
  { guestKey: "silva", status: "pending", startOffset: 16, service: "lunch", diningFormat: "counter", partySize: 2, guestMessage: "Is the counter bookable for two?", source: "website", leadDays: 3 },
  { guestKey: "martins", status: "pending", startOffset: 33, service: "dinner", diningFormat: "table", partySize: 14, eventType: "Birthday or celebration", guestMessage: "Birthday dinner for 14 — can you seat us together?", source: "website", leadDays: 6 },
  { guestKey: "matos", status: "pending", startOffset: 61, service: "dinner", diningFormat: "table", partySize: 80, eventType: "Full-venue private event", blocksEstate: true, guestMessage: "Company party for about 80 — we'd take the whole restaurant.", source: "email", leadDays: 20, adminNotes: "Quote to build by hand — full venue, one sitting." },
  { guestKey: "ribeiro", status: "pending", startOffset: 2, service: "dinner", diningFormat: "table", partySize: 3, guestMessage: "Last minute I know — any chance this weekend?", source: "phone", leadDays: 1 },

  // ---- Declined (archive tab) ----------------------------------------------
  { guestKey: "azevedo", status: "declined", startOffset: 5, service: "dinner", diningFormat: "table", partySize: 12, guestMessage: "Hoping for that Saturday in particular.", decisionNote: "That sitting is full — Sunday lunch is wide open though, and we'd love to have you.", source: "website", leadDays: 5 },

  // ---- Cancelled (archive tab) ---------------------------------------------
  { guestKey: "fonseca", status: "cancelled", startOffset: 40, service: "lunch", diningFormat: "table", partySize: 7, guestMessage: "Family lunch, seven of us.", adminNotes: "Guest cancelled — travelling that weekend after all.", source: "website", leadDays: 18 },
];

// ---------------------------------------------------------------------------
// Closures — the owner-blocked side of availability. Tagged by reason so a
// reset removes exactly these and leaves any real closures alone.
// ---------------------------------------------------------------------------

type BlackoutSeed = {
  startOffset: number;
  /** How many consecutive days stay closed. */
  days: number;
  reason: string;
};

const BLACKOUTS: BlackoutSeed[] = [
  { startOffset: 48, days: 14, reason: "Closed — summer holidays (demo)" },
  { startOffset: 61, days: 1, reason: "Private event — full venue (demo)" },
  { startOffset: 96, days: 2, reason: "Godzilla maintenance (demo)" },
];

const DEMO_BLACKOUT_REASONS = BLACKOUTS.map((b) => b.reason);

// ---------------------------------------------------------------------------
// Enquiries — the general-message inbox, in every status. One is "converted"
// and linked to a real demo booking below.
// ---------------------------------------------------------------------------

type EnquirySeed = {
  guestKey: string;
  message: string;
  status: NonNullable<NewEnquiry["status"]>;
  /** Link to the pending booking created for this guest+space, if any. */
  linkToBookingOfGuest?: string;
  createdOffset: number;
};

const ENQUIRIES: EnquirySeed[] = [
  { guestKey: "martins", message: "Can you do a birthday dinner for 14 on a Saturday?", status: "new", linkToBookingOfGuest: "martins", createdOffset: -3 },
  { guestKey: "lopes", message: "Do you have vegetarian options for a mixed group?", status: "new", createdOffset: -1 },
  { guestKey: "matos", message: "What does full-venue hire cost for ~80 people?", status: "converted", linkToBookingOfGuest: "matos", createdOffset: -6 },
  { guestKey: "costa", message: "Is the counter bookable in advance, or is it walk-up only?", status: "replied", createdOffset: -9 },
  { guestKey: "rodrigues", message: "Do you deliver? A friend mentioned Glovo.", status: "replied", createdOffset: -18 },
  { guestKey: "almeida", message: "Interested in photographing the smoker for a piece — who do I ask?", status: "archived", createdOffset: -25 },
];


// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function clearDemoData(): Promise<void> {
  const demoGuests = await db
    .select({ id: guests.id })
    .from(guests)
    .where(like(guests.email, `%@${DEMO_EMAIL_DOMAIN}`));
  const demoGuestIds = demoGuests.map((g) => g.id);

  // Order matters: enquiries reference bookings (nullable), bookings reference
  // guests (restrict), so remove children before parents.
  await db.delete(enquiries).where(like(enquiries.email, `%@${DEMO_EMAIL_DOMAIN}`));
  if (demoGuestIds.length) {
    await db.delete(bookings).where(inArray(bookings.guestId, demoGuestIds));
    await db.delete(guests).where(inArray(guests.id, demoGuestIds));
  }
  if (DEMO_BLACKOUT_REASONS.length) {
    await db.delete(blackouts).where(inArray(blackouts.reason, DEMO_BLACKOUT_REASONS));
  }
  console.log(
    `Cleared demo data: ${demoGuestIds.length} guests (with their bookings/enquiries) and demo blackouts.`
  );
}

async function seed(): Promise<void> {
  // KAU is one bookable space, seeded by migration 0003 (and narrowed by 0005).
  const spaceRows = await db.select().from(spaces);
  const bySlug = new Map(spaceRows.map((s) => [s.slug, s]));
  const space = bySlug.get("kau-barbecue");
  if (!space) {
    throw new Error(
      "Missing space kau-barbecue. Run migrations first (npm run db:migrate) so the booking platform is seeded."
    );
  }

  // --- Guests --------------------------------------------------------------
  const guestValues: NewGuest[] = GUESTS.map((g) => ({
    email: emailFor(g),
    firstName: g.firstName,
    lastName: g.lastName,
    phone: g.phone ?? null,
    notes: g.notes ?? null,
    createdAt: g.createdAt ?? undefined,
  }));
  const insertedGuests = await db
    .insert(guests)
    .values(guestValues)
    .returning({ id: guests.id, email: guests.email });
  const guestIdByKey = new Map<string, string>();
  for (const g of GUESTS) {
    const row = insertedGuests.find((r) => r.email === emailFor(g));
    if (row) guestIdByKey.set(g.key, row.id);
  }

  // --- Bookings ------------------------------------------------------------
  const usedReferences = new Set<string>();
  function uniqueReference(): string {
    let ref = makeReference();
    while (usedReferences.has(ref)) ref = makeReference();
    usedReferences.add(ref);
    return ref;
  }

  const bookingValues: NewBooking[] = BOOKINGS.map((b) => {
    const guestId = guestIdByKey.get(b.guestKey);
    if (!guestId) throw new Error(`Unknown guest key: ${b.guestKey}`);

    // One date, one sitting. The half-open range keeps the date-range queries
    // working: every reservation ends the day after it starts.
    const offset = openDayOffset(b.startOffset);
    const startDate: ISODate = addDays(today, offset);
    const endDate: ISODate = addDays(startDate, 1);
    const quote = computeQuote(space, startDate, endDate);
    const createdAt = ts(offset - b.leadDays);

    // Reservations are free, so most of these carry no money at all. Only a
    // booking that actually has a total gets a final price and a deposit.
    const isApproved = b.status === "approved";
    const finalTotalCents = isApproved ? quote.totalCents : null;
    const depositCents =
      isApproved && quote.totalCents > 0
        ? Math.round((quote.totalCents * 0.3) / 100) * 100
        : null;

    // Timeline: decisions land a day or two after the request; cancellations a
    // little after that.
    const decidedAt =
      b.status === "pending" ? null : ts(offset - b.leadDays + 2);
    const cancelledAt = b.status === "cancelled" ? ts(offset - 10) : null;
    const cancelRequestedAt =
      b.status === "cancelled" ? ts(offset - 11) : null;

    return {
      reference: uniqueReference(),
      spaceId: space.id,
      guestId,
      status: b.status,
      startDate,
      endDate,
      service: b.service,
      diningFormat: b.diningFormat,
      partySize: b.partySize,
      eventType: b.eventType ?? null,
      guestMessage: b.guestMessage ?? null,
      quotedTotalCents: quote.totalCents,
      finalTotalCents,
      depositCents,
      paymentStatus: b.paymentStatus ?? "unpaid",
      blocksEstate: b.blocksEstate ?? space.blocksEstate,
      source: b.source ?? "website",
      manageToken: makeManageToken(),
      decisionNote: b.decisionNote ?? null,
      adminNotes: b.adminNotes ?? null,
      cancelRequestedAt,
      decidedAt,
      cancelledAt,
      createdAt,
    } satisfies NewBooking;
  });
  const insertedBookings = await db
    .insert(bookings)
    .values(bookingValues)
    .returning({ id: bookings.id, guestId: bookings.guestId, status: bookings.status });

  // --- Blackouts -----------------------------------------------------------
  const blackoutValues: NewBlackout[] = BLACKOUTS.map((b) => {
    // Nudged onto an open day so each closure actually removes sittings —
    // closing a Wednesday the restaurant is already shut on shows nothing.
    const startDate: ISODate = addDays(today, openDayOffset(b.startOffset));
    return {
      // A closure with no space closes the whole restaurant.
      spaceId: null,
      startDate,
      endDate: addDays(startDate, b.days),
      reason: b.reason,
    } satisfies NewBlackout;
  });
  await db.insert(blackouts).values(blackoutValues);

  // --- Enquiries -----------------------------------------------------------
  const enquiryValues: NewEnquiry[] = ENQUIRIES.map((e) => {
    const guest = GUESTS.find((g) => g.key === e.guestKey)!;
    // A "converted" enquiry links to one of this guest's pending bookings.
    let bookingId: string | null = null;
    if (e.linkToBookingOfGuest) {
      const guestId = guestIdByKey.get(e.linkToBookingOfGuest);
      const match = insertedBookings.find(
        (b) => b.guestId === guestId && b.status === "pending"
      );
      bookingId = match?.id ?? null;
    }
    return {
      name: `${guest.firstName} ${guest.lastName}`,
      email: emailFor(guest),
      phone: guest.phone ?? null,
      spaceId: space.id,
      message: e.message,
      status: e.status,
      bookingId,
      createdAt: ts(e.createdOffset),
    } satisfies NewEnquiry;
  });
  await db.insert(enquiries).values(enquiryValues);

  // --- Summary -------------------------------------------------------------
  const counts = insertedBookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log("Demo data seeded:");
  console.log(`  • ${insertedGuests.length} guests`);
  console.log(
    `  • ${insertedBookings.length} bookings ` +
      `(${counts.approved ?? 0} approved, ${counts.pending ?? 0} pending, ` +
      `${counts.declined ?? 0} declined, ${counts.cancelled ?? 0} cancelled)`
  );
  console.log(`  • ${blackoutValues.length} closures`);
  console.log(`  • ${enquiryValues.length} enquiries`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Cannot seed the database.");
  }
  const resetOnly = process.argv.includes("--reset");

  console.log(
    resetOnly ? "Removing demo data…" : "Seeding demo data (clearing any previous demo run first)…"
  );
  await clearDemoData();
  if (resetOnly) {
    console.log("Done — demo data removed.");
    return;
  }
  await seed();
  console.log("Done. Open /admin to explore the pipeline, calendar and CRM.");
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
