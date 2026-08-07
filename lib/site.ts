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

export const spaces: Space[] = [
  {
    id: "table-service",
    name: "The Dining Room",
    kind: "Classic table service",
    age: "Est. 2026",
    image: "/img/dining-room.jpg",
    blurb:
      "Sit down, order from the table and let the meat come to you — brisket, ribs and all the fixings, straight off Godzilla and carved to order.",
    features: [
      "Full table service",
      "Tables for 2–8",
      "All meats by weight",
      "Sides, sauces & desserts",
    ],
  },
  {
    id: "texan-counter",
    name: "The Texan Counter",
    kind: "Tray service, Texas-style",
    age: "Smoked on Godzilla",
    image: "/img/counter.jpg",
    blurb:
      "The real-deal Texas experience: step up to the counter, watch your meats cut and weighed in the moment, and carry your tray to the table.",
    features: [
      "Cut & weighed in front of you",
      "Fastest way to the meat",
      "Counter & communal seating",
      "Same smoke, no waiting",
    ],
  },
  {
    id: "private-hire",
    name: "Full House — Private Hire",
    kind: "Events & buyouts",
    age: "The whole smokehouse",
    image: "/img/smoker.jpg",
    blurb:
      "Take over the whole smokehouse — the dining room, the counter and Godzilla at full smoke — for birthdays, company feasts and celebrations that need serious meat.",
    features: [
      "Up to 120 guests",
      "Whole-venue exclusivity",
      "Custom feast menus",
      "Godzilla at full smoke",
    ],
  },
];

export const gallery = [
  {
    src: "/img/hero-smokehouse.jpg",
    alt: "Smoke rising from Godzilla, KAU's custom smoker, outside the Malveira smokehouse",
    span: "wide",
  },
  { src: "/img/brisket.jpg", alt: "Sliced Black Angus brisket on a KAU tray" },
  { src: "/img/dining-room.jpg", alt: "Inside the KAU smokehouse dining room in Malveira" },
  { src: "/img/counter.jpg", alt: "Brisket being sliced at the Texan counter" },
  { src: "/img/smoker.jpg", alt: "Godzilla, the custom smoker, at work" },
  {
    src: "/img/trays.jpg",
    alt: "Trays of smoked meats, sides and sauces ready to carry to the table",
    span: "wide",
  },
] as const;

export const nearby = [
  { name: "Mafra", note: "The Royal Convent and town — 10 minutes away" },
  { name: "Ericeira", note: "World Surfing Reserve, beaches and seafood" },
  { name: "Lisbon", note: "The capital, around 35 minutes down the A8" },
  { name: "Malveira market", note: "One of the region's great traditional markets" },
] as const;
