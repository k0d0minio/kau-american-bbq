import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  alternatePath,
  isLocale,
  languageAlternates,
  localeHome,
  localeHref,
  locales,
  stripLocale,
} from "../lib/i18n/config";
import { getDictionary } from "../lib/i18n/dictionaries";
import { fill } from "../lib/i18n/format";

describe("locale paths", () => {
  it("leaves English on the bare paths it has always had", () => {
    assert.equal(localeHome("en"), "/");
    assert.equal(localeHref("en", "/"), "/");
    assert.equal(localeHref("en", "/book"), "/book");
    assert.equal(localeHref("en", "/spaces/kau-barbecue"), "/spaces/kau-barbecue");
  });

  it("prefixes the translated routes for Portuguese", () => {
    assert.equal(localeHome("pt"), "/pt");
    assert.equal(localeHref("pt", "/book"), "/pt/book");
    assert.equal(localeHref("pt", "/spaces/kau-barbecue"), "/pt/spaces/kau-barbecue");
    assert.equal(localeHref("pt", "/bookings/abc123"), "/pt/bookings/abc123");
  });

  it("never prefixes a route that has no translation", () => {
    // /enquire, /history and the admin are English-only: a /pt/... link to
    // them would 404.
    for (const path of ["/enquire", "/history", "/admin", "/admin/bookings"]) {
      assert.equal(localeHref("pt", path), path);
    }
  });

  it("does not mistake a lookalike prefix for a translated route", () => {
    assert.equal(localeHref("pt", "/bookmarks"), "/bookmarks");
    assert.equal(localeHref("pt", "/spacesuit"), "/spacesuit");
  });

  it("strips the locale segment back to the canonical path", () => {
    assert.equal(stripLocale("/pt"), "/");
    assert.equal(stripLocale("/pt/spaces/kau-barbecue"), "/spaces/kau-barbecue");
    assert.equal(stripLocale("/spaces/kau-barbecue"), "/spaces/kau-barbecue");
    assert.equal(stripLocale("/"), "/");
  });
});

describe("language switch", () => {
  it("swaps a translated page in place, both ways", () => {
    assert.equal(alternatePath("/pt/spaces/kau-barbecue", "en"), "/spaces/kau-barbecue");
    assert.equal(alternatePath("/spaces/kau-barbecue", "pt"), "/pt/spaces/kau-barbecue");
    assert.equal(alternatePath("/pt", "en"), "/");
    assert.equal(alternatePath("/", "pt"), "/pt");
  });

  it("falls back to the language home from an English-only page", () => {
    // /history has no Portuguese version, so PT sends the visitor to /pt
    // rather than a route that does not exist.
    assert.equal(alternatePath("/history", "pt"), "/pt");
    assert.equal(alternatePath("/enquire", "pt"), "/pt");
    assert.equal(alternatePath("/history", "en"), "/history");
  });

  it("stays put when the target is the language already showing", () => {
    assert.equal(alternatePath("/pt/book", "pt"), "/pt/book");
    assert.equal(alternatePath("/book", "en"), "/book");
  });
});

describe("hreflang", () => {
  it("cross-references both languages plus an x-default", () => {
    assert.deepEqual(languageAlternates("/"), {
      en: "/",
      "pt-PT": "/pt",
      "x-default": "/",
    });
    assert.deepEqual(languageAlternates("/spaces/kau-barbecue"), {
      en: "/spaces/kau-barbecue",
      "pt-PT": "/pt/spaces/kau-barbecue",
      "x-default": "/spaces/kau-barbecue",
    });
  });
});

describe("dictionaries", () => {
  it("recognises the locales it ships and nothing else", () => {
    assert.deepEqual([...locales], ["en", "pt"]);
    assert.equal(isLocale("pt"), true);
    assert.equal(isLocale("fr"), false);
    assert.equal(isLocale(undefined), false);
  });

  it("translates every booking error code in every language", () => {
    const codes = Object.keys(getDictionary("en").booking.errors);
    for (const locale of locales) {
      const errors = getDictionary(locale).booking.errors as Record<string, string>;
      for (const code of codes) {
        assert.ok(errors[code]?.length, `${locale} is missing ${code}`);
      }
    }
  });

  it("keeps the {max} placeholder in the messages that quote a limit", () => {
    for (const locale of locales) {
      const errors = getDictionary(locale).booking.errors;
      assert.match(errors.out_of_window, /\{max\}/);
      assert.match(errors.party_too_large, /\{max\}/);
    }
  });
});

describe("fill", () => {
  it("substitutes named placeholders", () => {
    assert.equal(fill("up to {max} months", { max: 3 }), "up to 3 months");
    assert.equal(fill("{a} and {b}", { a: "x", b: "y" }), "x and y");
  });

  it("leaves an unknown placeholder alone rather than printing undefined", () => {
    assert.equal(fill("hello {name}", {}), "hello {name}");
  });
});
