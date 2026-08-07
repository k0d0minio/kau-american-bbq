// How a party wants to be served. KAU is one dining room with one pool of
// covers; the format is a preference the kitchen and floor need to know, not a
// separate bookable space, so it never affects capacity.
export const DINING_FORMATS = ["table", "counter"] as const;
export type DiningFormat = (typeof DINING_FORMATS)[number];

export const DINING_FORMAT_LABELS: Record<DiningFormat, string> = {
  table: "Table service",
  counter: "The Texan counter",
};

export const DINING_FORMAT_NOTES: Record<DiningFormat, string> = {
  table: "Order from the table and let the meat come to you.",
  counter: "Step up to the counter and watch your meats cut and weighed.",
};

export function isDiningFormat(value: unknown): value is DiningFormat {
  return (DINING_FORMATS as readonly unknown[]).includes(value);
}
