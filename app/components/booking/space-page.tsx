import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Phone, ShieldCheck, Users } from "lucide-react";
import { Nav } from "@/app/components/nav";
import { Footer } from "@/app/components/footer";
import { site } from "@/lib/site";
import {
  getActiveSpaces,
  getAvailabilityData,
  getSpaceBySlug,
} from "@/lib/db/queries";
import { getCancellationPolicy } from "@/lib/settings";
import { blockedRanges, bookingWindow } from "@/lib/booking/availability";
import { todayAtRestaurant } from "@/lib/booking/dates";
import { formatMoney } from "@/lib/booking/pricing";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { fill } from "@/lib/i18n/format";
import { languageAlternates, localeHome, localeHref, type Locale } from "@/lib/i18n/config";
import { BookingPanel, type PanelSpace } from "./panel";

/**
 * The space detail page — description, house rules and the reservation panel.
 * Rendered once per language from app/(en)/spaces/[slug] and
 * app/(pt)/pt/spaces/[slug]; the copy comes from the dictionary and the space
 * itself comes from the database.
 */
export async function spacePageMetadata(
  slug: string,
  locale: Locale
): Promise<Metadata> {
  const t = getDictionary(locale).spacePage;
  try {
    const space = await getSpaceBySlug(slug);
    if (space?.active) {
      return {
        title: space.name,
        description: space.blurb,
        alternates: {
          canonical: localeHref(locale, `/spaces/${space.slug}`),
          languages: languageAlternates(`/spaces/${space.slug}`),
        },
      };
    }
  } catch {
    // fall through to the default
  }
  return { title: t.fallbackTitle };
}

export async function SpaceDetailPage({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const space = await getSpaceBySlug(slug);
  if (!space || !space.active) notFound();

  const t = getDictionary(locale).spacePage;
  const today = todayAtRestaurant();
  const window = bookingWindow(space, today);
  const [availability, policy, allSpaces] = await Promise.all([
    getAvailabilityData(today, window.lastEnd),
    getCancellationPolicy(),
    getActiveSpaces(),
  ]);
  const closures = blockedRanges(space, availability.blackouts);

  const panelSpace: PanelSpace = {
    id: space.id,
    slug: space.slug,
    name: space.name,
    isEvent: space.isEvent,
    blocksEstate: space.blocksEstate,
    maxGuests: space.maxGuests,
    capacityCovers: space.capacityCovers,
    minLeadDays: space.minLeadDays,
    maxHorizonMonths: space.maxHorizonMonths,
  };

  const paragraphs = space.description.split(/\n\n+/).filter(Boolean);
  const otherSpaces = allSpaces.filter((s) => s.id !== space.id);

  return (
    <>
      <Nav locale={locale} />
      <main>
        {/* Hero */}
        <section className="relative flex min-h-[52vh] items-end overflow-hidden">
          <Image
            src={space.image}
            alt={space.name}
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-char-900/55 via-char-900/20 to-char-900/75" />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-12 pt-40 sm:px-8 sm:pb-16">
            <Link
              href={`${localeHome(locale)}#spaces`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-bone/80 transition-colors hover:text-bone"
            >
              <ArrowLeft className="size-4" />
              {t.back}
            </Link>
            <p className="mt-6 eyebrow text-ember-soft">{space.kind}</p>
            <h1 className="mt-3 font-display text-4xl font-light leading-[1.05] text-bone sm:text-6xl">
              {space.name}
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-bone/80">
              <span>{space.age}</span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" />
                {fill(t.tablesUpTo, { max: space.maxGuests })}
              </span>
              <span className="font-medium text-bone">{t.hours}</span>
            </p>
          </div>
        </section>

        {/* Body */}
        <section className="bg-bone py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_26.5rem] lg:gap-16">
            <div>
              {paragraphs.map((para, i) => (
                <p
                  key={i}
                  className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-ink-soft first:mt-0 sm:text-lg"
                >
                  {para}
                </p>
              ))}

              <h2 className="mt-12 font-display text-2xl text-char-900">{t.features}</h2>
              <ul className="mt-5 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {space.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <Check className="size-4 shrink-0 text-rust" />
                    {feature}
                  </li>
                ))}
              </ul>

              {space.isEvent ? (
                <>
                  <h2 className="mt-12 font-display text-2xl text-char-900">{t.privateHire}</h2>
                  <dl className="mt-5 max-w-md divide-y divide-char-100 rounded-2xl border border-char-100 bg-bone-100 px-5">
                    <div className="flex items-center justify-between py-3">
                      <dt className="text-sm text-stone">{t.perEventDay}</dt>
                      <dd className="text-sm font-medium text-ink">
                        {space.nightlyRateCents > 0
                          ? formatMoney(space.nightlyRateCents)
                          : t.priceOnRequest}
                      </dd>
                    </div>
                  </dl>
                </>
              ) : null}
              {space.blocksEstate ? (
                <p className="mt-4 flex max-w-md items-start gap-2 text-sm text-stone">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-rust" />
                  {t.blocksVenue}
                </p>
              ) : null}

              {policy ? (
                <>
                  <h2 className="mt-12 font-display text-2xl text-char-900">{t.goodToKnow}</h2>
                  <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-stone">
                    {policy}
                  </p>
                </>
              ) : null}

              <p className="mt-10 text-sm text-ink-soft">
                {t.questionsBefore}{" "}
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center gap-1.5 font-medium text-char-700 hover:text-ember"
                >
                  <Phone className="size-3.5" />
                  {site.phone}
                </a>{" "}
                {t.or}{" "}
                <Link href="/enquire" className="font-medium text-char-700 hover:text-ember">
                  {t.sendEnquiry}
                </Link>
                .
              </p>
            </div>

            {/* Booking first on small screens — guests arriving from a "Book a
                table" CTA should see the form, not scroll past the copy. */}
            <div id="reserve" className="order-first scroll-mt-24 lg:order-none lg:sticky lg:top-24 lg:self-start">
              <BookingPanel
                space={panelSpace}
                blocks={availability.bookings}
                closures={closures}
                today={today}
                locale={locale}
              />
            </div>
          </div>
        </section>

        {/* Other spaces */}
        {otherSpaces.length > 0 ? (
          <section className="border-t border-char-100 bg-parchment/60 py-12">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-5 sm:px-8">
              <span className="eyebrow text-stone">{t.alsoAtKau}</span>
              {otherSpaces.map((s) => (
                <Link
                  key={s.id}
                  href={localeHref(locale, `/spaces/${s.slug}`)}
                  className="font-display text-lg text-char-700 transition-colors hover:text-ember"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer locale={locale} />
    </>
  );
}
