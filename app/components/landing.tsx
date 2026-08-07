import { Nav } from "./nav";
import { Footer } from "./footer";
import { Hero } from "../sections/hero";
import { Smokehouse } from "../sections/smokehouse";
import { Spaces } from "../sections/spaces";
import { Gallery } from "../sections/gallery";
import { Location } from "../sections/location";
import { BookingCta } from "../sections/booking-cta";
import { getActiveSpaces } from "@/lib/db/queries";
import { fallbackSpaceCards, toSpaceCard, type SpaceCardData } from "@/lib/spaces";
import type { Locale } from "@/lib/i18n/config";

// The landing page must never go down with the database: fall back to the
// static space content (sans live pricing) if the query fails — e.g. during a
// local build with no DATABASE_URL.
async function loadSpaceCards(): Promise<SpaceCardData[]> {
  try {
    const rows = await getActiveSpaces();
    if (rows.length > 0) return rows.map(toSpaceCard);
  } catch (error) {
    console.error("Falling back to static space content:", error);
  }
  return fallbackSpaceCards;
}

/**
 * The landing page, rendered once per language from app/(en)/page.tsx and
 * app/(pt)/pt/page.tsx. All copy comes from lib/i18n/dictionaries.ts; the
 * imagery, layout and booking links are shared.
 */
export async function Landing({ locale }: { locale: Locale }) {
  const spaceCards = await loadSpaceCards();

  return (
    <>
      <Nav locale={locale} />
      <main>
        <Hero locale={locale} />
        <Smokehouse locale={locale} />
        <Spaces spaces={spaceCards} locale={locale} />
        <Gallery locale={locale} />
        <Location locale={locale} />
        <BookingCta locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
