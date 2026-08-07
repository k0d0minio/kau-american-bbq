-- Seed the initial admin accounts: KAU's owners, Rui and Vera Matias.
--
-- The password hashes below are scrypt(<password>, random-salt) in the format
-- produced by lib/auth/password.ts (scrypt$<saltHex>$<derivedHex>).
--
-- Temporary password "kau2026" — TODO(jamie): change after first login.
--
-- Idempotent: ON CONFLICT keeps re-runs safe and never clobbers a password
-- that has since been changed through the app.
INSERT INTO "users" ("email", "password_hash", "first_name", "last_name")
VALUES
(
  'rui@kaubarbecue.pt',
  'scrypt$8094fde38cca4e86e9d930036ed68d62$5ffe836483399fe44cef6fb9706fa8e18cf7e4fdda57983b981862468549bf15d5d7afa2aa561ce4f0c4063cbe43f34a3cd4373f6ade7aec97ad651bd5abea81',
  'Rui',
  'Matias'
),
(
  'vera@kaubarbecue.pt',
  'scrypt$58e312c35d5a7468ed327b317f4b5f68$2c662abef717de74b9bc60fceea99963065a7354a407e4af714aa6091654173cc8c09ca7f3add1765388592184b03fbf5601ab47f05de3818ca6cb9062d4bbdd',
  'Vera',
  'Matias'
)
ON CONFLICT ("email") DO NOTHING;
