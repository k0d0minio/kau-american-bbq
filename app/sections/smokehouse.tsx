import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/app/components/motion";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export function Smokehouse({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).smokehouse;
  const stats = [
    { value: "12h+", label: t.stats.hours },
    { value: "8", label: t.stats.meats },
    { value: "1", label: t.stats.smoker },
  ];

  return (
    <section id="smokehouse" className="relative bg-bone py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow text-ember">{t.eyebrow}</p>
              <h2 className="mt-4 font-display text-4xl font-light leading-tight text-char-900 text-balance sm:text-5xl">
                {t.heading}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-6 space-y-5 text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
                {t.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Reveal>

            <Stagger className="mt-12 grid grid-cols-3 gap-6 border-t border-char-900/10 pt-8">
              {stats.map((s) => (
                <StaggerItem key={s.label}>
                  <p className="font-display text-3xl text-char-700 sm:text-4xl">{s.value}</p>
                  <p className="mt-1 text-xs leading-snug text-stone sm:text-sm">{s.label}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Reveal delay={0.15} className="relative">
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl shadow-lift">
              <Image
                src="/img/seasoning.jpg"
                alt={t.imageAlt}
                fill
                quality={85}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* floating accent card */}
            <div className="absolute -bottom-6 -left-4 max-w-[15rem] rounded-2xl bg-bone-100 p-5 shadow-lift sm:-left-8">
              <p className="font-display text-lg italic text-char-700">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-2 eyebrow text-stone">{t.quoteSource}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
