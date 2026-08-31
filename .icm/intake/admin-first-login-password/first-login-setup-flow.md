# Stub: First-login set-password flow, and stop seeding real passwords

- feature-slug: first-login-setup-flow
- sequence: 2 of 2
- depends-on: require-password-setup-state
- lane: feature
- priority: P1
- sources: `.icm/intake/admin-first-login-password/breakdown.md` ·
  found while closing `.icm/intake/triage/rotate-seeded-admin-password.md`

## What this is

With the schema from `require-password-setup-state` in place, wire up the actual flow so
a new account is never handed a real password by whoever creates it:

1. **A "set your password" page and action**, e.g. `app/(en)/admin/setup/[token]/` (and
   its `app/(pt)/` twin, per AGENTS.md — PT and EN move together). It takes the raw
   token from the URL, looks up a user whose `password_setup_token_hash` matches and
   `password_setup_token_expires_at` hasn't passed, and on submit: hashes the chosen
   password with `hashPassword` (`lib/auth/password.ts`), writes it to `password_hash`,
   clears both token columns, and signs the visitor in the same way
   `app/(en)/admin/login/actions.ts` does (`createSessionToken` + the
   `ADMIN_SESSION_COOKIE`).
2. **`login` (`app/(en)/admin/login/actions.ts`) stays password-only** — an account with
   `password_hash = NULL` simply can't match `verifyPassword` and gets the normal
   "Incorrect email or password" response. No new branch needed there; the setup token
   is a separate, capability-URL entry point, not a login-form special case (keeps the
   login response indistinguishable whether an email exists, has no password yet, or
   the password was wrong — no new oracle).
3. **Token issuance**: for now, this only needs to cover the two already-seeded
   accounts once `rotate-seeded-admin-password.md` needs a rotation path — but design it
   as a small `createPasswordSetupToken(userId)` helper (generates the raw token,
   stores its hash + a short expiry, returns the raw token) that a future
   "invite a teammate" admin action can also call. Don't build that admin UI now — see
   the epic's `breakdown.md` for why it's out of scope.
4. **Email it.** Use `sendEmail` from `lib/email.ts` (already handles the
   `RESEND_API_KEY`-unset no-op case) to send the raw setup link
   (`${siteBaseUrl()}/admin/setup/<token>`) — this is what makes the token an actual
   invite rather than a link someone has to hand-deliver.
5. **Expiry**: keep it short — a few hours is plenty for someone waiting on an invite
   email. An expired or already-used (cleared) token renders "this link has expired,
   ask for a new one" rather than a generic 404, but reveals nothing about the
   underlying account.

Middleware (`middleware.ts`) already exempts `/admin/login`; extend the exemption to the
new setup route so an unauthenticated visitor can reach it.

## Acceptance

- [ ] Setup page + action exist in both `app/(en)/admin/` and `app/(pt)/admin/`.
- [ ] `middleware.ts` allows the unauthenticated setup route through.
- [ ] Submitting a valid, unexpired token sets a real password, clears the token
      columns, and signs the visitor in.
- [ ] An expired or unknown token shows a clear "expired/invalid" state, not a crash or
      a leak of whether the token or account exists.
- [ ] `login` behavior is unchanged for accounts that already have a password.
- [ ] CI green.

## Prompt

Implement `.icm/intake/admin-first-login-password/first-login-setup-flow.md` in
kau-american-bbq, on top of `require-password-setup-state` (must land first — check
whether it's already merged before starting). Read both stub files and the epic's
`breakdown.md` in `.icm/intake/admin-first-login-password/` for full context. Build the
set-password-on-first-login page/action, wire it into the existing login and session
code in `app/(en)/admin/login/` and `lib/auth/`, and mirror it into `app/(pt)/`. PR on a
`claude/` branch; CI is the source of truth, don't run build/lint/typecheck locally.
