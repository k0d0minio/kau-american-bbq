// Calendar-date helpers for the booking system.
//
// All booking dates are plain "YYYY-MM-DD" strings in the restaurant's local
// calendar (Europe/Lisbon) — never Date objects with timezones attached.
// Every helper anchors math at UTC midnight so a date is the same date
// everywhere, and ISO strings compare correctly with plain `<`/`>`.
//
// Ranges are half-open [startDate, endDate): a reservation on the 8th runs
// [2026-06-08, 2026-06-09), so two bookings sharing a boundary date do not
// overlap.

import { localeMeta, defaultLocale, type Locale } from "@/lib/i18n/config";

export type ISODate = string;

/** Formatting language. Defaults to English so admin call sites stay unchanged. */
function intl(locale: Locale = defaultLocale): string {
  return localeMeta[locale].intl;
}

const DAY_MS = 86_400_000;

export function isValidISODate(value: unknown): value is ISODate {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  // Round-trip to reject impossible dates like 2026-02-31.
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function parseISO(date: ISODate): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function toISO(date: Date): ISODate {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: ISODate, days: number): ISODate {
  return toISO(new Date(parseISO(date).getTime() + days * DAY_MS));
}

/** Add calendar months, clamping to the last day of the target month. */
export function addMonths(date: ISODate, months: number): ISODate {
  const d = parseISO(date);
  const target = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, d.getUTCDate())
  );
  if (target.getUTCDate() !== d.getUTCDate()) target.setUTCDate(0);
  return toISO(target);
}

/** Whole days from `a` to `b` — the length of the half-open range [a, b). */
export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / DAY_MS);
}

/** Half-open range overlap: [aStart, aEnd) ∩ [bStart, bEnd) ≠ ∅. */
export function rangesOverlap(
  aStart: ISODate,
  aEnd: ISODate,
  bStart: ISODate,
  bEnd: ISODate
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Today as a calendar date at the restaurant (Europe/Lisbon). */
export function todayAtRestaurant(): ISODate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
  }).format(new Date());
}

/** "Fri, 5 Jun 2026" / "sex., 5 de jun. de 2026" */
export function formatDate(date: ISODate, locale?: Locale): string {
  return new Intl.DateTimeFormat(intl(locale), {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseISO(date));
}

/** "5 Jun" — compact, for calendars and dense lists. */
export function formatDayMonth(date: ISODate, locale?: Locale): string {
  return new Intl.DateTimeFormat(intl(locale), {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parseISO(date));
}

/** "June 2026" — month headings. */
export function formatMonth(date: ISODate, locale?: Locale): string {
  return new Intl.DateTimeFormat(intl(locale), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseISO(date));
}

/**
 * Display a date range. The half-open endDate is shown as-is; the last
 * *included* day is endDate − 1.
 */
export function formatRange(startDate: ISODate, endDate: ISODate, locale?: Locale): string {
  return `${formatDate(startDate, locale)} → ${formatDate(endDate, locale)}`;
}

/**
 * Monday-first weekday initials for the booking calendar, in the visitor's
 * language. Derived from Intl rather than hardcoded so a new locale needs no
 * extra translation.
 */
export function weekdayInitials(locale?: Locale): string[] {
  const fmt = new Intl.DateTimeFormat(intl(locale), { weekday: "short", timeZone: "UTC" });
  // 2026-06-01 is a Monday, so seven days from it cover the week in order.
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(parseISO(addDays("2026-06-01", i))).replace(/\.$/, "").slice(0, 2)
  );
}
