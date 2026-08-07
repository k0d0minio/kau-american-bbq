import { Instagram, MapPin, Phone, Mail } from "lucide-react";
import { site } from "@/lib/site";
import { Reveal } from "./motion";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-pine-900 text-cream/80">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <Reveal>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <p className="font-display text-3xl text-cream">KAU</p>
              <p className="mt-1 eyebrow text-amber-soft">American Barbecue · Malveira</p>
              <p className="mt-6 max-w-sm text-pretty text-sm leading-relaxed text-cream/70">
                {site.tagline}. Thursday to Sunday — lunch 12:00–15:00, dinner 19:00–22:00.
              </p>
            </div>

            <div>
              <h3 className="eyebrow text-cream/50">Visit</h3>
              <a
                href={site.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-start gap-3 text-sm leading-relaxed transition-colors hover:text-cream"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-amber-soft" />
                <span>
                  {site.address.line1}
                  <br />
                  {site.address.postalCode} {site.address.city}
                </span>
              </a>
            </div>

            <div>
              <h3 className="eyebrow text-cream/50">Enquire</h3>
              <div className="mt-4 space-y-3 text-sm">
                <a
                  href={site.phoneHref}
                  className="flex items-center gap-3 transition-colors hover:text-cream"
                >
                  <Phone className="size-4 shrink-0 text-amber-soft" />
                  {site.phone}
                </a>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-3 transition-colors hover:text-cream"
                >
                  <Mail className="size-4 shrink-0 text-amber-soft" />
                  {site.email}
                </a>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-cream"
                >
                  <Instagram className="size-4 shrink-0 text-amber-soft" />
                  @kau_barbecue
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col gap-4 border-t border-cream/10 pt-8 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} KAU Barbecue. All rights reserved.</p>
          <p className="text-cream/40">Smoked daily in Malveira, Portugal.</p>
        </div>
      </div>
    </footer>
  );
}
