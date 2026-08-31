# Epic: Stop seeding admin accounts with a shared password

## What was understood

`drizzle/0001_seed_admin_user.sql` seeded the first two admin accounts (Rui and Vera
Matias) with a real, working password baked into the migration — stored correctly as a
scrypt hash, but the plaintext also sat in a comment next to their real emails
(`.icm/intake/triage/rotate-seeded-admin-password.md`). That triage stub gets the
immediate leak off the books: strip the plaintext, get Jamie and the client to rotate
both accounts.

It doesn't fix the pattern that produced the leak. Any future seeded or admin-created
account will have the same shape of problem — a real password has to exist somewhere
(a migration, a script argument, a Slack message) before the account's owner ever
touches it, and every one of those somewheres is a place it can leak from again.

The fix is to make it structurally impossible to seed a *usable* password: new accounts
get no password at all, only a one-time setup link, and they choose their own password
the first time they sign in. Nobody — not the migration, not whoever ran it — ever knows
a real credential for someone else's account.

## Build order

1. `require-password-setup-state` — schema + migration: let a user exist with no usable
   password and a pending setup token.
2. `first-login-setup-flow` — the login route change, the setup page, and the action
   that lets someone claim their account by setting their own password. Depends on 1.

Both land in the same PR is fine given the size, or split — whoever picks this up can
judge; the dependency is what matters, not the PR boundary.

## Out of scope here

- Rotating the two seeded accounts' current passwords — that's
  `rotate-seeded-admin-password.md`, and it's Jamie's and the client's call, not this
  epic's.
- General password-reset ("forgot my password") for an account that already has one.
  Related, not required to close this — worth its own stub later if wanted.
- Admin UI for inviting a *new* teammate (there are only two accounts today, both
  already seeded). The setup-token mechanism this epic builds is the primitive a future
  "invite a teammate" feature would use, but building that UI is not in scope.
