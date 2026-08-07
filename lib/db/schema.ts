// Database schema, managed by Drizzle.
//
// Conventions used throughout:
//   - Money is stored as integer cents (never floats).
//   - Every reservation spans exactly one day: `end_date = start_date + 1`.
//     Ranges stay half-open [startDate, endDate) so two bookings that share a
//     boundary date do not overlap, and `service` says which sitting (lunch or
//     dinner) the party is coming for.
//   - Dates are plain calendar dates (Postgres `date`, read as "YYYY-MM-DD"
//     strings) in the restaurant's local time (Europe/Lisbon) — never
//     timestamps, so there is no timezone drift between the form, the calendar
//     and the database.
import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// The admin section is gated by real accounts stored here rather than a single
// shared password. Passwords are stored only as scrypt hashes (see
// `lib/auth/password.ts`) — the plaintext never touches the database.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ---------------------------------------------------------------------------
// Spaces — the bookable dining areas (table service, the Texan counter and
// full-venue private hire). The database is the source of truth for the public
// site; rows are seeded from the original lib/site.ts content and edited in
// the admin.
// ---------------------------------------------------------------------------

export const spaces = pgTable(
  "spaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    /** Short positioning line, e.g. "Classic table service". */
    kind: text("kind").notNull(),
    /** Short badge line shown on cards, e.g. "Smoked on Godzilla". */
    age: text("age").notNull(),
    /** Card-length summary. */
    blurb: text("blurb").notNull(),
    /** Long-form copy for the space's detail page. */
    description: text("description").notNull(),
    /** Path under /public, e.g. "/img/dining-room.jpg". */
    image: text("image").notNull(),
    features: text("features")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    /** Event spaces (private hire) are priced per day rather than free to book. */
    isEvent: boolean("is_event").notNull().default(false),
    /**
     * When true, an approved booking of this space closes the whole restaurant
     * (full-venue private hire), and this space is only available when nothing
     * else is booked for that sitting. Overridable per booking at approval
     * time.
     */
    blocksEstate: boolean("blocks_estate").notNull().default(false),

    /** 0 for reservation spaces; per event day when `isEvent` (0 = on request). */
    nightlyRateCents: integer("nightly_rate_cents").notNull(),
    /** Unused in the restaurant model — NULL everywhere. */
    weeklyRateCents: integer("weekly_rate_cents"),
    /** Unused in the restaurant model — 0 everywhere. */
    cleaningFeeCents: integer("cleaning_fee_cents").notNull().default(0),

    /** Always 1 — every reservation is a single day. */
    minNights: integer("min_nights").notNull().default(1),
    /** Largest party a single online booking may request. */
    maxGuests: integer("max_guests").notNull(),
    /** Total covers this space seats per sitting. */
    capacityCovers: integer("capacity_covers").notNull().default(0),
    /** Unused in the restaurant model — 0 everywhere. */
    bufferDays: integer("buffer_days").notNull().default(1),
    /** Shortest notice accepted; 0 allows same-day booking. */
    minLeadDays: integer("min_lead_days").notNull().default(2),
    /** ...and no further out than this many months. */
    maxHorizonMonths: integer("max_horizon_months").notNull().default(18),

    /** Secret path segment for this space's private iCal feed. */
    icalToken: text("ical_token")
      .notNull()
      .unique()
      .default(sql`md5(gen_random_uuid()::text || gen_random_uuid()::text)`),

    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("spaces_sort_idx").on(t.sortOrder)]
);

export type Space = typeof spaces.$inferSelect;
export type NewSpace = typeof spaces.$inferInsert;

// ---------------------------------------------------------------------------
// Guests — one row per person, deduplicated by email. Doubles as a lightweight
// CRM (notes, booking history via the bookings relation).
// ---------------------------------------------------------------------------

export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Stored lowercased; the unique key that deduplicates repeat guests. */
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  /** Private admin notes ("prefers the counter", "regular — always orders the beef rib"). */
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;

// ---------------------------------------------------------------------------
// Bookings — request-to-book: rows arrive as `pending` and only consume a
// sitting's covers once an admin approves them.
// ---------------------------------------------------------------------------

export const bookingStatus = pgEnum("booking_status", [
  "pending",
  "approved",
  "declined",
  "cancelled",
]);

export const paymentStatus = pgEnum("payment_status", [
  "unpaid",
  "deposit_paid",
  "paid",
  "refunded",
]);

/** Which sitting the party is booked for. */
export const bookingService = pgEnum("booking_service", ["lunch", "dinner"]);

export const bookingSource = pgEnum("booking_source", [
  "website",
  "phone",
  "email",
  "admin",
]);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Human-friendly code guests quote on the phone, e.g. "KAU-7KMQ4". */
    reference: text("reference").notNull().unique(),
    spaceId: uuid("space_id")
      .notNull()
      .references(() => spaces.id),
    guestId: uuid("guest_id")
      .notNull()
      .references(() => guests.id),
    status: bookingStatus("status").notNull().default("pending"),

    /** The day of the reservation (first day for private-hire events). */
    startDate: date("start_date", { mode: "string" }).notNull(),
    /** Exclusive end — always the day after `startDate` for reservations. */
    endDate: date("end_date", { mode: "string" }).notNull(),
    /**
     * Lunch or dinner. Nullable in the database (older rows predate it and
     * private hire can span both), but required by app validation.
     */
    service: bookingService("service"),
    partySize: integer("party_size").notNull(),
    /** The occasion, e.g. "Birthday", "Business lunch or dinner". */
    eventType: text("event_type"),
    /** The guest's message from the booking form. */
    guestMessage: text("guest_message"),

    /** 0 for reservations; the auto-computed event quote for private hire. */
    quotedTotalCents: integer("quoted_total_cents").notNull(),
    /** Owner-adjusted price, set at approval. Falls back to the quote. */
    finalTotalCents: integer("final_total_cents"),
    depositCents: integer("deposit_cents"),
    paymentStatus: paymentStatus("payment_status").notNull().default("unpaid"),

    /** Whether this booking closes the whole restaurant (private hire). */
    blocksEstate: boolean("blocks_estate").notNull().default(false),
    source: bookingSource("source").notNull().default("website"),

    /** Secret token for the guest's private status page. */
    manageToken: text("manage_token").notNull().unique(),

    /** Note included in the approval/decline email to the guest. */
    decisionNote: text("decision_note"),
    /** Private admin notes, never shown to the guest. */
    adminNotes: text("admin_notes"),

    /** Set when the guest asks to cancel from their status page. */
    cancelRequestedAt: timestamp("cancel_requested_at", { withTimezone: true }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("bookings_space_dates_idx").on(t.spaceId, t.startDate),
    index("bookings_status_idx").on(t.status),
    index("bookings_guest_idx").on(t.guestId),
  ]
);

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

// ---------------------------------------------------------------------------
// Blackouts — closure days. Spaces are open by default; a blackout closes a
// date range for one space (or the whole restaurant when spaceId is null) with
// an optional reason.
// ---------------------------------------------------------------------------

export const blackouts = pgTable(
  "blackouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Null = whole restaurant (e.g. closed for a private event). */
    spaceId: uuid("space_id").references(() => spaces.id, {
      onDelete: "cascade",
    }),
    startDate: date("start_date", { mode: "string" }).notNull(),
    /** Exclusive, like bookings: the space reopens on this day. */
    endDate: date("end_date", { mode: "string" }).notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("blackouts_space_dates_idx").on(t.spaceId, t.startDate)]
);

export type Blackout = typeof blackouts.$inferSelect;
export type NewBlackout = typeof blackouts.$inferInsert;

// ---------------------------------------------------------------------------
// Enquiries — general messages from the website's enquiry form; convertible
// into bookings from the admin.
// ---------------------------------------------------------------------------

export const enquiryStatus = pgEnum("enquiry_status", [
  "new",
  "replied",
  "converted",
  "archived",
]);

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    /** Optional: which space the enquiry is about. */
    spaceId: uuid("space_id").references(() => spaces.id, {
      onDelete: "set null",
    }),
    message: text("message").notNull(),
    status: enquiryStatus("status").notNull().default("new"),
    /** Set when the enquiry is converted into a booking. */
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("enquiries_status_idx").on(t.status)]
);

export type Enquiry = typeof enquiries.$inferSelect;
export type NewEnquiry = typeof enquiries.$inferInsert;

// ---------------------------------------------------------------------------
// Settings — small key/value store for restaurant-wide knobs edited in the admin
// (notification email, cancellation policy text, ...).
// ---------------------------------------------------------------------------

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Setting = typeof settings.$inferSelect;
