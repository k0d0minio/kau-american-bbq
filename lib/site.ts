export const site = {
  name: "KAU",
  fullName: "KAU Barbecue",
  // The tagline and description are translated — see lib/i18n/dictionaries.ts.
  phone: "+351 968 163 165",
  phoneHref: "tel:+351968163165",
  email: "reservas@kaubarbecue.pt", // TODO(jamie): confirm email CONFIRMED BY JAMIE
  instagram: "https://www.instagram.com/kau_barbecue/",
  address: {
    line1: "R. Dr. José Eduardo Esteves h1",
    city: "Malveira",
    region: "Lisboa",
    postalCode: "2665-248",
    country: "Portugal",
    full: "R. Dr. José Eduardo Esteves h1, 2665-248 Malveira, Portugal",
  },
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=R.+Dr.+José+Eduardo+Esteves+h1+Malveira",
  url: "https://kaubarbecue.jamienisbet.com",
} as const;

export type Space = {
  id: string;
  name: string;
  kind: string;
  age: string;
  image: string;
  blurb: string;
  features: string[];
};

// KAU is one room in Malveira. This mirrors the seeded space row so the
// landing page still renders when the database is unreachable.
export const spaces: Space[] = [
  {
    id: "kau-barbecue",
    name: "KAU Barbecue",
    kind: "Table service or the Texan counter",
    age: "Est. 2026",
    image: "/img/dining-room.jpg",
    blurb:
      "One dining room, two ways to eat: sit down and let the meat come to you, or step up to the counter and watch it cut and weighed in the moment.",
    features: [
      "Full table service or the counter",
      "All meats cut and sold by weight",
      "Sides, sauces & desserts",
      "Thursday to Sunday, lunch & dinner",
    ],
  },
];

// The landing page is bilingual, so anything below is structure only — ids,
// images and layout hints. The prose that goes with each id lives in
// lib/i18n/dictionaries.ts, keyed by the same id.

/**
 * The two ways of being served in that room. Presentational only — guests pick
 * one on the reservation form, and both share the same covers.
 */
export const diningFormats = [
  { id: "table", image: "/img/dining-room.jpg" },
  { id: "counter", image: "/img/counter.jpg" },
] as const;

export const gallery = [
  { id: "hero-smokehouse", src: "/img/hero-smokehouse.jpg", span: "wide" },
  { id: "brisket", src: "/img/brisket.jpg" },
  { id: "dining-room", src: "/img/dining-room.jpg" },
  { id: "trays", src: "/img/trays.jpg" },
  { id: "ribs", src: "/img/ribs.jpg" },
  { id: "smoker", src: "/img/smoker.jpg", span: "wide" },
] as const;

export const nearby = ["mafra", "ericeira", "lisbon", "market"] as const;
