"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { gallery } from "@/lib/site";
import { Reveal } from "@/app/components/motion";
import { useInViewOnce } from "@/app/components/use-in-view";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Gallery({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).gallery;
  const reduce = useReducedMotion();
  const { ref, inView } = useInViewOnce();

  return (
    <section id="gallery" className="relative overflow-hidden bg-char-900 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-ember-soft">{t.eyebrow}</p>
          <h2 className="mt-4 font-display text-4xl font-light leading-tight text-bone text-balance sm:text-5xl">
            {t.heading}
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-bone/70 sm:text-lg">
            {t.intro}
          </p>
        </Reveal>

        <div ref={ref} className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {gallery.map((img, i) => {
            const alt = t.alts[img.id];
            return (
            <motion.figure
              key={img.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, ease: EASE, delay: (i % 4) * 0.08 }}
              className={`group relative overflow-hidden rounded-2xl ${
                "span" in img && img.span === "wide"
                  ? "col-span-2 aspect-16/10"
                  : "aspect-square"
              }`}
            >
              <Image
                src={img.src}
                alt={alt}
                fill
                quality={80}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-char-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-3 p-4 text-xs text-bone/90 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {alt}
              </figcaption>
            </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
