"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { spaces } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SPACE_IMAGES } from "@/lib/space-images";
import type { AdminActionState } from "../bookings/actions";

function text(formData: FormData, name: string, maxLength = 4000): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseMoney(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const amount = Number.parseFloat(cleaned);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

function parseIntField(raw: string, fallback: number, min: number, max: number): number {
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export async function updateSpace(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const id = text(formData, "spaceId", 40);
    const [existing] = await db.select().from(spaces).where(eq(spaces.id, id)).limit(1);
    if (!existing) return { error: "Space not found." };

    const name = text(formData, "name", 120);
    const kind = text(formData, "kind", 120);
    const age = text(formData, "age", 120);
    const blurb = text(formData, "blurb", 600);
    const description = text(formData, "description", 6000);
    if (!name || !kind || !age || !blurb || !description) {
      return { error: "Name, tagline, badge line, summary and description are all needed." };
    }

    const imageRaw = text(formData, "image", 200);
    const image = SPACE_IMAGES.includes(imageRaw) ? imageRaw : existing.image;

    const features = text(formData, "features", 2000)
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean)
      .slice(0, 12);

    // Reservations are free; only event spaces carry a rate, and 0 there means
    // "price on request". The weekly rate and cleaning fee are unused at KAU.
    const isEvent = formData.get("isEvent") === "on";
    const nightlyRateCents = isEvent
      ? (parseMoney(text(formData, "nightlyRate", 20)) ?? 0)
      : 0;

    await db
      .update(spaces)
      .set({
        name,
        kind,
        age,
        blurb,
        description,
        image,
        features,
        nightlyRateCents,
        weeklyRateCents: null,
        cleaningFeeCents: 0,
        minNights: 1,
        bufferDays: 0,
        capacityCovers: parseIntField(
          text(formData, "capacityCovers", 5),
          existing.capacityCovers,
          0,
          2000
        ),
        maxGuests: parseIntField(text(formData, "maxGuests", 4), existing.maxGuests, 1, 1000),
        minLeadDays: parseIntField(text(formData, "minLeadDays", 4), existing.minLeadDays, 0, 365),
        maxHorizonMonths: parseIntField(
          text(formData, "maxHorizonMonths", 4),
          existing.maxHorizonMonths,
          1,
          36
        ),
        sortOrder: parseIntField(text(formData, "sortOrder", 4), existing.sortOrder, 0, 99),
        isEvent,
        blocksEstate: formData.get("blocksEstate") === "on",
        active: formData.get("active") === "on",
      })
      .where(eq(spaces.id, id));

    // The landing page is statically revalidated; space pages are dynamic.
    revalidatePath("/");
    revalidatePath("/admin/spaces");
    revalidatePath(`/admin/spaces/${id}`);
    return { ok: true };
  } catch (error) {
    console.error("Space update failed:", error);
    return { error: "Could not save the space — please try again." };
  }
}
