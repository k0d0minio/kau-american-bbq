"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { AnimatedWords } from "@/app/components/motion";
import { buttonVariants } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} id="top" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0 will-change-transform">
        <Image
          src="/img/hero-smokehouse.jpg"
          alt="Lifting the lid on Godzilla, KAU's custom smoker, with briskets inside"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Layered gradients for depth + legibility */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-char-900/55 via-char-900/25 to-char-900/80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bone via-transparent to-transparent opacity-90" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-start justify-center px-5 sm:px-8"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="eyebrow text-bone/85"
        >
          Texas-style barbecue · Malveira, Portugal
        </motion.p>

        <h1 className="mt-5 max-w-3xl font-display text-[2.75rem] font-light leading-[1.02] text-bone text-balance sm:text-6xl lg:text-7xl">
          <AnimatedWords text="Low and slow," delay={0.4} />{" "}
          <br className="hidden sm:block" />
          <span className="italic text-ember-soft">
            <AnimatedWords text="worth the wait" delay={0.7} />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1 }}
          className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-bone/85 sm:text-lg"
        >
          Brisket, beef ribs and pulled pork smoked for hours on Godzilla, our custom smoker —
          cut fresh, sold by weight, and served the way Texas intended. Thursday to Sunday,
          lunch and dinner.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.3 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Link href="/book" className={cn(buttonVariants({ variant: "ember", size: "lg" }))}>
            Book a table
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/enquire" className={cn(buttonVariants({ variant: "light", size: "lg" }))}>
            Plan a private feast
          </Link>
        </motion.div>
      </motion.div>

      <motion.a
        href="#smokehouse"
        aria-label="Scroll to explore"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-bone/70"
      >
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="block"
        >
          <ChevronDown className="size-6" />
        </motion.span>
      </motion.a>
    </section>
  );
}
