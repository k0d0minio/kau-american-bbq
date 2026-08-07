-- Restaurant reservation model: a booking is one date + one sitting (lunch or
-- dinner) + a party size, and a space holds many bookings per sitting up to a
-- cover capacity. Structural columns only — capacities are set alongside the
-- space seed data.
CREATE TYPE "public"."booking_service" AS ENUM('lunch', 'dinner');--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "service" "booking_service";--> statement-breakpoint
ALTER TABLE "spaces" ADD COLUMN "capacity_covers" integer DEFAULT 0 NOT NULL;
