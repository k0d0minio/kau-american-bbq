# Vinecliff → KAU Barbecue: Full Rebrand & Adaptation Instructions

This document is the complete, self-contained work order for converting this codebase
from **Vine Cliff Vineyards** (a Lake Erie estate-rental site) into **KAU Barbecue**
(an American BBQ restaurant in Malveira, Portugal). Execute phases in order. Every
phase lists exact files, exact old values, and exact new values.

**Goal:** zero remaining Vinecliff references, and a landing page + admin + booking
system that models restaurant table reservations, not overnight stays.

---

## Ground rules

1. **Never run local builds, lint, typecheck, tests, or dev servers.** CI is the source
   of truth. Your job ends at making the edits (and `git push` if asked).
2. **Never edit `drizzle/0000_init_users.sql` or `drizzle/0002_booking_platform.sql`**
   (structural DDL — keep as-is). The seed migrations `0001` and `0003` MAY be edited
   in place because this is a fresh project with a fresh database (no commits exist on
   `main`, nothing has been deployed for KAU). New columns go in a NEW migration `0004`.
3. **Never fabricate business facts.** Everything KAU-specific you need is in the
   "KAU facts" section below. Where a fact is unknown (e.g. the restaurant's email
   address), use the marked `PLACEHOLDER` value and keep the `TODO(jamie)` comment next
   to it so Jamie can confirm later. Do not invent new prices, dates, or contact info.
4. Do not store any secret in plaintext. The admin seed uses a scrypt hash (see Phase 8).
5. Keep the existing component structure, file layout, and design system intact —
   this is a re-skin + booking-model adaptation, not a rewrite.
6. Site copy language: **English** (matches the existing codebase). A Portuguese
   translation is out of scope for this pass.

---

## KAU facts (single source of truth for all replacement content)

Use these values everywhere. Do not use any other business facts.

- **Name:** KAU Barbecue (short: "KAU"; wordmark: "KAU")
- **What it is:** American-style Texas barbecue restaurant — meats smoked low and slow,
  cut fresh and sold by weight.
- **Founders:** Rui and Vera Matias. Previously ran "O Bolo do Caco". The idea started
  after Rui tasted brisket in Paris, followed by a research trip to Texas. Built the
  brand through pop-ups, festivals (NOS Alive, Rock in Rio) and sports events before
  opening the permanent restaurant.
- **The smoker:** a huge custom smoker nicknamed **"Godzilla"** — the heart of the house.
- **Opened:** permanent location opened **July 28, 2026** in Malveira — the brand's
  "mother house", aiming to be one of the largest steakhouses in the country.
- **Address:** R. Dr. José Eduardo Esteves h1, 2665-248 Malveira, Portugal
- **Map URL:** `https://www.google.com/maps/search/?api=1&query=R.+Dr.+José+Eduardo+Esteves+h1+Malveira`
- **Phone:** +351 968 163 165 (`tel:+351968163165`)
- **Email:** `reservas@kaubarbecue.pt` — **PLACEHOLDER**,`// TODO(jamie): confirm email`  ==> JAMIE CONFIRMED reservas@kaubarbecue.pt
- **Instagram:** `@kau_barbecue` → `https://www.instagram.com/kau_barbecue/`
- **Site URL:** `https://kau-american-bbq.vercel.app` — `// TODO(jamie): confirm production domain` ==> JAMIE CONFIRMED "kaubarbecue.jamienisbet.com"
- **Open days:** Thursday–Sunday (closed Monday–Wednesday)
- **Services:** Lunch **12:00–15:00**, Dinner **19:00–22:00**
- **Reservations:** mandatory online booking; the opening sold out within hours.
- **Two dining formats:** classic **table service**, and the **Texan counter** where the
  tray is assembled in the moment — meats cut, weighed and served straight to you.
- **Price guide:** roughly €15–€20 per person for standard items; premium cuts by weight.
- **Menu (by weight, real prices — usable in copy):**
  - Brisket Black Angus — €58/kg
  - Beef rib Black Angus — €70/kg
  - Tomahawk Wagyu SRF — €160/unit
  - Brisket Wagyu SRF — €70/kg
  - St. Louis pork ribs — €45/kg
  - French pork rib — €45/kg
  - Pulled pork — €39/kg
  - Smoked turkey breast — €36/kg
  - Sides & vegetarian options: smoked eggplant, potato salad, coleslaw, mac & cheese, nachos
- **Delivery:** available via Glovo.
- **Press sources (for the Story page):**
  1. Forbes Portugal — "KAU: como uma paixão pelo barbecue americano se transformou num fenómeno de negócio em Portugal" — https://www.forbespt.com/kau-como-uma-paixao-pelo-barbecue-americano-se-transformou-num-fenomeno-de-negocio-em-portugal/
  2. Time Out Lisboa — "O Kau está a chegar à Malveira com uma revolução no barbecue" — https://www.timeout.pt/lisboa/pt/noticias/o-kau-esta-a-chegar-a-malveira-com-uma-revolucao-no-barbecue-041026
  3. Time Out Lisboa — "A espera acabou: Kau Barbecue abre portas e as reservas já estão quase esgotadas" — https://www.timeout.pt/lisboa/pt/noticias/a-espera-acabou-kau-barbecue-abre-portas-e-as-reservas-ja-estao-quase-esgotadas-072826
  4. A Mensagem — "Kau BBQ, 101 restaurantes, Lisboa" — https://amensagem.pt/2025/09/14/kau-bbq-101-restaurantes-lisboa/
  5. NiT — "Kau leva a carne defumada para a mata da Malveira" — https://www.nit.pt/comida/restaurantes/kau-leva-a-carne-defumada-para-a-mata-da-malveira-com-passagem-pelo-nos-alive
  6. Restaurant Guru — Kau Barbecue Malveira — https://restaurantguru.com/Kau-Barbecue-Malveira

---

## The one structural change (read before Phase 1)

Everything else in this document is copy/config/asset replacement, but the booking
model itself must change. Today it models **multi-night venue rental**: bookings are
half-open date ranges `[start_date, end_date)`, **one approved booking blocks the whole
space** for those dates (plus turnover buffer days), and prices are per-night USD with
weekly rates and cleaning fees.

A restaurant reservation is: **one date + one service (lunch or dinner) + a party
size**, where a space (dining area) holds **many bookings per service up to a cover
capacity**. The adaptation (Phase 2) is deliberately minimal and additive:

- Add `service` (`lunch` | `dinner`) to `bookings` and `capacity_covers` to `spaces`
  in a new migration `0004`.
- Keep `start_date`/`end_date`; every reservation uses `end_date = start_date + 1 day`.
- Availability changes from "range overlap blocks the space" to "sum of approved covers
  for (space, date, service) must stay ≤ `capacity_covers`" — except `blocks_estate`
  spaces (full-venue private hire), which keep the exclusive behaviour.
- Open days (Thu–Sun) are enforced in `lib/booking/availability.ts`.
- Pricing/quotes are **removed from the guest flow** (reservations are free); the
  pricing module stays for the private-hire space and admin manual totals, converted
  to EUR.

Column names like `nightly_rate_cents`, `min_nights`, `buffer_days`, `blocks_estate`
stay in the database (renaming columns is not worth a destructive migration), but all
**labels, comments, and UI copy** stop saying nights/estate. Reinterpretation table:

| Column | New meaning |
|---|---|
| `nightly_rate_cents` | Set to 0 for reservation spaces. For private hire: per-event-day rate in euro cents (0 = "price on request"). |
| `weekly_rate_cents` | Unused — NULL everywhere. |
| `cleaning_fee_cents` | Unused — 0 everywhere. |
| `min_nights` | Always 1. |
| `max_guests` | Max party size for a single online booking. |
| `capacity_covers` (new) | Total covers per service for the space. |
| `buffer_days` | Always 0. |
| `min_lead_days` | 0 (same-day booking allowed while the service hasn't started). |
| `max_horizon_months` | 3 (how far ahead reservations open). |
| `blocks_estate` | "Blocks the whole restaurant" — true only for full-venue private hire. |
| `age` | Repurposed as a short badge line, e.g. "Est. 2026" or "Smoked on Godzilla". |
| `service` (new, bookings) | `'lunch'` or `'dinner'`. Nullable in DB; required by app validation. |

---

## Phase 1 — Global identity & configuration

### 1.1 `lib/site.ts` — replace the entire `site` object

```ts
export const site = {
  name: "KAU",
  fullName: "KAU Barbecue",
  tagline: "American barbecue, smoked low and slow in Malveira",
  description:
    "Texas-style barbecue in the heart of Malveira — brisket, beef ribs and pulled pork smoked low and slow on our custom smoker, Godzilla, cut fresh and sold by weight. Table service or the authentic Texan counter. Thursday to Sunday, lunch and dinner.",
  phone: "+351 968 163 165",
  phoneHref: "tel:+351968163165",
  email: "reservas@kaubarbecue.pt", // TODO(jamie): confirm email CONFIRMED BY JAMIE
  instagram: "https://www.instagram.com/kau_barbecue/",
  address: {
    line1: "R. Dr. José Eduardo Esteves h1",
    city: "Malveira",
    region: "Lisboa",
    postalCode: "2665-248",
    country: "Portugal",
    full: "R. Dr. José Eduardo Esteves h1, 2665-248 Malveira, Portugal",
  },
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=R.+Dr.+José+Eduardo+Esteves+h1+Malveira",
  url: "https://kaubarbecue.jamienisbet.com",
} as const;
```

Also in `lib/site.ts`:
- Replace the `spaces[]` fallback array with the three KAU spaces from Phase 3
  (same `Space` shape; use the new images from Phase 7).
- Replace `gallery[]` with the six new image entries from Phase 7 (BBQ alts, e.g.
  "Brisket being sliced at the Texan counter", "Godzilla, the custom smoker, at work").
- Replace `nearby[]` (used by the Location section) with:
  ```ts
  export const nearby = [
    { name: "Mafra", note: "The Royal Convent and town — 10 minutes away" },
    { name: "Ericeira", note: "World Surfing Reserve, beaches and seafood" },
    { name: "Lisbon", note: "The capital, around 35 minutes down the A8" },
    { name: "Malveira market", note: "One of the region's great traditional markets" },
  ] as const;
  ```

### 1.2 Package identity
- `package.json` line 2: `"name": "vinecliff"` → `"name": "kau-barbecue"`.
- `package-lock.json` lines 2 and 8: `"vinecliff"` → `"kau-barbecue"` (both `name` fields).

### 1.3 `.env.example`
- `RESEND_FROM="Vine Cliff <onboarding@resend.dev>"` → `RESEND_FROM="KAU Barbecue <onboarding@resend.dev>"`.

### 1.4 Identifiers
- `lib/auth/session.ts`: `ADMIN_SESSION_COOKIE = "vc_admin_session"` → `"kau_admin_session"`.
- `lib/booking/tokens.ts`: reference prefix `` `VC-${code}` `` → `` `KAU-${code}` ``; update the doc comment example to `KAU-7KMQ4`.
- `lib/db/schema.ts` comment mentioning `"VC-7KMQ4"` → `"KAU-7KMQ4"`.
- `scripts/seed-demo.ts`: `DEMO_EMAIL_DOMAIN = "demo.vinecliff.dev"` → `"demo.kaubarbecue.dev"`.
- `app/api/ical/[token]/route.ts`:
  - `PRODID:-//Vine Cliff//Availability//EN` → `PRODID:-//KAU Barbecue//Availability//EN`
  - `X-WR-CALNAME:Vine Cliff — {name}` → `X-WR-CALNAME:KAU Barbecue — {name}`
  - `UID:...@vinecliff` → `@kaubarbecue`
  - filename `vinecliff-{slug}.ics` → `kau-{slug}.ics`
  - Event summary `"Estate reserved"` → `"Fully booked — private hire"`; uid prefix `estate-` → `venue-`.
  - Header comment: drop "paste into Airbnb/VRBO"; say "Subscribe from Google Calendar to see bookings and closures."

### 1.5 `info.txt`
Replace the whole file with the KAU equivalent:
```
R. Dr. José Eduardo Esteves h1, 2665-248 Malveira, Portugal

+351 968 163 165

KAU Barbecue is an American-style Texas barbecue restaurant in Malveira, created by Rui and Vera Matias. Meats are smoked low and slow on the custom smoker "Godzilla", cut fresh and sold by weight — table service or the authentic Texan counter. Open Thursday to Sunday for lunch (12:00–15:00) and dinner (19:00–22:00). Online reservation required.
```

### 1.6 `README.md`
Rewrite fully. Keep the same section structure (what it is, stack, routes, data model,
admin, env vars, CI). New identity: "KAU Barbecue — website and reservation platform
for KAU, the Texas-style barbecue restaurant in Malveira, Portugal." Update:
- Domain model description: spaces = dining areas (table service, Texan counter,
  full-venue private hire); bookings = date + lunch/dinner service + party size with
  per-service cover capacity; blackouts = closure days; enquiries; settings.
- Replace `LodgingBusiness` mention with `Restaurant` structured data.
- Palette description → "charcoal, bone, smoke and ember — a Texan smokehouse palette".
- Remove `wpcarlson@gmail.com`; document that the admin account comes from
  `0001_seed_admin_user` with Jamie's placeholder (Phase 8).
- Remove Airbnb/VRBO iCal framing.

---

## Phase 2 — Booking model adaptation (schema + logic)

### 2.1 New migration `drizzle/0004_restaurant_model.sql`

```sql
CREATE TYPE "booking_service" AS ENUM ('lunch', 'dinner');

ALTER TABLE "bookings" ADD COLUMN "service" "booking_service";
ALTER TABLE "spaces" ADD COLUMN "capacity_covers" integer NOT NULL DEFAULT 0;
```

Register it in `drizzle/meta/_journal.json` following the existing entry pattern
(idx 4, tag `0004_restaurant_model`, same `version`/`dialect` as prior entries, a
plausible `when` timestamp larger than entry 3). Do NOT hand-write a meta snapshot
JSON — the journal entry plus the SQL file is enough for `scripts/migrate.ts`
(neon-http migrator reads the journal + SQL only).

### 2.2 `lib/db/schema.ts`
- Add matching Drizzle definitions: `bookingService = pgEnum("booking_service", ["lunch","dinner"])`;
  `service: bookingService("service")` on `bookings`; `capacityCovers: integer("capacity_covers").notNull().default(0)` on `spaces`.
- Rewrite the file-header comment: dates are plain calendar dates in the **restaurant's
  local time (Europe/Lisbon)**; every reservation spans exactly one day
  (`end_date = start_date + 1`); `service` says which sitting.
- Sweep every column comment: remove "estate", "farmhouse, carriage house, barn",
  "checkout", "nights", "turnover", "estate winterized", "Airbnb/VRBO", "lake room",
  "repeat wedding client". New vocabulary: dining areas, covers, sittings, closures.
  Example replacements: `blocks_estate` comment → "an approved booking of this space
  closes the whole restaurant (full-venue private hire)"; `guests.notes` example →
  `"prefers the counter", "regular — always orders the beef rib"`; `blackouts` null
  space comment → `"Null = whole restaurant (e.g. closed for a private event)"`.

### 2.3 `lib/booking/dates.ts`
- Timezone: `America/New_York` → `Europe/Lisbon`.
- Rename `todayAtEstate()` → `todayAtRestaurant()` and update all call sites
  (grep `todayAtEstate` — ~10 files including `app/spaces/[slug]/actions.ts`,
  `scripts/seed-demo.ts`, admin actions, queries).
- All `Intl.DateTimeFormat("en-US", …)` → `"en-GB"` (keeps English copy, gives
  "Fri 5 Jun 2026"-style European formatting). Keep `en-CA` where it is used purely
  to produce ISO `YYYY-MM-DD`.
- Update header comment ("the estate's local calendar" → "the restaurant's local
  calendar (Europe/Lisbon)"); `diffDays` doc no longer mentions "nights in a stay".

Also fix the second hardcoded timezone: `app/admin/(app)/enquiries/page.tsx` uses
`toLocaleDateString("en-US", { …, timeZone: "America/New_York" })` → `"en-GB"` /
`"Europe/Lisbon"`.

### 2.4 `lib/booking/availability.ts` — rewrite for per-slot capacity
Keep it a pure, DB-free module. New model:

```ts
export const SERVICES = ["lunch", "dinner"] as const;
export type Service = (typeof SERVICES)[number];
export const SERVICE_LABELS: Record<Service, string> = {
  lunch: "Lunch · 12:00–15:00",
  dinner: "Dinner · 19:00–22:00",
};
// Thursday(4) through Sunday(0). getUTCDay() on the parsed ISO date.
export const OPEN_WEEKDAYS = new Set([0, 4, 5, 6]);
```

- `BookingBlock` gains `service: Service | null` and `partySize: number`.
- Full-venue logic stays: an approved booking whose space has `blocksEstate`
  (rename the field in types/UI wording to "blocks the venue") makes its date+service
  unavailable for every space; conversely a full-venue request needs zero existing
  covers that date+service.
- New validation `validateRequest(space, request, today, blocks, blackouts)` checks,
  in order, returning `{ ok:false, error }` with these guest-facing strings:
  1. Valid date → `"Please pick a valid date."`
  2. Valid service → `"Please choose lunch or dinner."`
  3. Open weekday → `"We're open Thursday to Sunday — please pick another day."`
  4. Not in the past, within `maxHorizonMonths` → `"Reservations are open up to {n} months ahead for now."`
  5. Party size ≥ 1 → `"Please tell us how many people are coming."`
  6. Party size ≤ `maxGuests` → `"For groups larger than {maxGuests}, call us or send an enquiry — we'll sort something out."`
  7. Not blacked out → `"We're closed that day — please pick another date."`
  8. Capacity: sum of approved `partySize` for same (space, date, service) +
     requested ≤ `capacityCovers`, and no venue-blocking booking overlaps →
     `"That sitting is fully booked — try the other sitting or another day."`
- Delete buffer-day padding and min-nights logic. Keep `bookingWindow` but base it
  on `minLeadDays` (0) and `maxHorizonMonths`.

### 2.5 `lib/booking/pricing.ts`
- `Intl.NumberFormat("en-US", { currency: "USD" })` → `Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" })` (gives `€450` / `€1,234.56` — matches the English-language site).
- Remove weekly-rate and cleaning-fee logic; `computeQuote` becomes: for `isEvent`
  spaces only, `days × nightlyRateCents` with label `"{n} day(s) × {money}"`; for
  reservation spaces return a zero-total quote with no lines. Keep the exported
  types so callers still compile; `unitLabel` → `"day"/"days"` only.

### 2.6 `lib/booking/event-types.ts`
```ts
export const EVENT_TYPES = [
  "Birthday",
  "Anniversary or celebration",
  "Business lunch or dinner",
  "Group or team meal",
  "Full-venue private event",
  "Other",
] as const;
```

### 2.7 `lib/db/queries.ts`
- `getAvailabilityData` no longer needs the ±31-day buffer padding — fetch exact
  window; include `service` and `party_size` in `BookingBlock` mapping.
- `getDashboardData`: `arrivalsSoon` (next 14 days) stays but rename copy usage to
  "Upcoming reservations"; `monthRevenueCents` keeps working (private hire / manual
  totals) — label change happens in the dashboard page (Phase 5).
- Sweep comments for estate/stay vocabulary.

### 2.8 Guest booking flow
`app/spaces/[slug]/booking-panel.tsx` — single-date + service picker:
- Calendar selects **one day** (no ranges). Remove range prompts, "check-in/checkout",
  minimum-stay line, and the estimate/quote block entirely.
- Below the calendar add a **service toggle**: two options rendered from
  `SERVICE_LABELS` (Lunch · 12:00–15:00 / Dinner · 19:00–22:00). Required.
- Party-size field label: `"How many people?"` (default 2, max `maxGuests`).
- Occasion select (from `EVENT_TYPES`) stays, now shown for all spaces, optional,
  labelled `"Occasion (optional)"`.
- Message placeholder: `"Allergies, highchairs, a birthday surprise — anything we should know?"`
- Week header starts **Monday**: `["Mo","Tu","We","Th","Fr","Sa","Su"]`, and adjust
  the leading-blank calculation accordingly (`(getUTCDay() + 6) % 7`).
- Closed weekdays (Mon–Wed) render as unavailable.
- Fine print: `"Submitting sends a reservation request — nothing is charged online. We confirm by email."`
- Buttons: `"Request a table"` / `"Sending your request…"`.

`app/spaces/[slug]/actions.ts` — accept `service`, validate via the new
`validateRequest`, write `service` to the booking, set `endDate = addDays(date, 1)`,
`quotedTotalCents: 0` (or the event quote for `isEvent` spaces). Error fallback:
`"Something went wrong sending your request. Please try again, or call us."` (keep).

`app/spaces/[slug]/page.tsx`:
- Facts row: replace `space.age` / "Up to {n} guests" / "From {money} / night" with
  `space.age` badge, `"Tables up to {maxGuests}"`, `"Thu–Sun · lunch & dinner"`.
- Delete the `rateRows` Rates section for non-event spaces; for the private-hire
  space show `"Private hire"` with `"Price on request"` when rate is 0.
- `blocksEstate` note → `"Private hire closes the whole restaurant to other guests — the room, the counter and Godzilla are all yours."`
- Footer strip eyebrow `"Also on the estate"` → `"Also at KAU"`.
- Back link `"All spaces"` → `"All ways to eat"`.

`app/bookings/[token]/page.tsx` — new `STATUS_CONTENT`:
- pending: title `"Request received"`, body `"We review every request personally and will confirm by email — usually within a few hours."`
- approved: title `"Your table is booked"`, body `"See you in Malveira — come hungry."`
- completed: title `"Thanks for eating with us"`, body `"This reservation is done and dusted. We'd love to see you at KAU again."`
- declined: title `"We couldn't seat you this time"`, body `"See our email for details — the other sitting or another day often works, so do get in touch."`
- cancelled: title `"This reservation is cancelled"`, body `"If that's a surprise, or you'd like to rebook, call or email us any time."`
- `detailRows`: Reference / Space → `"Where"` / `"Date"` (single) / `"Sitting"`
  (from `SERVICE_LABELS`) / `"Party size"` / Occasion / `"Booked by"`. Remove
  check-in/checkout rows and payment lines for zero-total bookings (keep payment
  lines when a total > 0 exists, wording unchanged except "before arrival" →
  "before the event").
- Section `"Cancellation policy"` stays (content comes from settings, Phase 8).

`app/bookings/[token]/cancel-controls.tsx` — replace "dates will be released" with
`"Withdraw your request? The table goes back on sale straight away."`; keep the rest,
swapping "booking" wording to "reservation".

### 2.9 `tests/booking.test.ts`
Rewrite to cover the new model: EUR formatting assertions (`formatMoney(4500)` →
`"€45"`, `formatMoney(123456)` → `"€1,234.56"`), open-weekday rejection (a Tuesday),
capacity summing (two approved 4-tops + a 5-top request against capacity 12 fails;
against 13 passes), venue-blocking exclusivity both directions, past-date and
horizon rejection, party-size cap message. Use KAU space fixtures
(`table-service`, capacity 60, maxGuests 8; `private-hire`, `isEvent: true`,
`blocksEstate: true`). Do not run the tests — CI will.

---

## Phase 3 — Spaces: the three KAU bookable experiences

Used in: `drizzle/0003_seed_booking_platform.sql` (rewrite the 4 INSERTs → 3),
`lib/site.ts` fallback `spaces[]`, and referenced by slug in `scripts/seed-demo.ts`.

| | 1 | 2 | 3 |
|---|---|---|---|
| slug | `table-service` | `texan-counter` | `private-hire` |
| name | The Dining Room | The Texan Counter | Full House — Private Hire |
| kind | Classic table service | Tray service, Texas-style | Events & buyouts |
| age | Est. 2026 | Smoked on Godzilla | The whole smokehouse |
| image | `/img/dining-room.jpg` | `/img/counter.jpg` | `/img/smoker.jpg` |
| is_event | false | false | true |
| blocks_estate | false | false | true |
| nightly_rate_cents | 0 | 0 | 0 |
| weekly_rate_cents | NULL | NULL | NULL |
| cleaning_fee_cents | 0 | 0 | 0 |
| min_nights | 1 | 1 | 1 |
| max_guests | 8 | 6 | 120 |
| capacity_covers | 60 | 24 | 120 |
| buffer_days | 0 | 0 | 0 |
| min_lead_days | 0 | 0 | 14 |
| max_horizon_months | 3 | 3 | 6 |
| sort_order | 1 | 2 | 3 |

> `// TODO(jamie): confirm real cover capacities and party-size caps with KAU` JAMIE CONFIRMED: use the current cover placed in this table, make it configurable and we can add that setting to the back office in the admin section.
> — put this comment at the top of the seed block and keep the numbers above as
> sensible defaults (editable in admin).

Blurbs:
- **table-service:** "Sit down, order from the table and let the meat come to you — brisket, ribs and all the fixings, straight off Godzilla and carved to order."
- **texan-counter:** "The real-deal Texas experience: step up to the counter, watch your meats cut and weighed in the moment, and carry your tray to the table."
- **private-hire:** "Take over the whole smokehouse — the dining room, the counter and Godzilla at full smoke — for birthdays, company feasts and celebrations that need serious meat."

Features arrays:
- table-service: `['Full table service','Tables for 2–8','All meats by weight','Sides, sauces & desserts']`
- texan-counter: `['Cut & weighed in front of you','Fastest way to the meat','Counter & communal seating','Same smoke, no waiting']`
- private-hire: `['Up to 120 guests','Whole-venue exclusivity','Custom feast menus','Godzilla at full smoke']`

Long `description` fields (two paragraphs each, `\n\n`-separated) — write them from
the blurbs + KAU facts (menu items, Godzilla, Rui & Vera, "one of the largest
steakhouses in the country"). No invented facts.

Wherever the hardcoded slug list appears — `scripts/seed-demo.ts` guard
(`["farmhouse","carriage-house","barn","estate"]`) and `lib/spaces.ts`
(`isEstate: space.slug === "estate"`) — update:
- seed guard → `["table-service","texan-counter","private-hire"]`
- `lib/spaces.ts`: `isEstate` → rename to `isFullVenue`, driven by
  `space.slug === "private-hire"`; `fromLabel` → for reservation spaces
  `"Free to book · reserve online"`, for private hire `"Price on request"`.
  Update `app/sections/spaces.tsx` accordingly (it consumes these fields).

---

## Phase 4 — Public site copy

### 4.1 `app/layout.tsx`
- Keywords: `["KAU Barbecue","American barbecue Portugal","Texas BBQ Lisboa","brisket Portugal","barbecue Malveira","restaurante Malveira","smoked meat Portugal"]`.
- `openGraph.locale` → `"en_US"` is fine to keep; `<html lang="en">` stays.
- `themeColor` → the new charcoal `#1c1917` (Phase 6).
- JSON-LD → 
  ```ts
  {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.fullName, description: site.description, telephone: site.phone,
    url: site.url, servesCuisine: "American barbecue", priceRange: "€€",
    address: { "@type": "PostalAddress", streetAddress: site.address.line1,
      addressLocality: site.address.city, postalCode: site.address.postalCode,
      addressCountry: "PT" },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Thursday","Friday","Saturday","Sunday"],
        opens: "12:00", closes: "15:00" },
      { "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Thursday","Friday","Saturday","Sunday"],
        opens: "19:00", closes: "22:00" },
    ],
    acceptsReservations: "True",
  }
  ```

### 4.2 `app/components/nav.tsx`
- `sectionLinks`: `#spaces` → label `"Book a Table"`; `#estate` → id stays (see 4.4)
  label `"The Smokehouse"`; `"Gallery"` keeps; `"Location"` keeps; `/history` link
  label `"Our Story"`.
- Wordmark `Vine&nbsp;Cliff` → `KAU`; badge `Est. 1850` → `American Barbecue`.
- Mobile drawer `Vine Cliff` → `KAU Barbecue`. CTAs keep (`Enquire`, phone).

### 4.3 `app/sections/hero.tsx`
- Image `/img/hero-smokehouse.jpg` (Phase 7), alt `"Smoke rising from Godzilla, KAU's custom smoker, outside the Malveira smokehouse"`.
- Eyebrow: `Texas-style barbecue · Malveira, Portugal`
- H1: `Low and slow,` / italic `worth the wait`
- Sub: `Brisket, beef ribs and pulled pork smoked for hours on Godzilla, our custom smoker — cut fresh, sold by weight, and served the way Texas intended. Thursday to Sunday, lunch and dinner.`
- CTAs: `Book a table` (→ `#spaces`), `Plan a private feast` (→ `#location` stays or `/enquire`); scroll cue unchanged.

### 4.4 `app/sections/estate.tsx` → the Smokehouse section
Keep the file name and section `id="estate"` (renaming the anchor id is optional; if
renamed to `id="smokehouse"`, update nav.tsx and the hero scroll cue together).
- `stats`: `[{ value: "12h+", label: "In the smoke" }, { value: "8", label: "Meats by weight" }, { value: "1", label: "Godzilla — our smoker" }]`
- Eyebrow `The Smokehouse`; H2 `Real fire, real smoke, real patience`
- p1: `KAU started with a bite of brisket in Paris and a pilgrimage to Texas. Years of pop-ups, festivals and sold-out events later, Rui and Vera Matias opened the doors of their mother house in Malveira — one of the largest steakhouses in the country.`
- p2: `Everything runs through Godzilla, our custom smoker. Meats go in before sunrise and come out hours later — carved in the moment, weighed at the counter, and served while the smoke ring is still proud.`
- Image `/img/dining-room.jpg`, alt `"Inside the KAU smokehouse dining room in Malveira"`.
- Floating card quote: `"These guys really understand what American BBQ is."` + eyebrow `Guest review · Google`.

### 4.5 `app/sections/spaces.tsx`
- Eyebrow `Book a Table`; H2 `Two ways to eat, one big smoker`
- Sub: `Sit down for classic table service, or go full Texas at the counter — trays built in the moment, meats cut and weighed in front of you. Online reservation required; sittings sell out fast.`
- Full-venue banner (`isFullVenue`): H3 `Take over the whole smokehouse` — keep the
  KeyRound icon and `{fromLabel} · View & book` link.
- Card link `View & book` keeps. Grid stays 3 columns (now 2 cards + banner —
  change grid to `md:grid-cols-2` for the cards).

### 4.6 `app/sections/gallery.tsx`
- Eyebrow `Gallery`; H2 `From the smoke to the table`
- Sub: `Brisket at sunrise, trays at noon, and Godzilla breathing smoke all day — a look inside KAU.`

### 4.7 `app/sections/location.tsx`
- Image `/img/exterior.jpg`, alt `"The KAU Barbecue smokehouse in Malveira"`.
- Eyebrow `Find Us`; H2 `In the heart of Malveira`
- Sub: `Twenty-five minutes from Lisbon and ten from Mafra, KAU sits in the centre of Malveira — easy to reach, hard to leave. Also on Glovo if the sofa wins.`
- Map card + `Get directions` button unchanged (uses `site.mapUrl`).

### 4.8 `app/sections/booking-cta.tsx`
- Parallax image `/img/brisket.jpg`, alt `"Sliced Black Angus brisket on a KAU tray"`.
- Pill: `Online reservations — mandatory & free`
- H2: `Get your seat at the smoker`
- Sub: `We opened with every table gone in hours, and weekends still sell out. Pick your day, pick lunch or dinner, and we'll confirm by email — nothing is charged online.`
- CTAs `Book a table` (→ `#spaces`), `Send an enquiry` (→ `/enquire`); phone line keeps.

### 4.9 `app/components/footer.tsx`
- Wordmark `KAU`; eyebrow `American Barbecue · Malveira`.
- Blurb: `{site.tagline}. Thursday to Sunday — lunch 12:00–15:00, dinner 19:00–22:00.`
- Add an Instagram link (`site.instagram`, label `@kau_barbecue`) in the `Enquire` column.
- Bottom: `© {year} KAU Barbecue. All rights reserved.` / `Smoked daily in Malveira, Portugal.`

### 4.10 `/history` → "Our Story"
Keep the route, page structure, `Cite` component, and section components — replace
content only.

`lib/history.ts` — replace the three arrays:
- `sources`: the 6 press sources from the KAU facts section (`kind`: use
  `"Press"` for all — also update the `Source["kind"]` union to
  `"Press" | "Reference"`).
- `timeline` (cites pointing at the matching sources):
  - `{ year: "A bite in Paris", title: "Where it started", body: "Rui Matias tastes real brisket in Paris — and can't let it go. A trip to Texas follows, to learn barbecue where barbecue was born." }`
  - `{ year: "The pop-up years", title: "Festivals & sell-outs", body: "KAU builds its name the hard way: pop-ups, sports events and festival crowds at NOS Alive and Rock in Rio, selling out event after event." }`
  - `{ year: "2026", title: "Godzilla comes home", body: "The abandoned space in Malveira — spotted on a basketball run with their son — becomes the mother house, built around a custom smoker big enough to earn the name Godzilla." }`
  - `{ year: "July 28, 2026", title: "Doors open", body: "KAU Barbecue opens in Malveira and reaches full capacity within hours. Thursday to Sunday, the smoke hasn't stopped since." }`
- `figures`: Rui Matias (role `Founder & pitmaster`), Vera Matias (role
  `Co-founder`), and Godzilla (role `The smoker`, life `Malveira, 2026`) — images
  from Phase 7 (`/img/story/rui.jpg`, `/img/story/vera.jpg`, `/img/story/godzilla.jpg`).
  Paragraphs drawn strictly from KAU facts (O Bolo do Caco background, Paris/Texas,
  pop-ups, the Malveira space). Update the `Figure` fields (`life` can hold a short
  line like `"From O Bolo do Caco to KAU"`).
- Delete `public/img/history/` images (Phase 7 covers replacements).

`app/history/page.tsx` — metadata title `Our Story`, description
`"How a bite of brisket in Paris became KAU Barbecue — Rui and Vera Matias' Texas-style smokehouse in Malveira, built around a smoker called Godzilla."`
OG title `Our Story · KAU Barbecue`.

`app/history/sections.tsx` — rewrite each section's copy in the same slots:
- Hero eyebrow `Our Story · Malveira`; H1 `The couple who` / italic `brought Texas home`; hero image `/img/exterior.jpg`.
- Lede eyebrow `A short history`; H2 `From a Paris brisket to the Malveira smokehouse`; pull-quote: `"These guys really understand what American BBQ is."` attributed `Guest review, Google`.
- Timeline H2 `The story so far`.
- Figures eyebrow `The people (and the smoker)`; H2 `Three names behind the smoke`. Remove the `sepia-[0.15]` filter.
- The "Vineyards" stats section → `scaleStats`: `[{ value: "12h+", label: "Low & slow on Godzilla" }, { value: "8", label: "Smoked meats by weight" }, { value: "Thu–Sun", label: "Lunch & dinner" }]`; eyebrow `The mother house`; H2 `One of the biggest steakhouses in the country`; paragraph from KAU facts.
- Today section: image `/img/counter.jpg`; eyebrow `KAU today`; H2 `Come hungry`; CTA `Book a table` → `/#spaces`.
- Sources: keep structure; accuracy note → `"Details above come from the press coverage below; menus and prices change — the restaurant is the final word."`; back link `Back to KAU` → `/`.

### 4.11 `/enquire`
- `page.tsx` metadata description: `"Ask us anything about group meals, private hire and events at KAU — we read every enquiry personally."`
- H1 keeps; sub: `"Planning a party of twelve, a company feast, or something that doesn't fit a form? Write to us — a real person at the smokehouse reads every message."`
- `enquiry-form.tsx`: default space option `"Not sure yet"`; message placeholder
  `"A birthday dinner for 12, a company lunch, a full-venue takeover…"`; success
  copy: replace `"…call us and we'll pick up from the porch."` with
  `"…call us and we'll answer between briskets."`; fine print → `"Ready to pick a date? Reservations are free and confirmed by email."`
- `actions.ts` error strings keep (they're brand-free).

---

## Phase 5 — Admin

### 5.1 Chrome & identity
- `app/admin/(app)/layout.tsx`: title template `"%s · KAU Admin"`.
- `app/admin/(app)/components/sidebar.tsx`: brand `KAU` + eyebrow `Smokehouse Admin`; mobile monogram `KAU`; `aria-label="KAU admin home"`.
- `app/admin/login/page.tsx`: brand `KAU`, eyebrow `Smokehouse Admin`, line `"This area is private to the KAU team."`
- `lib/admin.ts` nav descriptions:
  - Dashboard → "Overview of activity across the restaurant."
  - Bookings → "Reservation requests to review, plus every table and event."
  - Calendar → "Month view across sittings, with closure dates."
  - Guests → "Everyone who has booked or asked to, with notes."
  - Enquiries → keeps.
  - Spaces → "The dining room, the counter and private hire."
  - Gallery → "Photography shown on the public site."
  - Settings → keeps.

### 5.2 Copy sweep (same files, venue vocabulary → restaurant vocabulary)
- `(app)/page.tsx` dashboard: description `"A home base for managing reservations, enquiries and everything guests see on the KAU website."`; tiles: `"Requests to review"` keeps, `"Arriving in the next 14 days"` → `"Reservations in the next 14 days"`, money tile label → `"Booked value for {month}"`; empty states: `"No pending requests — new ones land here the moment guests book online."` / `"No reservations in the next two weeks."` Rows: show single date + service label + `"{n} covers"` instead of date-range + guests.
- `bookings/page.tsx`: description `"Reservation requests to review, plus every table and event at KAU."`; row shows date · sitting · `{n} covers`.
- `bookings/[id]/page.tsx`: detail rows → `Where` / `Date` / `Sitting` / `Party size` / Occasion / Source / Requested / `Closes whole venue` (Yes/No) / totals rows only when non-zero. Mailto subject `Your KAU reservation {reference}`. Remove `Length` row.
- `bookings/[id]/booking-actions.tsx`: `Final total ($)` → `(€)`; `Deposit ($, optional)` → `(€, optional)`; checkbox → `"Close the whole restaurant for this booking (blocks every space)"`; approve note placeholder → `"See you Saturday — ask for the counter seats if you want the show."`; decline placeholder → `"That sitting is full — Sunday lunch is wide open though."`
- `bookings/new/*`: description → `"Enter a reservation taken over the phone. Confirmed reservations block capacity immediately; owner bookings skip lead-time rules but never overbook."`; form: single `Date` field + `Sitting` select (Lunch/Dinner) replacing check-in/checkout; `Total (€)` / `Deposit (€)`; `Came in via` keeps.
- `bookings/actions.ts`: `parseMoney` — also strip `€`; add `service` to manual-booking parsing; date-order errors become `"Pick a date."`; conflict error → `"That sitting doesn't have room for this party (or the day is closed). Adjust the date or clear the closure first."`
- `calendar/page.tsx`: **Monday-first** weekdays `["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]` with lead `(getUTCDay() + 6) % 7`; description `"Confirmed reservations and closure dates across every space. Pending requests don't block capacity and aren't shown here."`; `"Whole estate"` → `"Whole restaurant"`; blackout panel: `"Close the restaurant (or one space) for holidays, private events or maintenance — guests can't book closed dates."`
- `calendar/blackout-form.tsx`: default option `"Whole restaurant — every space"`; fields `First closed day` / `Last closed day`; reason placeholder `"Summer holidays, private event, Godzilla maintenance…"`; buttons `Close dates` / `Closing…` / `Closed`.
- `guests/page.tsx` / `guests/[id]/page.tsx`: "stay" → "reservation"; `"Guest since …"` keeps; `"{money} booked all-time"` keeps.
- `enquiries/page.tsx`: mailto subject auto-updates via `site.fullName`; fix timezone/locale (see 2.3).
- `spaces/page.tsx`: description `"Everything guests see about each space — copy, photos and booking rules. Changes go live within a few minutes."`; empty state `"Run the database migrations to seed the dining room, counter and private hire."`; row: drop the `/night` money display for zero-rate spaces (show `"Free to book"`), badge `whole estate` → `full venue`.
- `spaces/[id]/space-form.tsx`: `Tagline` keeps; `Heritage note` label → `Badge line`; Rates section only for `isEvent` spaces, `Per event day (€)` with helper `"0 = price on request"`; Booking rules: remove `Min nights`, `Buffer days`; add `Capacity (covers per sitting)` bound to `capacityCovers`; `Max guests` label → `Max party size (online)`; checkboxes → `"Event space — priced per day"`, `"Closes the whole restaurant — bookings here block every space"`, active keeps; helper text → `"Lead days is the shortest notice you'll accept; horizon is how far ahead guests can book."`
- `spaces/actions.ts` (and the form's server action): persist `capacityCovers`.
- `spaces/[id]/page.tsx` iCal card: drop the Airbnb/VRBO sentence.
- `settings/page.tsx`: description `"Restaurant-wide settings for reservations, plus business details and admin access."`; Access card: "estate database" → "database".

---

## Phase 6 — Theme & design tokens

Recolour **in place** in `app/globals.css` and rename the vineyard-flavoured token
names with global find-and-replace. Token rename map (apply with replace-all across
the whole repo — these appear in ~40 tsx files and `lib/email.ts`):

| Old token | New token | New value |
|---|---|---|
| `cream` | `bone` | `#f5f1ea` |
| `cream-100` | `bone-100` | `#faf7f2` |
| `parchment` | `parchment` (keep name) | `#ece4d6` |
| `ink` | `ink` (keep) | `#1c1917` |
| `ink-soft` | `ink-soft` (keep) | `#44403c` |
| `pine-50` | `char-50` | `#f2f0ee` |
| `pine-100` | `char-100` | `#d8d2cb` |
| `pine-400` | `char-400` | `#78716c` |
| `pine-600` | `char-600` | `#3f3a35` |
| `pine-700` | `char-700` | `#292524` |
| `pine-900` | `char-900` | `#171412` |
| `amber` | `ember` | `#c2410c` |
| `amber-soft` | `ember-soft` | `#ea8a4b` |
| `lake` | `rust` | `#9a3412` |
| `lake-soft` | `rust-soft` | `#c97a52` |
| `stone` | `stone` (keep) | `#8a8177` |

Method (order matters to avoid partial-match collisions):
1. In `globals.css`, rename the CSS custom properties and set the new hex values;
   update the palette comment to `/* Brand palette — Texan smokehouse: charcoal, bone & ember */`.
2. Repo-wide replace of Tailwind utility fragments: `pine-` → `char-`,
   `amber-soft` → `ember-soft`, then remaining `amber` → `ember` (word-boundary:
   check each hit — class names like `text-amber`, `bg-amber` only),
   `lake-soft` → `rust-soft`, `lake` → `rust`, `cream-100` → `bone-100`,
   then `cream` → `bone`.
3. `app/components/ui/button.tsx`: also replace the hardcoded hover `#b3721f` →
   `#9a3410` and any renamed tokens.
4. `app/components/ui/field.tsx`: comment "matching the estate's design language" →
   "matching KAU's design language"; rename tokens.
5. `lib/email.ts` palette object: rename keys `pine`→`char`, `pineDark`→`charDark`,
   `cream`→`bone`, `creamLight`→`boneLight`, `amber`→`ember` and set the new hex
   values above (border → `#e2dbd0`); update every usage in the template strings.
6. Scrollbar/selection colors in `globals.css` follow the renamed tokens.
7. After replacing, `grep -rn "pine\|cream\|amber\|lake" app lib` must return zero
   hits (excluding `node_modules`).

Fonts: **keep Fraunces + Inter** (they suit the smokehouse look and swapping fonts
is out of scope). No changes to `app/fonts/`.

---

## Phase 7 — Images & brand assets

The repo currently ships Vinecliff estate photography. Real KAU photography doesn't
exist in the repo, so this phase sets up correctly-named placeholders that Jamie will
overwrite with real photos later. **Do not leave any old image file in place.**

1. Delete: all of `public/img/*.jpg` and `public/img/history/*`.
2. Create `public/img/` placeholders with these exact names (copy one neutral
   placeholder JPEG — generate a simple solid-charcoal `#1c1917` JPEG at roughly the
   listed size for each; do not attempt to draw food):
   - `hero-smokehouse.jpg` (1600×1000) — hero background
   - `dining-room.jpg` (1200×900)
   - `counter.jpg` (1200×900)
   - `smoker.jpg` (1200×900) — Godzilla
   - `brisket.jpg` (1600×1000) — booking CTA background
   - `exterior.jpg` (1200×900)
   - `trays.jpg` (1200×900) — gallery extra
   - `story/rui.jpg`, `story/vera.jpg`, `story/godzilla.jpg` (900×1200)
3. Add `public/img/README.txt`: `"All images are real KAU based photography use as many as possible within the landing page website.
4. `lib/space-images.ts`: `SPACE_IMAGES = ["/img/dining-room.jpg","/img/counter.jpg","/img/smoker.jpg","/img/brisket.jpg","/img/exterior.jpg","/img/trays.jpg","/img/hero-smokehouse.jpg"]`.
5. `lib/site.ts` `gallery[]` (six entries; keep the `span: "wide"` positions on the
   1st and 6th): hero-smokehouse (wide), brisket, dining-room, counter, smoker,
   trays (wide) — each with a factual alt from the names above.
6. `app/icon.svg`: replace with a rounded square (keep `rx="14"`) filled `#1c1917`,
   containing a bold serif letter **"K"** in `#f5f1ea` and a single curved smoke
   stroke in `#ea8a4b` rising from the K's foot. Keep the same viewBox so favicon
   sizing is unchanged.
7. `app/apple-icon.png`: re-render the new icon.svg to 180×180 PNG (use a simple
   conversion via available tooling; if no converter is available, generate a
   180×180 PNG of the charcoal square + "K" programmatically).
8. `app/opengraph-image.jpg` + `app/twitter-image.jpg`: replace both with a generated
   1200×630 JPEG: charcoal `#1c1917` background, "KAU" in large bone serif,
   `AMERICAN BARBECUE · MALVEIRA` letterspaced in ember below, thin inset border —
   mirroring the old composition without photography.
9. `app/opengraph-image.alt.txt` and `app/twitter-image.alt.txt` (both, exact
   content, no trailing newline):
   `KAU Barbecue — Texas-style American barbecue in Malveira, Portugal`

---

## Phase 8 — Seeds, settings & admin account

### 8.1 `drizzle/0003_seed_booking_platform.sql`
- Replace the four space INSERTs with the three KAU spaces (Phase 3), including
  `capacity_covers` — **note:** since `0003` runs before `0004` adds the column, put
  the `capacity_covers` values in `0004` as UPDATE statements instead:
  ```sql
  UPDATE "spaces" SET "capacity_covers" = 60  WHERE "slug" = 'table-service';
  UPDATE "spaces" SET "capacity_covers" = 24  WHERE "slug" = 'texan-counter';
  UPDATE "spaces" SET "capacity_covers" = 120 WHERE "slug" = 'private-hire';
  ```
- Settings seed:
  - `('notify_email', 'reservas@kaubarbecue.pt')` — `-- TODO(jamie): confirm email` CONFIRMED BY JAMIE
  - `('cancellation_policy', 'Reservations are free — if your plans change, cancel from your booking page or call us so we can release the table. No-shows hurt a small smokehouse. Private-hire deposits are handled case by case; call us and we''ll work something out.')`

### 8.2 `drizzle/0001_seed_admin_user.sql`
Replace the Vinecliff admin row with Jamie's:
- email `jamie.nisbet@outlook.be`, first name `Jamie`, last name `Nisbet`.
- Generate a fresh scrypt hash in the same format the login code verifies
  (`lib/auth/password.ts` — `scrypt$<salt-hex>$<hash-hex>`). Write a tiny throwaway
  Node script in the scratchpad that imports/replicates `lib/auth/password.ts`'s
  hashing and hashes the temporary password `kau-change-me-2026`, paste the result
  into the migration, and add `-- Temporary password "kau-change-me-2026" — TODO(jamie): change after first login.`
  Never commit the plaintext password anywhere except that comment.

### 8.3 `scripts/seed-demo.ts`
- New slug guard (Phase 3). Rewrite demo data for a restaurant:
  - Guests: Portuguese names, phones `+351 9x xxx xxxx`, notes like
    `"Regular — always Sunday lunch"`, `"Asked about full-venue hire for a company party"`.
  - Bookings: single-day (`nights: 1` — rename the seed field to `days` or just set
    1), spread across lunch/dinner via the new `service` field, party sizes 2–8,
    plus one pending `private-hire` request with `eventType: "Full-venue private event"`.
  - Blackouts: `"Closed — summer holidays (demo)"`, `"Private event — full venue (demo)"`, `"Godzilla maintenance (demo)"`.
  - Enquiries: `"Can you do a birthday dinner for 14 on a Saturday?"`, `"Do you have vegetarian options for a mixed group?"`, `"What does full-venue hire cost for ~80 people?"`.
- Final log line keeps.

### 8.4 `lib/settings.ts`
- Comment "Estate-wide settings" → "Restaurant-wide settings". Keys stay as-is
  (`notify_email`, `cancellation_policy`) — opening hours/services are code-level
  constants in `availability.ts` for this pass, not settings.

---

## Phase 9 — Emails (`lib/email.ts`)

- `from` fallback → `"KAU Barbecue <onboarding@resend.dev>"`; doc-comment example →
  `'KAU Barbecue <reservas@kaubarbecue.pt>'`.
- Masthead: `Vine&nbsp;Cliff` → `KAU`; sub-line `Vineyards · Est. 1850` →
  `American Barbecue · Malveira` (color: the new `ember-soft` `#ea8a4b`).
- Palette: renamed/recoloured per Phase 6.
- `stayRows()` → rename `bookingRows()`: `Reference` / `Where` / `Date` (single) /
  `Sitting` (lunch/dinner label) / `Party size`. Update `BookingEmailData` to carry
  `service`.
- Subjects & copy:
  - requestReceived: subject `We've received your request — {ref}`; body `"We've received your reservation request for {space}. Every request is reviewed personally, and we'll confirm by email — usually within a few hours."`
  - approved: subject `You're booked at KAU — {ref}`; heading `"Good news, {first} — your table is booked"`; body `"Your {event at|table at} {space} is confirmed. Come hungry — the meat comes off Godzilla all day."` Drop the deposit sentence for zero-total bookings; keep it for totals > 0 as `"We'll be in touch shortly about the deposit and details."`
  - declined: subject `About your KAU request — {ref}`; body `"We're sorry — we couldn't seat your party for {space} that day. The other sitting or another day often works — reply to this email or call us on {site.phone}."`
  - cancelled: subject `Your KAU reservation is cancelled — {ref}`; body keeps (brand-free).
  - ownerNewRequest: `"{guest} has requested {an event at|a table at} {space}."`
  - ownerRequestWithdrawn: `"…No action needed — the covers were never blocked."`
  - Other owner templates: wording keeps.
- Quote rows render only when `totalCents > 0`.

---

## Phase 10 — Final sweep & acceptance checklist

Run each grep from the repo root (exclude `node_modules`, `.git`, and this file).
**Every one must return zero hits** (except where noted):

```
grep -rin "vinecliff\|vine cliff" --exclude-dir=node_modules --exclude-dir=.git --exclude=REBRAND-INSTRUCTIONS.md .
grep -rin "vineyard\|winery\|wine country" --exclude-dir=node_modules --exclude-dir=.git --exclude=REBRAND-INSTRUCTIONS.md .
grep -rin "lake erie\|brocton\|chautauqua\|fredonia\|dunkirk" --exclude-dir=node_modules --exclude-dir=.git --exclude=REBRAND-INSTRUCTIONS.md .
grep -rin "farmhouse\|carriage\|barn\b" --exclude-dir=node_modules --exclude-dir=.git --exclude=REBRAND-INSTRUCTIONS.md .
grep -rin "wpcarlson\|carlson\|harris\|oliphant\|nagasawa\|salem-on-erie" --exclude-dir=node_modules --exclude-dir=.git --exclude=REBRAND-INSTRUCTIONS.md .
grep -rn "America/New_York" --exclude-dir=node_modules --exclude-dir=.git .
grep -rn "USD\|\\$450\|en-US" --exclude-dir=node_modules --exclude-dir=.git app lib tests   # en-US may remain ONLY in app/layout.tsx openGraph.locale
grep -rn "VC-" --exclude-dir=node_modules --exclude-dir=.git app lib drizzle scripts tests
grep -rn "todayAtEstate\|blocksEstate is fine in code" app lib   # todayAtEstate must be gone; blocksEstate the FIELD may remain, "estate" in COPY must not
grep -rin "estate" --exclude-dir=node_modules --exclude-dir=.git app lib README.md   # allowed hits: the DB column name blocks_estate / blocksEstate identifiers only
grep -rn "check-in\|checkout\|nights\|per night" --exclude-dir=node_modules --exclude-dir=.git app lib   # allowed: none in user-facing strings
grep -rin "Est. 1850\|LodgingBusiness\|Airbnb\|VRBO" --exclude-dir=node_modules --exclude-dir=.git .
grep -rn "pine\|cream\|amber\|lake" --exclude-dir=node_modules --exclude-dir=.git app lib
```

Manual checks:
- [ ] `public/img/` contains only the new KAU filenames; `vinecliff-sign.jpg` and `history/` are gone.
- [ ] `app/icon.svg`, `apple-icon.png`, OG/Twitter images and both `.alt.txt` files are KAU assets.
- [ ] `drizzle/0000` and `0002` untouched; `0004` exists and is in `_journal.json`.
- [ ] Every `TODO(jamie)` from this document is present in the code (email address, domain, capacities, admin password, placeholder images).
- [ ] Booking panel: single date + lunch/dinner + party size; no prices shown for reservation spaces; Monday-first calendars (public + admin).
- [ ] `tests/booking.test.ts` rewritten for EUR + capacity model (not run locally — CI verifies).
- [ ] `KAU-BBQ.md` and `REBRAND-INSTRUCTIONS.md` stay in the repo untouched.

When all checks pass, commit everything as a single commit:
`Rebrand Vinecliff shell to KAU Barbecue and adapt booking to restaurant reservations`
(with the standard Claude co-author trailer). Push only if asked.
