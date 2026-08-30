# AGENTS.md — Layer 0: Repository Identity & Routing

> This is the **first file any agent session reads.** It says what this repo is and where
> to go for a given task. Keep it short; detail lives in `README.md` and the routed files.

## What this repo is

**kau-american-bbq** — the website **and reservation platform** for **KAU Barbecue**, the
Texas-style barbecue restaurant in **Malveira, Portugal**. Meat is smoked low and slow on
the house smoker ("Godzilla"), cut fresh and sold by weight, served as table service or at
the Texan counter.

Guests browse the ways to eat, check live availability and **request a table**; the team
reviews, confirms and runs the restaurant from `/admin`. So this is not a brochure site —
it holds real bookings for a real business, and a bug here costs covers.

**Bilingual PT/EN** via the `app/(pt)` and `app/(en)` route groups and `lib/i18n`.
Next.js 15 (App Router) + React 19 · TypeScript · Tailwind CSS v4 · Framer Motion ·
shadcn-style primitives with `class-variance-authority` · self-hosted Fraunces + Inter ·
**Drizzle ORM on Neon Postgres**. Deployed on Vercel; `db-migrate.yml` runs migrations.

**Auth:** individual accounts in the `users` table, passwords stored only as scrypt
hashes. `middleware.ts` validates a signed httpOnly session cookie on the Edge for every
`/admin` route without touching the database. Requires `DATABASE_URL` and `AUTH_SECRET`.

> The `0001_seed_admin_user` migration creates the first accounts, so they exist as soon
> as migrations run. It ships a **temporary password that must be changed after first
> login** — treat the admin as unhardened until Jamie confirms it has been rotated, and
> never widen `/admin` on the assumption it is safe.

## Routing — "if the task is… → go to…"

| The task | Go to |
|---|---|
| Pages in either language | [`app/(pt)/`](app/) · [`app/(en)/`](app/) — route groups |
| Page sections and shared components | [`app/sections/`](app/sections/) · [`app/components/`](app/components/) |
| Translation and locale handling | [`lib/i18n/`](lib/i18n/) |
| Booking logic — availability, requests, confirmation | [`lib/booking/`](lib/booking/) |
| Schema, queries, migrations | [`lib/db/`](lib/db/) + [`drizzle/`](drizzle/) + [`drizzle.config.ts`](drizzle.config.ts) |
| Admin surface and its data | [`app/admin/`](app/) + [`lib/admin.ts`](lib/admin.ts) + [`lib/auth/`](lib/auth/) + [`middleware.ts`](middleware.ts) |
| Business facts — hours, spaces, contact | [`lib/site.ts`](lib/site.ts) · [`lib/spaces.ts`](lib/spaces.ts) · [`lib/settings.ts`](lib/settings.ts) |
| Transactional email | [`lib/email.ts`](lib/email.ts) |
| SEO, Open Graph, `Restaurant` structured data | [`lib/seo.ts`](lib/seo.ts) + the `opengraph-image.*` / `twitter-image.*` files in `app/` |
| Fonts and theme | [`app/fonts/`](app/fonts/) · [`app/globals.css`](app/globals.css) |
| Migrations and demo data | [`scripts/migrate.ts`](scripts/migrate.ts) · [`scripts/seed-demo.ts`](scripts/seed-demo.ts) |
| CI / migration workflow | [`.github/workflows/db-migrate.yml`](.github/workflows/db-migrate.yml) |
| Plan or track work on this repo | [`.icm/intake/`](.icm/intake/) — epics and stubs, contract in its README |

## Standing rules

- **Real bookings live here.** Never run a destructive migration or a seed script against
  a database you have not confirmed is disposable. `seed-demo.ts` is for demo data, not
  production.
- **PT and EN move together.** A string added to one route group is added to the other in
  the same change.
- **Never invent a business fact.** Hours, prices, cuts, capacity and contact details come
  from `lib/site.ts`/`lib/settings.ts` or from the client — never from plausible guessing.
- **Passwords are scrypt hashes, never plaintext.** Do not add a bypass, a default, or a
  "temporary" credential to the repo.
- **CI is the source of truth.** Never run `build`/`lint`/`typecheck`/`test` locally — push
  and read the checks.
- **Planning is tickets.** Any plan or backlog becomes stubs in `.icm/intake/`, never a
  loose `TODO.md`. Ticket-only commits go straight to `main`; everything else through a PR
  on a `claude/` branch.
- **Gates are human checkboxes** — read them, never tick them.
- **No secrets in git, ever.** Env vars only (`DATABASE_URL`, `AUTH_SECRET`); flag any
  plaintext credential found.
