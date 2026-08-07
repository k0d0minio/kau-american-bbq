// Display shapes for the bookable space on the public site, plus a static
// fallback so the marketing landing page still renders if the database is
// unreachable (or at build time before DATABASE_URL exists). The fallback
// mirrors the seeded content.
import type { Space } from "@/lib/db/schema";
import { formatMoney } from "@/lib/booking/pricing";
import { spaces as staticSpaces } from "@/lib/site";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export type SpaceCardData = {
  slug: string;
  name: string;
  kind: string;
  age: string;
  image: string;
  blurb: string;
  features: string[];
  /** Whether booking is charged, and at what rate — see `fromLabel`. */
  isEvent: boolean;
  rateCents: number;
};

/**
 * How booking is priced, in the visitor's language, e.g. "Free to book ·
 * reserve online". Built from the dictionary rather than baked into the card so
 * the same row can render on either landing page.
 */
export function fromLabel(space: SpaceCardData, t: Dictionary["spaces"]): string {
  if (!space.isEvent) return t.freeToBook;
  if (space.rateCents <= 0) return t.priceOnRequest;
  return t.fromPerDay.replace("{price}", formatMoney(space.rateCents));
}

export function toSpaceCard(space: Space): SpaceCardData {
  return {
    slug: space.slug,
    name: space.name,
    kind: space.kind,
    age: space.age,
    image: space.image,
    blurb: space.blurb,
    features: space.features,
    isEvent: space.isEvent,
    rateCents: space.nightlyRateCents,
  };
}

export const fallbackSpaceCards: SpaceCardData[] = staticSpaces.map((s) => ({
  slug: s.id,
  name: s.name,
  kind: s.kind,
  age: s.age,
  image: s.image,
  blurb: s.blurb,
  features: [...s.features],
  isEvent: false,
  rateCents: 0,
}));
