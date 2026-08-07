// How a party wants to be served. KAU is one dining room with one pool of
// covers; the format is a preference the kitchen and floor need to know, not a
// separate bookable space, so it never affects capacity.
//
// The labels and notes are guest-facing and live in lib/i18n/dictionaries.ts,
// keyed by these ids.
export const DINING_FORMATS = ["table", "counter"] as const;
export type DiningFormat = (typeof DINING_FORMATS)[number];

export function isDiningFormat(value: unknown): value is DiningFormat {
  return (DINING_FORMATS as readonly unknown[]).includes(value);
}
