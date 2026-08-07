import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { fraunces, inter } from "../fonts/fonts";
import { localeMeta } from "@/lib/i18n/config";
import { restaurantJsonLd, siteMetadata } from "@/lib/seo";
import "../globals.css";

// English root layout. Portuguese has its own in app/(pt) so each language can
// serve the correct `lang` attribute and localised metadata; switching
// languages is a full page load, which is what we want between roots.
export const metadata: Metadata = siteMetadata("en");

export const viewport: Viewport = {
  themeColor: "#1c1917",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function EnglishRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={localeMeta.en.htmlLang} className={`${fraunces.variable} ${inter.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd("en")) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
