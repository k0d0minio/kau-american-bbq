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

  // Shared booking vocabulary — the sittings, service formats and occasions
  // that appear on the reservation form, the status page and the admin.
  booking: {
    services: {
      lunch: "Lunch · 12:00–15:00",
      dinner: "Dinner · 19:00–22:00",
    },
    formats: {
      table: {
        label: "Table service",
        note: "Order from the table and let the meat come to you.",
      },
      counter: {
        label: "The Texan counter",
        note: "Step up to the counter and watch your meats cut and weighed.",
      },
    },
    eventTypes: {
      birthday: "Birthday",
      celebration: "Anniversary or celebration",
      business: "Business lunch or dinner",
      group: "Group or team meal",
      privateEvent: "Full-venue private event",
      other: "Other",
    },
    /** {max} is substituted with a number. */
    errors: {
      invalid_date: "Please pick a valid date.",
      no_service: "Please choose lunch or dinner.",
      closed_weekday: "We're open Thursday to Sunday — please pick another day.",
      out_of_window: "Reservations are open up to {max} months ahead for now.",
      no_party_size: "Please tell us how many people are coming.",
      party_too_large:
        "For groups larger than {max}, call us or send an enquiry — we'll sort something out.",
      closed_day: "We're closed that day — please pick another date.",
      sitting_full: "That sitting is fully booked — try the other sitting or another day.",
    },
  },

  // The space detail page a "Book a table" CTA lands on.
  spacePage: {
    back: "All ways to eat",
    /** {max} is the largest party the room takes. */
    tablesUpTo: "Tables up to {max}",
    hours: "Thu–Sun · lunch & dinner",
    features: "What you'll find",
    privateHire: "Private hire",
    perEventDay: "Per event day",
    priceOnRequest: "Price on request",
    blocksVenue:
      "Private hire closes the whole restaurant to other guests — the room, the counter and Godzilla are all yours.",
    goodToKnow: "Good to know",
    questionsBefore: "Questions before you book?",
    or: "or",
    sendEnquiry: "send an enquiry",
    alsoAtKau: "Also at KAU",
    fallbackTitle: "Ways to eat",
  },

  // The reservation panel — calendar, sitting picker and details form.
  bookingForm: {
    eyebrow: "Reserve a table",
    heading: "Pick your day",
    intro:
      "We're open Thursday to Sunday for lunch and dinner. Choose a day and a sitting — we review every request personally.",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    /** {max} is the largest party the room takes. */
    calendarNote: "Thursday to Sunday · tables up to {max}",
    clear: "Clear",
    pickSitting: "Pick lunch or dinner to finish your request.",
    formatLegend: "How would you like to eat?",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    optional: "(optional)",
    partySize: "How many people?",
    occasion: "Occasion",
    noOccasion: "No special occasion",
    anythingElse: "Anything else",
    messagePlaceholder:
      "Allergies, highchairs, a birthday surprise — anything we should know?",
    submit: "Request a table",
    submitting: "Sending your request…",
    disclaimer:
      "Submitting sends a reservation request — nothing is charged online. We confirm by email.",
    errors: {
      name: "Please tell us your name.",
      email: "That email address doesn't look right.",
      spaceClosed: "This space isn't taking bookings right now.",
      format: "Please choose table service or the counter.",
      save: "Something went wrong saving your request — please try again.",
      send: "Something went wrong sending your request. Please try again, or call us.",
    },
  },

  // The private status page a guest reaches from the form or their email.
  bookingStatus: {
    title: "Your reservation",
    states: {
      pending: {
        title: "Request received",
        body: "We review every request personally and will confirm by email — usually within a few hours.",
      },
      approved: {
        title: "Your table is booked",
        body: "See you in Malveira — come hungry.",
      },
      completed: {
        title: "Thanks for eating with us",
        body: "This reservation is done and dusted. We'd love to see you at KAU again.",
      },
      declined: {
        title: "We couldn't seat you this time",
        body: "See our email for details — the other sitting or another day often works, so do get in touch.",
      },
      cancelled: {
        title: "This reservation is cancelled",
        body: "If that's a surprise, or you'd like to rebook, call or email us any time.",
      },
    },
    /** {email} is substituted with the guest's address. */
    submitted:
      "Your request is on its way — a confirmation email is heading to {email}. Bookmark this page to check your status any time.",
    cancelPending:
      "Cancellation requested — we're reviewing it and will confirm by email shortly.",
    details: "Reservation details",
    reference: "Reference",
    where: "Where",
    date: "Date",
    sitting: "Sitting",
    served: "Served",
    partySize: "Party size",
    occasion: "Occasion",
    bookedBy: "Booked by",
    estimatedTotal: "Estimated total",
    total: "Total",
    estimateNote:
      "An estimate — we confirm the final price when we confirm your booking. Nothing is charged online.",
    payment: {
      paid: "Paid in full — thank you.",
      /** {amount} is a formatted sum; the parenthetical is dropped when unknown. */
      depositPaid: "Deposit received{amount} — balance due before the event.",
      refunded: "Refunded.",
      pending: "We'll be in touch personally about the deposit and payment.",
    },
    changeOfPlans: "Change of plans?",
    withdrawBody: "You can withdraw a pending request at any time — no questions asked.",
    cancelBody:
      "Need to move or cancel? Send a cancellation request and we'll take it from there — moving to another day is often easier than you'd think.",
    policy: "Cancellation policy",
    questions: "Questions? Call",
    orEmail: "or email",
    mailSubject: "Reservation",
    withdraw: {
      cta: "Withdraw this request",
      confirm: "Withdraw your request? The table goes back on sale straight away.",
      yes: "Yes — withdraw it",
    },
    cancel: {
      cta: "Request cancellation",
      confirm:
        "Ask us to cancel this reservation? We'll review it against the cancellation policy and confirm by email.",
      yes: "Yes — request cancellation",
    },
    keep: "Keep my reservation",
    manageErrors: {
      notFound: "We couldn't find this booking.",
      notWithdrawable: "This request can no longer be withdrawn — please contact us.",
      notApproved: "Only confirmed bookings can request cancellation.",
      failed: "Something went wrong — please try again or call us.",
    },
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

  booking: {
    services: {
      lunch: "Almoço · 12:00–15:00",
      dinner: "Jantar · 19:00–22:00",
    },
    formats: {
      table: {
        label: "Serviço de mesa",
        note: "Peça à mesa e deixe a carne vir ter consigo.",
      },
      counter: {
        label: "O balcão texano",
        note: "Chegue ao balcão e veja as carnes serem cortadas e pesadas.",
      },
    },
    eventTypes: {
      birthday: "Aniversário",
      celebration: "Aniversário de casamento ou celebração",
      business: "Almoço ou jantar de negócios",
      group: "Refeição de grupo ou de equipa",
      privateEvent: "Evento privado com espaço reservado",
      other: "Outro",
    },
    errors: {
      invalid_date: "Escolha uma data válida.",
      no_service: "Escolha almoço ou jantar.",
      closed_weekday: "Abrimos de quinta a domingo — escolha outro dia, por favor.",
      out_of_window: "De momento, aceitamos reservas até {max} meses de antecedência.",
      no_party_size: "Diga-nos quantas pessoas são.",
      party_too_large:
        "Para grupos com mais de {max} pessoas, ligue-nos ou envie uma mensagem — arranjamos forma.",
      closed_day: "Estamos fechados nesse dia — escolha outra data, por favor.",
      sitting_full: "Esse serviço está esgotado — experimente o outro serviço ou outro dia.",
    },
  },

  spacePage: {
    back: "Todas as formas de comer",
    tablesUpTo: "Mesas até {max} pessoas",
    hours: "Qui–Dom · almoço e jantar",
    features: "O que vai encontrar",
    privateHire: "Espaço reservado",
    perEventDay: "Por dia de evento",
    priceOnRequest: "Preço sob consulta",
    blocksVenue:
      "O espaço reservado fecha o restaurante aos restantes clientes — a sala, o balcão e o Godzilla são todos seus.",
    goodToKnow: "A saber",
    questionsBefore: "Dúvidas antes de reservar?",
    or: "ou",
    sendEnquiry: "envie-nos uma mensagem",
    alsoAtKau: "Também no KAU",
    fallbackTitle: "Formas de comer",
  },

  bookingForm: {
    eyebrow: "Reservar mesa",
    heading: "Escolha o seu dia",
    intro:
      "Abrimos de quinta a domingo, para almoço e jantar. Escolha o dia e o serviço — vemos todos os pedidos pessoalmente.",
    prevMonth: "Mês anterior",
    nextMonth: "Mês seguinte",
    calendarNote: "De quinta a domingo · mesas até {max} pessoas",
    clear: "Limpar",
    pickSitting: "Escolha almoço ou jantar para concluir o pedido.",
    formatLegend: "Como prefere comer?",
    firstName: "Nome",
    lastName: "Apelido",
    email: "Email",
    phone: "Telemóvel",
    optional: "(opcional)",
    partySize: "Quantas pessoas?",
    occasion: "Ocasião",
    noOccasion: "Sem ocasião especial",
    anythingElse: "Mais alguma coisa",
    messagePlaceholder:
      "Alergias, cadeiras de bebé, uma surpresa de aniversário — algo que devamos saber?",
    submit: "Pedir mesa",
    submitting: "A enviar o seu pedido…",
    disclaimer:
      "Ao enviar, faz um pedido de reserva — não se paga nada online. Confirmamos por email.",
    errors: {
      name: "Diga-nos o seu nome, por favor.",
      email: "Esse endereço de email não parece correto.",
      spaceClosed: "Este espaço não está a aceitar reservas de momento.",
      format: "Escolha serviço de mesa ou balcão.",
      save: "Algo correu mal ao guardar o seu pedido — tente novamente, por favor.",
      send: "Algo correu mal ao enviar o seu pedido. Tente novamente ou ligue-nos.",
    },
  },

  bookingStatus: {
    title: "A sua reserva",
    states: {
      pending: {
        title: "Pedido recebido",
        body: "Vemos todos os pedidos pessoalmente e confirmamos por email — normalmente em poucas horas.",
      },
      approved: {
        title: "A sua mesa está reservada",
        body: "Até já na Malveira — venha com fome.",
      },
      completed: {
        title: "Obrigado por ter comido connosco",
        body: "Esta reserva está concluída. Adorávamos voltar a vê-lo no KAU.",
      },
      declined: {
        title: "Desta vez não conseguimos arranjar mesa",
        body: "Veja os detalhes no nosso email — o outro serviço ou outro dia costumam resultar, por isso fale connosco.",
      },
      cancelled: {
        title: "Esta reserva foi cancelada",
        body: "Se isto for uma surpresa, ou quiser voltar a reservar, ligue-nos ou escreva-nos quando quiser.",
      },
    },
    submitted:
      "O seu pedido está a caminho — vai receber um email de confirmação em {email}. Guarde esta página nos favoritos para consultar o estado quando quiser.",
    cancelPending:
      "Cancelamento pedido — estamos a analisá-lo e confirmamos por email em breve.",
    details: "Detalhes da reserva",
    reference: "Referência",
    where: "Onde",
    date: "Data",
    sitting: "Serviço",
    served: "Servido",
    partySize: "Número de pessoas",
    occasion: "Ocasião",
    bookedBy: "Reservado por",
    estimatedTotal: "Total estimado",
    total: "Total",
    estimateNote:
      "Uma estimativa — confirmamos o preço final quando confirmarmos a reserva. Não se paga nada online.",
    payment: {
      paid: "Pago na totalidade — obrigado.",
      depositPaid: "Sinal recebido{amount} — o restante é devido antes do evento.",
      refunded: "Reembolsado.",
      pending: "Falaremos consigo pessoalmente sobre o sinal e o pagamento.",
    },
    changeOfPlans: "Mudança de planos?",
    withdrawBody: "Pode retirar um pedido pendente quando quiser — sem perguntas.",
    cancelBody:
      "Precisa de mudar ou cancelar? Envie um pedido de cancelamento e tratamos do resto — mudar para outro dia costuma ser mais fácil do que parece.",
    policy: "Política de cancelamento",
    questions: "Dúvidas? Ligue para",
    orEmail: "ou escreva para",
    mailSubject: "Reserva",
    withdraw: {
      cta: "Retirar este pedido",
      confirm: "Retirar o seu pedido? A mesa volta a ficar disponível de imediato.",
      yes: "Sim — retirar",
    },
    cancel: {
      cta: "Pedir cancelamento",
      confirm:
        "Quer pedir-nos o cancelamento desta reserva? Vamos analisá-lo à luz da política de cancelamento e confirmamos por email.",
      yes: "Sim — pedir cancelamento",
    },
    keep: "Manter a minha reserva",
    manageErrors: {
      notFound: "Não encontrámos esta reserva.",
      notWithdrawable: "Este pedido já não pode ser retirado — contacte-nos, por favor.",
      notApproved: "Só reservas confirmadas podem pedir cancelamento.",
      failed: "Algo correu mal — tente novamente ou ligue-nos.",
    },
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, pt };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
