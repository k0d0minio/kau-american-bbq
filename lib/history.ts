// Research behind the KAU story page.
//
// Every substantive claim in the narrative is tied to one or more of the
// numbered sources below. The prose in app/history/* references these by id
// via the <Cite> component so the page can footnote itself and convey
// credibility. Sourcing is Portuguese press coverage of KAU's rise from
// pop-ups to the permanent Malveira smokehouse.

export type Source = {
  id: number;
  /** Author / title / publication, formatted for a footnote line. */
  citation: string;
  url: string;
  /** Press coverage, or a reference listing. */
  kind: "Press" | "Reference";
};

export const sources: Source[] = [
  {
    id: 1,
    citation:
      "“KAU: como uma paixão pelo barbecue americano se transformou num fenómeno de negócio em Portugal.” Forbes Portugal.",
    url: "https://www.forbespt.com/kau-como-uma-paixao-pelo-barbecue-americano-se-transformou-num-fenomeno-de-negocio-em-portugal/",
    kind: "Press",
  },
  {
    id: 2,
    citation:
      "“O Kau está a chegar à Malveira com uma revolução no barbecue.” Time Out Lisboa.",
    url: "https://www.timeout.pt/lisboa/pt/noticias/o-kau-esta-a-chegar-a-malveira-com-uma-revolucao-no-barbecue-041026",
    kind: "Press",
  },
  {
    id: 3,
    citation:
      "“A espera acabou: Kau Barbecue abre portas e as reservas já estão quase esgotadas.” Time Out Lisboa.",
    url: "https://www.timeout.pt/lisboa/pt/noticias/a-espera-acabou-kau-barbecue-abre-portas-e-as-reservas-ja-estao-quase-esgotadas-072826",
    kind: "Press",
  },
  {
    id: 4,
    citation: "“Kau BBQ, 101 restaurantes, Lisboa.” A Mensagem, 14 September 2025.",
    url: "https://amensagem.pt/2025/09/14/kau-bbq-101-restaurantes-lisboa/",
    kind: "Press",
  },
  {
    id: 5,
    citation:
      "“Kau leva a carne defumada para a mata da Malveira.” NiT — Novidades in Town.",
    url: "https://www.nit.pt/comida/restaurantes/kau-leva-a-carne-defumada-para-a-mata-da-malveira-com-passagem-pelo-nos-alive",
    kind: "Press",
  },
  {
    id: 6,
    citation: "“Kau Barbecue — Malveira.” Restaurant Guru.",
    url: "https://restaurantguru.com/Kau-Barbecue-Malveira",
    kind: "Press",
  },
];

export type TimelineEvent = {
  year: string;
  title: string;
  body: string;
  /** Source ids that back this entry. */
  cites: number[];
};

export const timeline: TimelineEvent[] = [
  {
    year: "A bite in Paris",
    title: "Where it started",
    body:
      "Rui Matias tastes real brisket in Paris — and can’t let it go. A trip to Texas follows, to learn barbecue where barbecue was born.",
    cites: [1],
  },
  {
    year: "The pop-up years",
    title: "Festivals & sell-outs",
    body:
      "KAU builds its name the hard way: pop-ups, sports events and festival crowds at NOS Alive and Rock in Rio, selling out event after event.",
    cites: [1, 5],
  },
  {
    year: "2026",
    title: "Godzilla comes home",
    body:
      "The abandoned space in Malveira — spotted on a basketball run with their son — becomes the mother house, built around a custom smoker big enough to earn the name Godzilla.",
    cites: [2, 1],
  },
  {
    year: "July 28, 2026",
    title: "Doors open",
    body:
      "KAU Barbecue opens in Malveira and reaches full capacity within hours. Thursday to Sunday, the smoke hasn’t stopped since.",
    cites: [3, 6],
  },
];

export type Figure = {
  id: string;
  name: string;
  /** A short line under the name — a place, a date, or a one-line history. */
  life: string;
  role: string;
  image: string;
  alt: string;
  /** Each paragraph may end with citation ids appended by the component. */
  paragraphs: { text: string; cites: number[] }[];
};

export const figures: Figure[] = [
  {
    id: "rui",
    name: "Rui Matias",
    life: "From O Bolo do Caco to KAU",
    role: "Founder & pitmaster",
    image: "/img/story/rui.jpg",
    alt: "Rui Matias in a KAU apron at the door of the smokehouse",
    paragraphs: [
      {
        text:
          "Before KAU, Rui and Vera ran O Bolo do Caco. The turn came in Paris, over a plate of brisket good enough to send him to Texas to learn how it was really done — low and slow, cut fresh, sold by weight.",
        cites: [1],
      },
      {
        text:
          "What he brought home he tested the hard way: pop-ups, sports events and festival crowds at NOS Alive and Rock in Rio, one sold-out service after another, until a permanent smokehouse was the only thing left to build.",
        cites: [1, 5],
      },
    ],
  },
  {
    id: "vera",
    name: "Vera Matias",
    life: "From O Bolo do Caco to KAU",
    role: "Co-founder",
    image: "/img/story/founders.jpg",
    alt: "Rui and Vera Matias outside the KAU smokehouse in Malveira",
    paragraphs: [
      {
        text:
          "KAU is a two-name operation. Vera co-founded the brand with Rui, carrying it from O Bolo do Caco through the pop-up years to the permanent restaurant in Malveira.",
        cites: [1],
      },
      {
        text:
          "The Malveira space itself came out of ordinary life: an abandoned building the couple spotted on a basketball run with their son, which became the mother house — one of the largest steakhouses in the country.",
        cites: [2, 1],
      },
    ],
  },
  {
    id: "godzilla",
    name: "Godzilla",
    life: "Malveira, 2026",
    role: "The smoker",
    image: "/img/story/godzilla.jpg",
    alt: "Godzilla, KAU's huge custom smoker, open with briskets inside",
    paragraphs: [
      {
        text:
          "The heart of the house is a custom smoker so large it earned a nickname. Godzilla runs from before sunrise: brisket and beef rib Black Angus, St. Louis pork ribs, pulled pork and smoked turkey breast, all of it hours in the smoke.",
        cites: [2, 1],
      },
      {
        text:
          "Everything is cut fresh and sold by weight — either brought to your table or built into a tray in front of you at the Texan counter.",
        cites: [3],
      },
    ],
  },
];
