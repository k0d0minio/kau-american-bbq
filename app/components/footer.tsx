import { Instagram, MapPin, Phone, Mail } from "lucide-react";
import { site } from "@/lib/site";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Reveal } from "./motion";

export function Footer({ locale = defaultLocale }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.footer;

  return (
    <footer className="relative overflow-hidden bg-char-900 text-bone/80">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <Reveal>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <p className="font-display text-3xl text-bone">KAU</p>
              <p className="mt-1 eyebrow text-ember-soft">{t.brandLine}</p>
              <p className="mt-6 max-w-sm text-pretty text-sm leading-relaxed text-bone/70">
                {dict.meta.tagline}. {t.hours}
              </p>
            </div>

            <div>
              <h3 className="eyebrow text-bone/50">{t.visit}</h3>
              <a
                href={site.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-start gap-3 text-sm leading-relaxed transition-colors hover:text-bone"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-ember-soft" />
                <span>
                  {site.address.line1}
                  <br />
                  {site.address.postalCode} {site.address.city}
                </span>
              </a>
            </div>

            <div>
              <h3 className="eyebrow text-bone/50">{t.enquire}</h3>
              <div className="mt-4 space-y-3 text-sm">
                <a
                  href={site.phoneHref}
                  className="flex items-center gap-3 transition-colors hover:text-bone"
                >
                  <Phone className="size-4 shrink-0 text-ember-soft" />
                  {site.phone}
                </a>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-3 transition-colors hover:text-bone"
                >
                  <Mail className="size-4 shrink-0 text-ember-soft" />
                  {site.email}
                </a>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-bone"
                >
                  <Instagram className="size-4 shrink-0 text-ember-soft" />
                  @kau_barbecue
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col gap-4 border-t border-bone/10 pt-8 text-xs text-bone/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} KAU Barbecue. {t.rights}
          </p>
          <p className="text-bone/40">{t.smokedDaily}</p>
        </div>
      </div>
    </footer>
  );
}
