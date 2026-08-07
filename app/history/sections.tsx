import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { buttonVariants } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import { figures, sources, timeline } from "@/lib/history";
import { Cite } from "./cite";

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

export function HistoryHero() {
  return (
    <section className="relative flex h-[82svh] min-h-[560px] w-full items-end overflow-hidden">
      <Image
        src="/img/exterior.jpg"
        alt="Rui and Vera Matias outside the KAU smokehouse in Malveira"
        fill
        priority
        quality={88}
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-pine-900/70 via-pine-900/45 to-pine-900/92" />
      <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent opacity-95" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 sm:pb-24">
        <Reveal>
          <p className="eyebrow text-amber-soft">Our Story · Malveira</p>
          <h1 className="mt-5 max-w-3xl font-display text-[2.6rem] font-light leading-[1.03] text-cream text-balance sm:text-6xl lg:text-7xl">
            The couple who
            <br className="hidden sm:block" />{" "}
            <span className="italic text-amber-soft">brought Texas home</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-cream/85 sm:text-lg">
            KAU began with a bite of brisket in Paris, took shape across years of
            pop-ups and festival queues, and now runs low and slow in a Malveira
            smokehouse built around a smoker called Godzilla.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Lede / overview                                                    */
/* ------------------------------------------------------------------ */

export function HistoryLede() {
  return (
    <section className="relative bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow text-amber">A short history</p>
          <h2 className="mt-4 font-display text-3xl font-light leading-tight text-pine-900 text-balance sm:text-4xl">
            From a Paris brisket to the Malveira smokehouse
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-7 space-y-5 text-pretty text-lg leading-relaxed text-ink-soft">
            <p>
              Rui and Vera Matias were running <em>O Bolo do Caco</em> when a plate of
              brisket in Paris changed the plan. A research trip to Texas followed, and
              with it a conviction that real American barbecue —{" "}
              <strong className="font-medium text-pine-900">smoked low and slow, cut fresh,
              sold by weight</strong> — belonged in Portugal.
              <Cite n={1} />
            </p>
            <p>
              They proved it the hard way, in front of festival crowds at NOS Alive and
              Rock in Rio and at sports events up and down the country, selling out service
              after service until a permanent smokehouse was the obvious next move. It
              opened in Malveira on 28 July 2026 and filled to capacity within hours.
              <Cite n={[5, 3]} />
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <figure className="mt-12 border-l-2 border-amber/60 pl-6">
            <blockquote className="font-display text-2xl font-light italic leading-snug text-pine-700 sm:text-3xl">
              “These guys really understand what American BBQ is.”
            </blockquote>
            <figcaption className="mt-3 text-sm text-stone">— Guest review, Google</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline                                                           */
/* ------------------------------------------------------------------ */

export function HistoryTimeline() {
  return (
    <section className="relative overflow-hidden bg-parchment py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-amber">The story, step by step</p>
          <h2 className="mt-4 font-display text-3xl font-light leading-tight text-pine-900 text-balance sm:text-4xl">
            The story so far
          </h2>
        </Reveal>

        <Stagger className="mt-14 space-y-0">
          {timeline.map((e, i) => (
            <StaggerItem key={e.year}>
              <div className="group relative grid grid-cols-[4.5rem_1fr] gap-7 sm:grid-cols-[7rem_1fr] sm:gap-14">
                {/* year rail */}
                <div className="text-right">
                  <span className="font-display text-lg text-pine-700 sm:text-xl">{e.year}</span>
                </div>
                {/* line + node */}
                <div className="relative pb-12">
                  <span className="absolute -left-[1.38rem] top-1.5 size-3 rounded-full border-2 border-amber bg-cream sm:-left-[2.28rem]" />
                  {i < timeline.length - 1 && (
                    <span className="absolute -left-4 top-4 h-full w-px bg-pine-900/15 sm:-left-[1.9rem]" />
                  )}
                  <h3 className="font-display text-xl text-pine-900">{e.title}</h3>
                  <p className="mt-2 text-pretty leading-relaxed text-ink-soft">
                    {e.body}
                    <Cite n={e.cites} />
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  The people                                                         */
/* ------------------------------------------------------------------ */

export function HistoryFigures() {
  return (
    <section className="relative bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-amber">The people (and the smoker)</p>
          <h2 className="mt-4 font-display text-3xl font-light leading-tight text-pine-900 text-balance sm:text-4xl">
            Three names behind the smoke
          </h2>
        </Reveal>

        <div className="mt-14 space-y-16 sm:space-y-24">
          {figures.map((f, i) => (
            <Reveal key={f.id} delay={0.05}>
              <article
                className={cn(
                  "grid items-center gap-8 lg:grid-cols-5 lg:gap-14",
                  i % 2 === 1 && "lg:[&>figure]:order-2"
                )}
              >
                <figure className="lg:col-span-2">
                  <div className="relative mx-auto aspect-4/5 w-full max-w-xs overflow-hidden rounded-3xl bg-pine-900/5 shadow-lift sm:max-w-sm">
                    <Image
                      src={f.image}
                      alt={f.alt}
                      fill
                      quality={85}
                      sizes="(max-width: 1024px) 80vw, 40vw"
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pine-900/85 to-transparent p-5 pt-12">
                      <p className="font-display text-xl text-cream">{f.name}</p>
                      <p className="text-xs text-cream/70">{f.life} · {f.role}</p>
                    </div>
                  </div>
                </figure>

                <div className="lg:col-span-3">
                  <p className="eyebrow text-stone">{f.role}</p>
                  <h3 className="mt-2 font-display text-2xl font-light text-pine-900 sm:text-3xl">
                    {f.name}
                  </h3>
                  <div className="mt-5 space-y-4 text-pretty leading-relaxed text-ink-soft">
                    {f.paragraphs.map((p, j) => (
                      <p key={j}>
                        {p.text}
                        <Cite n={p.cites} />
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Scale — the mother house                                           */
/* ------------------------------------------------------------------ */

const scaleStats = [
  { value: "12h+", label: "Low & slow on Godzilla", cite: 1 },
  { value: "8", label: "Smoked meats by weight", cite: 2 },
  { value: "Thu–Sun", label: "Lunch & dinner", cite: 6 },
] as const;

export function HistoryScale() {
  return (
    <section className="relative overflow-hidden bg-pine-900 py-20 text-cream sm:py-28">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal className="max-w-3xl">
          <p className="eyebrow text-amber-soft">The mother house</p>
          <h2 className="mt-4 font-display text-3xl font-light leading-tight text-cream text-balance sm:text-4xl">
            One of the biggest steakhouses in the country
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-cream/80">
            Malveira is the brand’s mother house, built to be one of the largest steakhouses
            in Portugal and planned around the smoker rather than the other way round.
            <Cite n={[2, 1]} /> Brisket and beef rib Black Angus, St. Louis pork ribs, pulled
            pork and smoked turkey breast come off Godzilla all day, cut fresh and sold by
            weight, Thursday to Sunday for lunch and dinner.
            <Cite n={6} />
          </p>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-6 border-t border-cream/15 pt-10 sm:grid-cols-3">
          {scaleStats.map((s) => (
            <StaggerItem key={s.label}>
              <p className="font-display text-4xl font-light text-amber-soft sm:text-5xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm leading-snug text-cream/70">
                {s.label}
                <Cite n={s.cite} className="text-amber-soft/80" />
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  KAU today                                                          */
/* ------------------------------------------------------------------ */

export function HistoryToday() {
  return (
    <section className="relative bg-cream py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative">
            <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-lift">
              <Image
                src="/img/counter.jpg"
                alt="Trays being plated in the moment at a KAU service"
                fill
                quality={85}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow text-amber">KAU today</p>
              <h2 className="mt-4 font-display text-3xl font-light leading-tight text-pine-900 text-balance sm:text-4xl">
                Come hungry
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-6 space-y-5 text-pretty text-lg leading-relaxed text-ink-soft">
                <p>
                  The doors opened on 28 July 2026 and the room filled within hours; weekends
                  still sell out, so reservations are online and mandatory.
                  <Cite n={3} />
                </p>
                <p>
                  Sit down for table service or step up to the Texan counter and watch your
                  meats cut and weighed in the moment. Either way it comes off Godzilla, and
                  either way you should arrive hungry.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <a
                href="/#spaces"
                className={cn(buttonVariants({ variant: "primary", size: "md" }), "mt-8")}
              >
                Book a table
                <ArrowRight className="size-4" />
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sources                                                            */
/* ------------------------------------------------------------------ */

export function HistorySources() {
  return (
    <section className="relative border-t border-pine-900/10 bg-parchment py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <Reveal>
          <div className="flex items-center gap-3">
            <BookOpen className="size-5 text-amber" />
            <p className="eyebrow text-amber">Sources & further reading</p>
          </div>
          <h2 className="mt-4 font-display text-3xl font-light leading-tight text-pine-900 text-balance sm:text-4xl">
            Where this history comes from
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-ink-soft">
            The account above is drawn from Portuguese press coverage of KAU. Each footnote
            in the text links to its source below.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ol className="mt-10 space-y-4">
            {sources.map((s) => (
              <li
                key={s.id}
                id={`source-${s.id}`}
                className="scroll-mt-24 grid grid-cols-[2rem_1fr] gap-3 border-b border-pine-900/8 pb-4 text-sm leading-relaxed"
              >
                <span className="font-display text-base text-amber">{s.id}.</span>
                <div>
                  <span className="text-ink-soft">{s.citation}</span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 break-all text-pine-700 underline-offset-2 hover:underline"
                  >
                    <ExternalLink className="size-3 shrink-0" />
                    <span className="break-all">{s.url}</span>
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-8 text-xs leading-relaxed text-stone">
            Details above come from the press coverage below; menus and prices change — the
            restaurant is the final word.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <a
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "md" }), "mt-10")}
          >
            <ArrowLeft className="size-4" />
            Back to KAU
          </a>
        </Reveal>
      </div>
    </section>
  );
}
