# Stub: Let a user exist with no usable password, only a setup token

- feature-slug: require-password-setup-state
- sequence: 1 of 2
- depends-on: none
- lane: feature
- priority: P1
- sources: `.icm/intake/admin-first-login-password/breakdown.md` ·
  found while closing `.icm/intake/triage/rotate-seeded-admin-password.md`

## What this is

`users.password_hash` is `notNull()` today (`lib/db/schema.ts:32`), so every account —
seeded or created — must be given a real, working password up front. That's the root of
the plaintext-in-a-migration problem: a usable credential has to exist somewhere before
its owner ever sets one themselves.

Make `password_hash` nullable, and add a way to identify a pending, one-time setup
token:

- `password_hash` → nullable. `NULL` means "this account cannot log in with a password
  yet."
- A `password_setup_token_hash` (text, nullable) and `password_setup_token_expires_at`
  (timestamptz, nullable) pair. Store the token hashed (same scrypt module, or a plain
  SHA-256 — it's a lookup token, not a password, so scrypt's cost isn't needed; a fast
  hash is fine as long as the raw token isn't stored). The raw token is never
  persisted, only emailed.
- Keep `verifyPassword`/`hashPassword` in `lib/auth/password.ts` unchanged; add the
  token hash/verify as a separate small helper (or inline in the action from stub 2 —
  whichever reads cleaner) rather than overloading the password functions.

Update `drizzle/0001_seed_admin_user.sql` — no, don't: it's an applied migration and
already seeds real accounts, changing its `INSERT` would try to reset a password that
may have since been changed (the `ON CONFLICT DO NOTHING` guard exists precisely to
avoid that). Leave it as-is. Add a **new** migration for the schema change
(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`, plus the two new
columns), consistent with how `drizzle/0002`–`0006` layer on top of `0000`/`0001`
rather than editing them.

## Acceptance

- [ ] `password_hash` is nullable in `lib/db/schema.ts` and the new migration.
- [ ] New nullable `password_setup_token_hash` / `password_setup_token_expires_at`
      columns, migration generated via the repo's normal Drizzle workflow (check
      `drizzle.config.ts` / `scripts/migrate.ts` for how migrations are generated here
      rather than hand-writing SQL that might drift from the Drizzle-tracked schema).
- [ ] No change to the existing seeded rows or to `0001_seed_admin_user.sql`.
- [ ] CI green.

## Prompt

Implement `.icm/intake/admin-first-login-password/require-password-setup-state.md` in
kau-american-bbq: make `users.password_hash` nullable and add a setup-token pair
(hash + expiry) so an account can exist without a usable password. Read the stub file
and its epic's `breakdown.md` in the same directory for full context first. New Drizzle
migration only — never edit an already-applied one. PR on a `claude/` branch; CI is the
source of truth, don't run build/lint/typecheck locally.
