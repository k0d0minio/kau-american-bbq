"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Flame } from "lucide-react";
import type { SpaceCardData } from "@/lib/spaces";
import { diningFormats } from "@/lib/site";
import { buttonVariants } from "@/app/components/ui/button";
import { Reveal } from "@/app/components/motion";
import { useInViewOnce } from "@/app/components/use-in-view";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Spaces({ spaces }: { spaces: SpaceCardData[] }) {
  const reduce = useReducedMotion();
  const { ref, inView } = useInViewOnce();

  // KAU is one room; the two formats are ways of being served in it, so they
  // present as cards and every booking link points at the same space.
  const space = spaces[0];

  return (
    <section id="spaces" className="relative bg-parchment/60 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-ember">Book a Table</p>
          <h2 className="mt-4 font-display text-4xl font-light leading-tight text-char-900 text-balance sm:text-5xl">
            Two ways to eat, one big smoker
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
            Sit down for classic table service, or go full Texas at the counter — trays built
            in the moment, meats cut and weighed in front of you. Choose when you book; the
            smoke is the same either way. Online reservation required; sittings sell out fast.
          </p>
        </Reveal>

        <div ref={ref} className="mt-14 grid gap-6 md:grid-cols-2">
          {diningFormats.map((format, i) => (
            <motion.article
              key={format.id}
              id={format.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.12 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-bone-100 shadow-soft transition-all duration-500 hover:shadow-lift hover:-translate-y-1.5"
            >
              <div className="relative block aspect-4/3 overflow-hidden">
                <Image
                  src={format.image}
                  alt={format.name}
                  fill
                  quality={82}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-char-900/50 to-transparent opacity-70" />
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-bone/80">
                    {format.kind}
                  </p>
                  <h3 className="font-display text-2xl text-bone">{format.name}</h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="text-pretty text-sm leading-relaxed text-ink-soft">{format.blurb}</p>
                <ul className="mt-5 grid gap-x-3 gap-y-2 sm:grid-cols-2">
                  {format.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-stone">
                      <Check className="size-3.5 shrink-0 text-rust" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>

        {space ? (
          <Reveal className="mt-6">
            <Link
              href={`/spaces/${space.slug}`}
              className="group relative block overflow-hidden rounded-3xl shadow-soft transition-all duration-500 hover:shadow-lift hover:-translate-y-1"
            >
              <div className="relative min-h-64">
                <Image
                  src={space.image}
                  alt={space.name}
                  fill
                  quality={82}
                  sizes="(max-width: 1152px) 100vw, 1152px"
                  className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-char-900/65" />
                <div className="absolute inset-0 bg-gradient-to-r from-char-900/60 to-transparent" />
                <div className="relative z-10 flex flex-col gap-5 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="inline-flex items-center gap-2 eyebrow text-ember-soft">
                      <Flame className="size-3.5" />
                      {space.kind}
                    </p>
                    <h3 className="mt-3 font-display text-3xl font-light text-bone sm:text-4xl">
                      Get your seat at the smoker
                    </h3>
                    <p className="mt-3 text-pretty text-sm leading-relaxed text-bone/85 sm:text-base">
                      Pick your day, lunch or dinner, and how you&apos;d like to be served — we
                      confirm by email.
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-bone/60">
                      {space.fromLabel}
                    </p>
                  </div>
                  <span
                    className={cn(
                      buttonVariants({ variant: "ember", size: "lg" }),
                      "shrink-0 self-start lg:self-center"
                    )}
                  >
                    Book a table
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
