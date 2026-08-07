// The public site is offered in English and Portuguese. English keeps the bare
// paths it has always had so existing links and search results stay valid;
// Portuguese lives under a /pt prefix.
export const locales = ["en", "pt"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeMeta: Record<
  Locale,
  { htmlLang: string; ogLocale: string; label: string; short: string; intl: string }
> = {
  en: { htmlLang: "en", ogLocale: "en_US", label: "English", short: "EN", intl: "en-GB" },
  pt: { htmlLang: "pt-PT", ogLocale: "pt_PT", label: "Português", short: "PT", intl: "pt-PT" },
};

export function isLocale(value: unknown): value is Locale {
  return (locales as readonly unknown[]).includes(value);
}

/**
 * Route prefixes that exist in every language. Anything outside this list —
 * /enquire, /history, /admin — is served in English only, so links to it are
 * never prefixed.
 */
const TRANSLATED_PREFIXES = ["/book", "/spaces", "/bookings"] as const;

function isTranslatedPath(path: string): boolean {
  return TRANSLATED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Where the landing page lives for a locale — "/" for English, "/pt" otherwise. */
export function localeHome(locale: Locale): string {
  return locale === defaultLocale ? "/" : `/${locale}`;
}

/** Prefix an app path with the locale segment, where a translation exists. */
export function localeHref(locale: Locale, path: string): string {
  if (locale === defaultLocale) return path;
  if (path === "/") return localeHome(locale);
  return isTranslatedPath(path) ? `/${locale}${path}` : path;
}

/** Strip any locale prefix, returning the canonical English path. */
export function stripLocale(pathname: string): string {
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(`/${locale}`.length);
  }
  return pathname;
}

/**
 * The same page in another language. Used by the EN / PT switch: a translated
 * page swaps in place, and an English-only one sends the visitor to that
 * language's home rather than a route that does not exist.
 */
export function alternatePath(pathname: string, target: Locale): string {
  const canonical = stripLocale(pathname);
  if (canonical !== "/" && !isTranslatedPath(canonical)) {
    // An untranslated page is already English, so English stays put; any other
    // language has nowhere to go but its own home.
    return target === defaultLocale ? canonical : localeHome(target);
  }
  return localeHref(target, canonical);
}

/** hreflang map for `alternates.languages`, plus the x-default fallback. */
export function languageAlternates(path: string): Record<string, string> {
  return {
    en: localeHref("en", path),
    "pt-PT": localeHref("pt", path),
    "x-default": localeHref(defaultLocale, path),
  };
}
