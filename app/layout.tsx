import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { fraunces, inter } from "./fonts/fonts";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.fullName} — ${site.tagline}`,
    template: `%s · ${site.fullName}`,
  },
  description: site.description,
  keywords: [
    "KAU Barbecue",
    "American barbecue Portugal",
    "Texas BBQ Lisboa",
    "brisket Portugal",
    "barbecue Malveira",
    "restaurante Malveira",
    "smoked meat Portugal",
  ],
  authors: [{ name: site.fullName }],
  creator: site.fullName,
  // Open Graph image, Twitter image and icons are provided by the file
  // conventions in app/ (opengraph-image.jpg, twitter-image.jpg, icon.svg,
  // apple-icon.png). Next infers their exact dimensions, type and absolute
  // URLs from metadataBase automatically.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.fullName,
    title: `${site.fullName} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.fullName} — ${site.tagline}`,
    description: site.description,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1917",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: site.fullName,
  description: site.description,
  telephone: site.phone,
  url: site.url,
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
