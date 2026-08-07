// Metadata shared by the two language roots. Everything that reads as prose
// comes from the dictionary so the Portuguese page ships Portuguese titles,
// descriptions and social cards rather than translated body copy under an
// English <title>.
import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { languageAlternates, localeHome, localeMeta, type Locale } from "@/lib/i18n/config";

/** Root-layout metadata for a language. Inherited by every page beneath it. */
export function siteMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale).meta;
  const title = `${site.fullName} — ${t.tagline}`;

  return {
    metadataBase: new URL(site.url),
    title: {
      default: title,
      template: `%s · ${site.fullName}`,
    },
    description: t.description,
    keywords: [...t.keywords],
    authors: [{ name: site.fullName }],
    creator: site.fullName,
    // Open Graph image, Twitter image and icons are provided by the file
    // conventions in app/ (opengraph-image.jpg, twitter-image.jpg, icon.svg,
    // apple-icon.png). Next infers their exact dimensions, type and absolute
    // URLs from metadataBase automatically.
    openGraph: {
      type: "website",
      locale: localeMeta[locale].ogLocale,
      url: localeHome(locale),
      siteName: site.fullName,
      title,
      description: t.description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

/**
 * Canonical + hreflang for the landing page. Set on the page rather than the
 * layout so sub-pages keep their own self-referencing canonical instead of
 * inheriting the home page's.
 */
export function landingMetadata(locale: Locale): Metadata {
  return {
    alternates: {
      canonical: localeHome(locale),
      languages: languageAlternates,
    },
  };
}

export function restaurantJsonLd(locale: Locale) {
  const t = getDictionary(locale).meta;

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.fullName,
    description: t.description,
    telephone: site.phone,
    url: site.url,
    inLanguage: localeMeta[locale].htmlLang,
    servesCuisine: "American barbecue",
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.line1,
      addressLocality: site.address.city,
      postalCode: site.address.postalCode,
      addressCountry: "PT",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Thursday", "Friday", "Saturday", "Sunday"],
        opens: "12:00",
        closes: "15:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Thursday", "Friday", "Saturday", "Sunday"],
        opens: "19:00",
        closes: "22:00",
      },
    ],
    acceptsReservations: "True",
  };
}
