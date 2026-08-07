import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { fraunces, inter } from "../fonts/fonts";
import { localeMeta } from "@/lib/i18n/config";
import { restaurantJsonLd, siteMetadata } from "@/lib/seo";
import "../globals.css";

// Portuguese root layout — see the note in app/(en)/layout.tsx.
export const metadata: Metadata = siteMetadata("pt");

export const viewport: Viewport = {
  themeColor: "#1c1917",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function PortugueseRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={localeMeta.pt.htmlLang} className={`${fraunces.variable} ${inter.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd("pt")) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
