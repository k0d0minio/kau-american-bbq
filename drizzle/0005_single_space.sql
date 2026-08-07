-- KAU is one restaurant, not an estate of separate buildings: a single
-- bookable space with one pool of covers per sitting. How a party is served
-- (table service or the Texan counter) is a preference on the booking, so it
-- moves from "which space" to a column here.
--
-- This migration also clears the Vinecliff-era space rows seeded by earlier
-- runs of 0003. Only rows with those legacy slugs are touched.
CREATE TYPE "public"."dining_format" AS ENUM('table', 'counter');--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "dining_format" "dining_format";--> statement-breakpoint

-- TODO(jamie): confirm the real cover capacity per sitting with KAU. 84 is the
-- dining room (60) plus the counter (24) sharing one room; editable in admin.
UPDATE "spaces" SET "capacity_covers" = 84 WHERE "slug" = 'kau-barbecue';--> statement-breakpoint

DELETE FROM "bookings" WHERE "space_id" IN (
  SELECT "id" FROM "spaces"
  WHERE "slug" IN ('farmhouse', 'carriage-house', 'barn', 'estate')
);--> statement-breakpoint
DELETE FROM "spaces"
WHERE "slug" IN ('farmhouse', 'carriage-house', 'barn', 'estate');
