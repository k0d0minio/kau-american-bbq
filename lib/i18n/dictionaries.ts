// Every word of the landing page, in both languages. The English object is the
// source of truth: `Dictionary` is derived from it, so a missing or misspelled
// key in the Portuguese translation is a type error rather than a hole in the
// page. Keys are structural (ids, not prose) so images and links stay shared.
import type { Locale } from "./config";

const en = {
  meta: {
    tagline: "American barbecue, smoked low and slow in Malveira",
    description:
      "Texas-style barbecue in the heart of Malveira — brisket, beef ribs and pulled pork smoked low and slow on our custom smoker, Godzilla, cut fresh and sold by weight. Table service or the authentic Texan counter. Thursday to Sunday, lunch and dinner.",
    keywords: [
      "KAU Barbecue",
      "American barbecue Portugal",
      "Texas BBQ Lisboa",
      "brisket Portugal",
      "barbecue Malveira",
      "restaurante Malveira",
      "smoked meat Portugal",
    ],
  },

  nav: {
    brandLine: "American Barbecue",
    sections: {
      smokehouse: "The Smokehouse",
      gallery: "Gallery",
      location: "Location",
    },
    story: "Our Story",
    enquire: "Enquire",
    book: "Book a table",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    callSmokehouse: "Call the smokehouse",
    language: "Language",
  },

  hero: {
    eyebrow: "Texas-style barbecue · Malveira, Portugal",
    headline: "Low and slow,",
    headlineAccent: "worth the wait",
    body: "Brisket, beef ribs and pulled pork smoked for hours on Godzilla, our custom smoker — cut fresh, sold by weight, and served the way Texas intended. Thursday to Sunday, lunch and dinner.",
    ctaPrimary: "Book a table",
    ctaSecondary: "Plan a private feast",
    imageAlt: "Lifting the lid on Godzilla, KAU's custom smoker, with briskets inside",
    scrollLabel: "Scroll to explore",
  },

  smokehouse: {
    eyebrow: "The Smokehouse",
    heading: "Real fire, real smoke, real patience",
    paragraphs: [
      "KAU started with a bite of brisket in Paris and a pilgrimage to Texas. Years of pop-ups, festivals and sold-out events later, Rui and Vera Matias opened the doors of their mother house in Malveira — one of the largest steakhouses in the country.",
      "Everything runs through Godzilla, our custom smoker. Meats go in before sunrise and come out hours later — carved in the moment, weighed at the counter, and served while the smoke ring is still proud.",
    ],
    stats: {
      hours: "In the smoke",
      meats: "Meats by weight",
      smoker: "Godzilla — our smoker",
    },
    quote: "These guys really understand what American BBQ is.",
    quoteSource: "Guest review · Google",
    imageAlt: "Seasoning a brisket with rub before it goes into the smoke",
  },

  spaces: {
    eyebrow: "Book a Table",
    heading: "Two ways to eat, one big smoker",
    intro:
      "Sit down for classic table service, or go full Texas at the counter — trays built in the moment, meats cut and weighed in front of you. Choose when you book; the smoke is the same either way. Online reservation required; sittings sell out fast.",
    formats: {
      table: {
        name: "Table service",
        kind: "Sit down, we'll bring it",
        blurb:
          "Sit down, order from the table and let the meat come to you — brisket, ribs and all the fixings, straight off Godzilla and carved to order.",
        features: ["Full table service", "Tables for 2–8", "Sides, sauces & desserts"],
      },
      counter: {
        name: "The Texan counter",
        kind: "Tray service, Texas-style",
        blurb:
          "The real-deal Texas experience: step up to the counter, watch your meats cut and weighed in the moment, and carry your tray to the table.",
        features: [
          "Cut & weighed in front of you",
          "Fastest way to the meat",
          "Same smoke, no waiting",
        ],
      },
    },
    bookKind: "Table service or the Texan counter",
    bookHeading: "Get your seat at the smoker",
    bookBody:
      "Pick your day, lunch or dinner, and how you'd like to be served — we confirm by email.",
    bookImageAlt: "The KAU dining room, ready for service",
    bookCta: "Book a table",
    freeToBook: "Free to book · reserve online",
    priceOnRequest: "Price on request",
    /** {price} is substituted with a formatted amount, e.g. "€40". */
    fromPerDay: "From {price} / day",
  },

  gallery: {
    eyebrow: "Gallery",
    heading: "From the smoke to the table",
    intro:
      "Brisket at sunrise, trays at noon, and Godzilla breathing smoke all day — a look inside KAU.",
    alts: {
      "hero-smokehouse":
        "Godzilla, KAU's custom smoker, open with briskets resting in the smoke",
      brisket: "Slicing a smoked brisket to order at the board",
      "dining-room": "The KAU dining room in Malveira under its black pendant lamps",
      trays: "Brisket sandwiches, coleslaw and crisps served on paper",
      ribs: "Smoked pork ribs with KAU sauces, potato salad and pickles",
      smoker: "Cooking over the offset smoker at a KAU pop-up",
    },
  },

  location: {
    eyebrow: "Find Us",
    heading: "In the heart of Malveira",
    intro:
      "Twenty-five minutes from Lisbon and ten from Mafra, KAU sits in the centre of Malveira — easy to reach, hard to leave. Also on Glovo if the sofa wins.",
    nearby: {
      mafra: { name: "Mafra", note: "The Royal Convent and town — 10 minutes away" },
      ericeira: { name: "Ericeira", note: "World Surfing Reserve, beaches and seafood" },
      lisbon: { name: "Lisbon", note: "The capital, around 35 minutes down the A8" },
      market: {
        name: "Malveira market",
        note: "One of the region's great traditional markets",
      },
    },
    directions: "Get directions",
    imageAlt: "Rui and Vera Matias outside KAU Barbecue in Malveira",
  },

  bookingCta: {
    badge: "Online reservations — mandatory & free",
    heading: "Get your seat at the smoker",
    body: "We opened with every table gone in hours, and weekends still sell out. Pick your day, pick lunch or dinner, and we'll confirm by email — nothing is charged online.",
    ctaPrimary: "Book a table",
    ctaSecondary: "Send an enquiry",
    phonePrompt: "Prefer to talk it through?",
    imageAlt: "Slicing a smoked Black Angus brisket at KAU",
  },

  footer: {
    brandLine: "American Barbecue · Malveira",
    hours: "Thursday to Sunday — lunch 12:00–15:00, dinner 19:00–22:00.",
    visit: "Visit",
    enquire: "Enquire",
    rights: "All rights reserved.",
    smokedDaily: "Smoked daily in Malveira, Portugal.",
  },
};

/**
 * Shape every translation must satisfy. Derived from `en` without `as const`,
 * so the field types widen to `string` / `string[]` while the key set stays exact.
 */
export type Dictionary = typeof en;

const pt: Dictionary = {
  meta: {
    tagline: "Barbecue americano, fumado low and slow na Malveira",
    description:
      "Barbecue à moda do Texas no coração da Malveira — brisket, costela de vaca e pulled pork fumados low and slow no Godzilla, o nosso fumeiro feito à medida, cortados na hora e vendidos ao peso. Serviço de mesa ou o autêntico balcão texano. De quinta a domingo, almoço e jantar.",
    keywords: [
      "KAU Barbecue",
      "barbecue americano Portugal",
      "churrasco texano Lisboa",
      "brisket Portugal",
      "barbecue Malveira",
      "restaurante Malveira",
      "carne fumada Portugal",
    ],
  },

  nav: {
    brandLine: "American Barbecue",
    sections: {
      smokehouse: "O Fumeiro",
      gallery: "Galeria",
      location: "Onde Estamos",
    },
    story: "A Nossa História",
    enquire: "Contactar",
    book: "Reservar mesa",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    callSmokehouse: "Ligar para o fumeiro",
    language: "Idioma",
  },

  hero: {
    eyebrow: "Barbecue à moda do Texas · Malveira, Portugal",
    headline: "Low and slow,",
    headlineAccent: "vale cada minuto",
    body: "Brisket, costela de vaca e pulled pork fumados durante horas no Godzilla, o nosso fumeiro feito à medida — cortados na hora, vendidos ao peso e servidos como manda o Texas. De quinta a domingo, almoço e jantar.",
    ctaPrimary: "Reservar mesa",
    ctaSecondary: "Organizar um evento privado",
    imageAlt: "A abrir o Godzilla, o fumeiro feito à medida do KAU, com briskets lá dentro",
    scrollLabel: "Descer para explorar",
  },

  smokehouse: {
    eyebrow: "O Fumeiro",
    heading: "Fogo a sério, fumo a sério, paciência a sério",
    paragraphs: [
      "O KAU começou com uma dentada num brisket em Paris e uma peregrinação ao Texas. Anos de pop-ups, festivais e eventos esgotados depois, Rui e Vera Matias abriram as portas da casa-mãe na Malveira — uma das maiores steakhouses do país.",
      "Passa tudo pelo Godzilla, o nosso fumeiro feito à medida. As carnes entram antes do nascer do sol e saem horas depois — cortadas na hora, pesadas ao balcão e servidas enquanto o anel de fumo ainda se orgulha.",
    ],
    stats: {
      hours: "No fumo",
      meats: "Carnes ao peso",
      smoker: "Godzilla — o nosso fumeiro",
    },
    quote: "Este pessoal percebe mesmo o que é o BBQ americano.",
    quoteSource: "Avaliação de cliente · Google",
    imageAlt: "A temperar um brisket com rub antes de ir para o fumo",
  },

  spaces: {
    eyebrow: "Reservar Mesa",
    heading: "Duas formas de comer, um grande fumeiro",
    intro:
      "Sente-se para um serviço de mesa clássico ou vá de Texas até ao fim no balcão — tabuleiros montados na hora, carnes cortadas e pesadas à sua frente. Escolha na reserva; o fumo é o mesmo nos dois casos. Reserva online obrigatória; os serviços esgotam depressa.",
    formats: {
      table: {
        name: "Serviço de mesa",
        kind: "Sente-se, nós levamos",
        blurb:
          "Sente-se, peça à mesa e deixe a carne vir ter consigo — brisket, costelas e todos os acompanhamentos, saídos do Godzilla e cortados na hora.",
        features: ["Serviço de mesa completo", "Mesas de 2 a 8 pessoas", "Acompanhamentos, molhos e sobremesas"],
      },
      counter: {
        name: "O balcão texano",
        kind: "Serviço de tabuleiro, à texana",
        blurb:
          "A experiência texana genuína: chegue ao balcão, veja as carnes serem cortadas e pesadas na hora e leve o tabuleiro para a mesa.",
        features: [
          "Cortada e pesada à sua frente",
          "O caminho mais rápido até à carne",
          "O mesmo fumo, sem esperas",
        ],
      },
    },
    bookKind: "Serviço de mesa ou o balcão texano",
    bookHeading: "Garanta o seu lugar junto ao fumeiro",
    bookBody:
      "Escolha o dia, almoço ou jantar, e como prefere ser servido — confirmamos por email.",
    bookImageAlt: "A sala do KAU, pronta para o serviço",
    bookCta: "Reservar mesa",
    freeToBook: "Reserva gratuita · marque online",
    priceOnRequest: "Preço sob consulta",
    fromPerDay: "Desde {price} / dia",
  },

  gallery: {
    eyebrow: "Galeria",
    heading: "Do fumo até à mesa",
    intro:
      "Brisket ao nascer do sol, tabuleiros ao meio-dia e o Godzilla a deitar fumo o dia inteiro — um olhar por dentro do KAU.",
    alts: {
      "hero-smokehouse":
        "O Godzilla, o fumeiro feito à medida do KAU, aberto com briskets a repousar no fumo",
      brisket: "A cortar um brisket fumado na hora, na tábua",
      "dining-room": "A sala do KAU na Malveira, sob os candeeiros pretos suspensos",
      trays: "Sandes de brisket, coleslaw e batata frita servidos em papel",
      ribs: "Costelas de porco fumadas com os molhos do KAU, salada de batata e pickles",
      smoker: "A cozinhar no fumeiro offset num pop-up do KAU",
    },
  },

  location: {
    eyebrow: "Onde Estamos",
    heading: "No coração da Malveira",
    intro:
      "A vinte e cinco minutos de Lisboa e a dez de Mafra, o KAU fica no centro da Malveira — fácil de chegar, difícil de deixar. Também no Glovo, se o sofá ganhar.",
    nearby: {
      mafra: { name: "Mafra", note: "O Palácio Nacional e a vila — a 10 minutos" },
      ericeira: { name: "Ericeira", note: "Reserva Mundial de Surf, praias e marisco" },
      lisbon: { name: "Lisboa", note: "A capital, a cerca de 35 minutos pela A8" },
      market: {
        name: "Mercado da Malveira",
        note: "Um dos grandes mercados tradicionais da região",
      },
    },
    directions: "Como chegar",
    imageAlt: "Rui e Vera Matias à porta do KAU Barbecue, na Malveira",
  },

  bookingCta: {
    badge: "Reservas online — obrigatórias e gratuitas",
    heading: "Garanta o seu lugar junto ao fumeiro",
    body: "Abrimos com todas as mesas esgotadas em poucas horas e os fins de semana continuam a esgotar. Escolha o dia, escolha almoço ou jantar, e confirmamos por email — não se paga nada online.",
    ctaPrimary: "Reservar mesa",
    ctaSecondary: "Enviar mensagem",
    phonePrompt: "Prefere falar connosco?",
    imageAlt: "A cortar um brisket de Black Angus fumado no KAU",
  },

  footer: {
    brandLine: "American Barbecue · Malveira",
    hours: "De quinta a domingo — almoço 12:00–15:00, jantar 19:00–22:00.",
    visit: "Visitar",
    enquire: "Contactos",
    rights: "Todos os direitos reservados.",
    smokedDaily: "Fumado todos os dias na Malveira, Portugal.",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, pt };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
