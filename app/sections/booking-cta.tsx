"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Phone, CalendarHeart } from "lucide-react";
import { site } from "@/lib/site";
import { buttonVariants } from "@/app/components/ui/button";
import { Reveal } from "@/app/components/motion";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function BookingCta({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).bookingCta;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? "0%" : "-12%", reduce ? "0%" : "12%"]);

  return (
    <section ref={ref} id="book" className="relative overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 scale-110 will-change-transform">
        <Image
          src="/img/brisket.jpg"
          alt={t.imageAlt}
          fill
          quality={85}
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-char-900/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-char-900/40 via-transparent to-char-900/70" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 py-28 text-center sm:px-8 sm:py-36">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-bone/25 bg-bone/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-bone backdrop-blur">
            <CalendarHeart className="size-3.5" />
            {t.badge}
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-7 font-display text-4xl font-light leading-[1.05] text-bone text-balance sm:text-6xl">
            {t.heading}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-bone/85 sm:text-lg">
            {t.body}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <a href="#spaces" className={cn(buttonVariants({ variant: "ember", size: "lg" }))}>
              <CalendarHeart className="size-4" />
              {t.ctaPrimary}
            </a>
            <Link href="/enquire" className={cn(buttonVariants({ variant: "light", size: "lg" }))}>
              {t.ctaSecondary}
            </Link>
          </div>
          <p className="mt-6 text-sm text-bone/70">
            {t.phonePrompt}{" "}
            <a href={site.phoneHref} className="inline-flex items-center gap-1.5 font-medium text-bone underline-offset-4 hover:underline">
              <Phone className="size-3.5" />
              {site.phone}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
