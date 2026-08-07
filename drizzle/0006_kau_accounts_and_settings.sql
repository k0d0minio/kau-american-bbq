-- Bring an already-migrated database in line with the KAU seeds.
--
-- Migrations 0001 and 0003 were corrected in place, which is enough for a
-- fresh database but never reaches one that has already run them: Drizzle
-- only applies migrations newer than the last one recorded. Production has
-- therefore been carrying the Vinecliff admin account and the Vinecliff
-- settings since the first deploy. This migration fixes that.
--
-- Temporary password "kau2026" — TODO(jamie): change after first login.
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
ON CONFLICT ("email") DO NOTHING;--> statement-breakpoint

-- The Vinecliff owner's account, whose password nobody at KAU knows.
DELETE FROM "users" WHERE "email" = 'wpcarlson@gmail.com';--> statement-breakpoint

-- Only correct settings still holding the seeded Vinecliff values, so anything
-- already edited through /admin/settings survives.
UPDATE "settings"
SET "value" = 'reservas@kaubarbecue.pt', "updated_at" = now()
WHERE "key" = 'notify_email' AND "value" = 'hello@vinecliff.com';--> statement-breakpoint

UPDATE "settings"
SET "value" = 'Reservations are free — if your plans change, cancel from your booking page or call us so we can release the table. No-shows hurt a small smokehouse. Private-hire deposits are handled case by case; call us and we''ll work something out.',
    "updated_at" = now()
WHERE "key" = 'cancellation_policy'
  AND "value" LIKE 'Deposits are fully refundable%';
