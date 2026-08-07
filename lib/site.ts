export const site = {
  name: "KAU",
  fullName: "KAU Barbecue",
  tagline: "American barbecue, smoked low and slow in Malveira",
  description:
    "Texas-style barbecue in the heart of Malveira — brisket, beef ribs and pulled pork smoked low and slow on our custom smoker, Godzilla, cut fresh and sold by weight. Table service or the authentic Texan counter. Thursday to Sunday, lunch and dinner.",
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

/**
 * The two ways of being served in that room. Presentational only — guests pick
 * one on the reservation form, and both share the same covers.
 */
export const diningFormats = [
  {
    id: "table",
    name: "Table service",
    kind: "Sit down, we'll bring it",
    image: "/img/dining-room.jpg",
    blurb:
      "Sit down, order from the table and let the meat come to you — brisket, ribs and all the fixings, straight off Godzilla and carved to order.",
    features: ["Full table service", "Tables for 2–8", "Sides, sauces & desserts"],
  },
  {
    id: "counter",
    name: "The Texan counter",
    kind: "Tray service, Texas-style",
    image: "/img/counter.jpg",
    blurb:
      "The real-deal Texas experience: step up to the counter, watch your meats cut and weighed in the moment, and carry your tray to the table.",
    features: ["Cut & weighed in front of you", "Fastest way to the meat", "Same smoke, no waiting"],
  },
] as const;

export const gallery = [
  {
    src: "/img/hero-smokehouse.jpg",
    alt: "Godzilla, KAU's custom smoker, open with briskets resting in the smoke",
    span: "wide",
  },
  { src: "/img/brisket.jpg", alt: "Slicing a smoked brisket to order at the board" },
  {
    src: "/img/dining-room.jpg",
    alt: "The KAU dining room in Malveira under its black pendant lamps",
  },
  {
    src: "/img/trays.jpg",
    alt: "Brisket sandwiches, coleslaw and crisps served on paper",
  },
  {
    src: "/img/ribs.jpg",
    alt: "Smoked pork ribs with KAU sauces, potato salad and pickles",
  },
  {
    src: "/img/smoker.jpg",
    alt: "Cooking over the offset smoker at a KAU pop-up",
    span: "wide",
  },
] as const;

export const nearby = [
  { name: "Mafra", note: "The Royal Convent and town — 10 minutes away" },
  { name: "Ericeira", note: "World Surfing Reserve, beaches and seafood" },
  { name: "Lisbon", note: "The capital, around 35 minutes down the A8" },
  { name: "Malveira market", note: "One of the region's great traditional markets" },
] as const;
