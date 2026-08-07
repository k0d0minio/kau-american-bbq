import { redirect } from "next/navigation";
import { getActiveSpaces } from "@/lib/db/queries";
import { spaces as staticSpaces } from "@/lib/site";

// Every "Book a table" CTA points here so a guest reaches the reservation form
// in one click. KAU is a single room, so this resolves the bookable space and
// forwards straight to its booking page — no anchor, no card to click through.
export const dynamic = "force-dynamic";

export default async function BookPage() {
  let slug = staticSpaces[0].id;
  try {
    const [space] = await getActiveSpaces();
    if (space) slug = space.slug;
  } catch (error) {
    // Never dead-end the main CTA on a database hiccup — the seeded slug in
    // lib/site mirrors the live row.
    console.error("Book redirect: failed to load spaces", error);
  }
  redirect(`/spaces/${slug}`);
}
