# Stub: The seeded admin password is in the repo in plaintext

- feature-slug: rotate-seeded-admin-password
- lane: bug
- priority: P0
- sources: found during the estate AGENTS.md rollout, 2026-08-30 ·
  `drizzle/0001_seed_admin_user.sql:6`

## What this is

`drizzle/0001_seed_admin_user.sql` seeds the first admin accounts, and line 6 reads:

```
-- Temporary password "kau2026" — TODO(jamie): change after first login.
```

The stored column is a scrypt hash, which is right. The **plaintext** is the problem: it
sits in git history, in a public-shaped file, next to the two real account emails the same
migration seeds (`rui@kaubarbecue.pt`, `vera@kaubarbecue.pt`). Anyone with repo access has
a working credential for `/admin` — which is the surface that manages live bookings for the
restaurant — for as long as that password still works.

The TODO says it should have been changed after first login. Nothing in the repo records
whether that happened, so the working assumption has to be that it has not.

## What closes it

1. **Confirm whether `kau2026` still authenticates** on the production admin. That is the
   only thing that decides how urgent the rest is.
   - **Confirmed by Jamie, 2026-08-31: yes, it still works.** Both seeded accounts are a
     live, working credential in git history right now.
2. **Rotate both seeded accounts' passwords** — the accounts belong to the client, so the
   rotation is a conversation with them, not a silent change. **Still open** — this needs
   Jamie and the client to change both passwords through the app; no session does this.
3. **Remove the plaintext from the migration comment.** Editing an applied migration is
   normally wrong, but a comment carries no schema meaning, so amending the line in place
   is safe for future runs. **Done** — `drizzle/0001_seed_admin_user.sql:6`. It does
   **not** remove it from history — that needs a history rewrite, which is a separate
   decision and probably not worth it once the password is dead.
4. Replace the pattern: seed the account with no usable password and force a set-password
   flow on first login, so there is never a shared secret to leak. **Proposed, not
   built** — see the new epic at `.icm/intake/admin-first-login-password/`.

Deliberately not done in the rollout PR that found it: rotating a live client credential
is Jamie's call, and a docs PR is the wrong place for it. Still true here — this PR only
strips the plaintext (item 3) and proposes item 4's fix; items 1 and 2 stay with Jamie
and the client, outside any repo change.

**This stub stays open** (not moved to `_done/`) until item 2 (rotation) is confirmed
done. It doesn't block item 4's epic, which can proceed independently.

## Prompt

Deal with the plaintext admin password in kau-american-bbq. Read
.icm/intake/triage/rotate-seeded-admin-password.md first. `drizzle/0001_seed_admin_user.sql:6`
carries the temporary password in a comment alongside the two real client account emails
the migration seeds. Establish with Jamie whether it still authenticates before touching
anything; rotation of a client account is his call and the client's, not a session's. Then
strip the plaintext from the comment and propose the set-password-on-first-login change
that removes the shared secret entirely. Open a PR on a claude/ branch.
