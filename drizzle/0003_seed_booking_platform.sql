-- Seed the booking platform: KAU's single bookable space and the default
-- restaurant settings.
--
-- KAU is one dining room in Malveira. Table service and the Texan counter are
-- two ways of being served in that room, not separate spaces, so they live as
-- a preference on the booking (see 0005) rather than as extra rows here.
--
-- TODO(jamie): confirm the real cover capacity and party-size cap with KAU.
-- The numbers below are sensible defaults, editable from /admin/spaces.
-- Idempotent: ON CONFLICT keeps re-runs safe and never clobbers values that
-- have since been edited through the app.

INSERT INTO "spaces" (
  "slug", "name", "kind", "age", "blurb", "description", "image", "features",
  "is_event", "blocks_estate",
  "nightly_rate_cents", "weekly_rate_cents", "cleaning_fee_cents",
  "min_nights", "max_guests", "buffer_days", "min_lead_days", "max_horizon_months",
  "sort_order"
) VALUES
(
  'kau-barbecue',
  'KAU Barbecue',
  'Table service or the Texan counter',
  'Est. 2026',
  'One dining room, two ways to eat: sit down and let the meat come to you, or step up to the counter and watch it cut and weighed in the moment.',
  E'KAU is the mother house of Rui and Vera Matias'' barbecue — a Malveira smokehouse built around Godzilla, the custom smoker that runs from before sunrise. Brisket and beef rib Black Angus, St. Louis pork ribs, pulled pork and smoked turkey breast come off the smoke and are cut fresh, sold by weight, and served with sides worth the trip on their own.\n\nChoose how you eat when you book. Table service brings the tray to you; at the Texan counter you watch your meats cut and weighed in front of you and carry the tray yourself. Same smoke either way. We serve Thursday to Sunday, lunch and dinner, and reservations are free — the room fills fast.',
  '/img/dining-room.jpg',
  ARRAY['Full table service or the counter', 'All meats cut and sold by weight', 'Sides, sauces & desserts', 'Thursday to Sunday, lunch & dinner'],
  false, false,
  0, NULL, 0,
  1, 8, 0, 0, 3,
  1
)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "settings" ("key", "value") VALUES
(
  'notify_email',
  'reservas@kaubarbecue.pt'
),
(
  'cancellation_policy',
  'Reservations are free — if your plans change, cancel from your booking page or call us so we can release the table. No-shows hurt a small smokehouse. Private-hire deposits are handled case by case; call us and we''ll work something out.'
)
ON CONFLICT ("key") DO NOTHING;
