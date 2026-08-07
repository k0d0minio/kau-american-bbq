// Resolving where a "Book a table" CTA should land. KAU is a single room, so
// /book forwards straight to that space's reservation page — no anchor, no card
// to click through.
import { getActiveSpaces } from "@/lib/db/queries";
import { spaces as staticSpaces } from "@/lib/site";

export async function bookableSlug(): Promise<string> {
  try {
    const [space] = await getActiveSpaces();
    if (space) return space.slug;
  } catch (error) {
    // Never dead-end the main CTA on a database hiccup — the seeded slug in
    // lib/site mirrors the live row.
    console.error("Book redirect: failed to load spaces", error);
  }
  return staticSpaces[0].id;
}
