// Display shapes for the bookable space on the public site, plus a static
// fallback so the marketing landing page still renders if the database is
// unreachable (or at build time before DATABASE_URL exists). The fallback
// mirrors the seeded content.
import type { Space } from "@/lib/db/schema";
import { formatMoney } from "@/lib/booking/pricing";
import { spaces as staticSpaces } from "@/lib/site";

export type SpaceCardData = {
  slug: string;
  name: string;
  kind: string;
  age: string;
  image: string;
  blurb: string;
  features: string[];
  /** How booking is priced, e.g. "Free to book · reserve online". */
  fromLabel: string;
};

function fromLabelFor(space: Pick<Space, "isEvent" | "nightlyRateCents">): string {
  if (!space.isEvent) return "Free to book · reserve online";
  return space.nightlyRateCents > 0
    ? `From ${formatMoney(space.nightlyRateCents)} / day`
    : "Price on request";
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
    fromLabel: fromLabelFor(space),
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
  fromLabel: "Free to book · reserve online",
}));
