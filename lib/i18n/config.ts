// The public landing page is offered in English and Portuguese. English keeps
// the bare paths it has always had so existing links and search results stay
// valid; Portuguese lives under a /pt prefix.
export const locales = ["en", "pt"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeMeta: Record<
  Locale,
  { htmlLang: string; ogLocale: string; label: string; short: string }
> = {
  en: { htmlLang: "en", ogLocale: "en_US", label: "English", short: "EN" },
  pt: { htmlLang: "pt-PT", ogLocale: "pt_PT", label: "Português", short: "PT" },
};

export function isLocale(value: unknown): value is Locale {
  return (locales as readonly unknown[]).includes(value);
}

/** Where the landing page lives for a locale — "/" for English, "/pt" otherwise. */
export function localeHome(locale: Locale): string {
  return locale === defaultLocale ? "/" : `/${locale}`;
}

/**
 * Prefix an app path with the locale segment. Only the landing page is
 * translated so far, so anything deeper than "/" stays on its canonical
 * English path.
 */
export function localeHref(locale: Locale, path: string): string {
  if (path === "/") return localeHome(locale);
  return path;
}

/** hreflang map for `alternates.languages`, plus the x-default fallback. */
export const languageAlternates: Record<string, string> = {
  en: localeHome("en"),
  "pt-PT": localeHome("pt"),
  "x-default": localeHome(defaultLocale),
};
