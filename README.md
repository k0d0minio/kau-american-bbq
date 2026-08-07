# KAU Barbecue

Website and reservation platform for **KAU Barbecue** — the Texas-style
barbecue restaurant in Malveira, Portugal. Meats are smoked low and slow on
the house smoker, "Godzilla", cut fresh and sold by weight, served either as
classic table service or at the authentic Texan counter.

Guests browse the ways to eat, check live availability and **request a table**
online; the team reviews, confirms and runs the whole restaurant from
`/admin`.

## Stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 19
- TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) for scroll & entrance animations
- shadcn-style UI primitives (Button) with `class-variance-authority`
- Self-hosted variable fonts (Fraunces + Inter) via `next/font/local`
- [Drizzle ORM](https://orm.drizzle.team/) on [Neon](https://neon.tech/) Postgres

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL and AUTH_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — lint
- `npm test` — unit tests for the booking domain logic (dates, pricing, availability)
- `npm run db:generate` — generate SQL migrations from `lib/db/schema.ts`
- `npm run db:migrate` — apply pending migrations to `DATABASE_URL`
- `npm run db:seed:demo` — fill the database with realistic demo data (guests,
  reservations, closures, enquiries) for showing the platform off; re-run any
  time to refresh it, or add `-- --reset` to remove it again
- `npm run db:studio` — open Drizzle Studio against the database

## The reservation platform

**Models** (`lib/db/schema.ts`): `spaces` (the dining areas — table service,
the Texan counter and full-venue private hire — with their copy, photos and
booking rules), `guests` (deduplicated by email; doubles as a CRM),
`bookings` (request-to-book with statuses `pending → approved/declined`, plus
`cancelled`), `blackouts` (closure days; spaces are open by default),
`enquiries`, and `settings` (notification email, cancellation policy).

**How booking works**

1. Each space has a public page at `/spaces/<slug>` with a live availability
   calendar and a reservation form. A reservation is **one date + one service
   (lunch or dinner) + a party size** — nothing is charged online.
2. Requests arrive as `pending`; only **approved** reservations consume
   capacity. The team confirms, declines, or cancels from `/admin/bookings`;
   guests are emailed at every step and get a private status page
   (`/bookings/<token>`) where they can withdraw a pending request or ask to
   cancel a confirmed one.
3. Availability rules are per-space and editable in the admin: cover capacity
   per sitting, party-size caps, lead time and booking horizon. The restaurant
   is open Thursday to Sunday, lunch 12:00–15:00 and dinner 19:00–22:00.
   Full-venue private hire **closes the whole restaurant**: its bookings block
   every space, and it's only available when everything is free (overridable
   per booking at approval).
4. Reservations are free. Private-hire totals and deposits are tracked
   manually for now (quoted vs final total, deposit,
   unpaid/deposit-paid/paid/refunded) — the schema is ready for Stripe later.

**Admin** (`/admin`): dashboard with live stats, reservation pipeline with
search and tabs, manual bookings for phone requests, a month calendar across
all spaces with closure management, a guests CRM with notes and history, a
spaces editor (copy, photos, capacity, rules), an enquiries inbox with
one-click convert-to-booking, and settings.

**Email** (`lib/email.ts`): transactional email via Resend's HTTP API. With
no `RESEND_API_KEY` set, sends become logged no-ops — the site works fine
without email. Set `RESEND_FROM` to a verified sender for production.

**iCal feeds**: every space has a private feed at `/api/ical/<token>` (URL
shown in the space editor) — subscribe from Google Calendar to see bookings
and closures.

## Structure

```
app/
  components/     Nav, Footer, motion primitives, UI primitives, in-view hook
  sections/       Hero, Smokehouse, Spaces, Gallery, Location, Booking CTA
  spaces/[slug]/  Space detail pages: availability calendar + booking form
  bookings/[token]/ Guest reservation status page (private tokenized link)
  enquire/        General enquiry form
  api/ical/[token]/ Private iCal availability feed per space
  admin/          Account-gated admin: dashboard, bookings, calendar,
                  guests, spaces editor, enquiries, gallery, settings
  fonts/          Self-hosted variable fonts
  layout.tsx      Metadata, SEO, JSON-LD, fonts
  page.tsx        Landing page composition
lib/
  site.ts         Business info + static space fallback, gallery & nearby data
  spaces.ts       Space display shapes for the public site
  admin.ts        Admin navigation config
  booking/        Domain logic: dates, pricing, availability, tokens
  email.ts        Resend transactional email + templates
  settings.ts     Restaurant-wide settings (notification email, policy)
  db/             Drizzle schema (schema.ts), client (index.ts), queries
  auth/           Password hashing, session tokens, admin action guard
  utils.ts        cn() helper
tests/            Unit tests for the booking domain (node:test via tsx)
scripts/
  migrate.ts      Applies pending migrations (used by CI and `db:migrate`)
  seed-demo.ts    Fills the DB with demo guests, reservations, closures & enquiries
drizzle/          Generated SQL migrations + seeds
middleware.ts     Protects /admin routes behind the login cookie
public/img/       Restaurant photography
```

## Database (Drizzle + Neon)

The schema lives in `lib/db/schema.ts`. After changing it, generate a migration
and commit the result:

```bash
npm run db:generate
```

Migrations are applied by `scripts/migrate.ts` (Neon's HTTP driver), which runs
locally via `npm run db:migrate` and automatically in CI — see below.

### Automatic migrations on merge to main

`.github/workflows/db-migrate.yml` runs `npm run db:migrate` against production
every time changes land on `main` (i.e. when a PR merges). It requires one
repository secret:

- `DATABASE_URL` — the Neon connection string (same value Vercel uses for
  production).

Add it under **Settings → Secrets and variables → Actions**. The job is
idempotent (Drizzle skips already-applied migrations) and serialised so two
runs never touch the database at once. Preview deployments do **not** run
migrations; they read whatever schema production is currently on.

## Admin section

A private, mobile-responsive admin area lives at `/admin`, for managing
reservations, enquiries and site content.

Access is tied to individual accounts, each signing in with their own **email
and password**. Accounts live in the `users` table; passwords are stored only
as scrypt hashes. Two environment variables are required:

- `DATABASE_URL` — Neon Postgres connection string (provisioned by the Vercel +
  Neon integration).
- `AUTH_SECRET` — a long random string used to sign session cookies. Generate
  one with:

  ```bash
  node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
  ```

Set both in `.env.local` for development and in the Vercel project's
environment variables for production. Every `/admin` route is protected by
`middleware.ts`, which validates a signed, httpOnly session cookie on the Edge
without hitting the database; visitors are redirected to `/admin/login` until
they sign in.

The initial admin account is created by the `0001_seed_admin_user` migration,
so it exists as soon as migrations have run. It ships with Jamie's placeholder
credentials and a temporary password that must be changed after the first
login.

## Design notes

- **Mobile-first** throughout, with a full-screen mobile nav.
- Texan smokehouse palette — charcoal, bone, smoke and ember.
- Subtle, tasteful motion: parallax hero, word-by-word headline reveal,
  staggered scroll reveals, image hover zoom. Respects `prefers-reduced-motion`.
- SEO: Open Graph, Twitter cards, and `Restaurant` structured data.
