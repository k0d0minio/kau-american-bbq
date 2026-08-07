"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { defaultLocale, localeHome, localeMeta, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buttonVariants } from "./ui/button";

/**
 * The nav is shared by every public page. Only the landing page is translated,
 * so pages that are English-only simply leave `locale` at its default.
 */
export function Nav({ locale = defaultLocale }: { locale?: Locale }) {
  const t = getDictionary(locale).nav;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const home = localeHome(locale);
  const onHome = pathname === home;

  // Section anchors live on the landing page. They gain the page path when the
  // nav is rendered on a sub-page so the links jump back to it first.
  const sectionHref = (hash: string) => (onHome ? hash : `${home}${hash}`);
  const links = [
    { href: sectionHref("#spaces"), label: t.sections.spaces },
    { href: sectionHref("#smokehouse"), label: t.sections.smokehouse },
    { href: sectionHref("#gallery"), label: t.sections.gallery },
    { href: sectionHref("#location"), label: t.sections.location },
    { href: "/history", label: t.story },
  ];
  const homeHref = onHome ? "#top" : home;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          "transition-all duration-500",
          scrolled
            ? "bg-bone/85 backdrop-blur-md shadow-[0_1px_0_rgba(28,25,23,0.08)]"
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-20 sm:px-8">
          <a
            href={homeHref}
            className={cn(
              "font-display text-xl font-medium tracking-tight transition-colors sm:text-2xl",
              scrolled ? "text-char-900" : "text-bone"
            )}
          >
            KAU
            <span
              className={cn(
                "ml-2 hidden align-middle text-[0.6rem] uppercase tracking-[0.28em] sm:inline",
                scrolled ? "text-stone" : "text-bone/70"
              )}
            >
              {t.brandLine}
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={cn(
                  "group relative text-sm font-medium transition-colors",
                  scrolled ? "text-ink-soft hover:text-char-700" : "text-bone/85 hover:text-bone"
                )}
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <LanguageSwitch current={locale} label={t.language} scrolled={scrolled} />
            <Link
              href="/enquire"
              className={cn(
                buttonVariants({ variant: scrolled ? "primary" : "light", size: "sm" })
              )}
            >
              <Send className="size-3.5" />
              {t.enquire}
            </Link>
          </div>

          <button
            aria-label={t.openMenu}
            onClick={() => setOpen(true)}
            className={cn(
              "md:hidden",
              scrolled ? "text-char-900" : "text-bone"
            )}
          >
            <Menu className="size-6" />
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-char-900/98 backdrop-blur-sm md:hidden"
          >
            <div className="flex h-16 items-center justify-between px-5 sm:h-20">
              <span className="font-display text-xl text-bone">KAU Barbecue</span>
              <button aria-label={t.closeMenu} onClick={() => setOpen(false)} className="text-bone">
                <X className="size-6" />
              </button>
            </div>
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
              className="flex flex-col gap-2 px-6 pt-8"
            >
              {links.map((l) => (
                <motion.li
                  key={l.href}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
                  }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-bone/10 py-4 font-display text-3xl text-bone"
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
            <div className="space-y-3 px-6 pt-10 pb-12">
              <Link
                href="/enquire"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "ember", size: "lg" }), "w-full")}
              >
                <Send className="size-4" />
                {t.sendEnquiry}
              </Link>
              <a
                href={site.phoneHref}
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "light", size: "lg" }), "w-full")}
              >
                <Phone className="size-4" />
                {t.callToEnquire}
              </a>
              <LanguageSwitch
                current={locale}
                label={t.language}
                scrolled={false}
                className="justify-center pt-4"
                onNavigate={() => setOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/**
 * EN / PT toggle. Each language has its own root layout so these are plain
 * anchors — the full page load is what swaps the document's `lang`.
 */
function LanguageSwitch({
  current,
  label,
  scrolled,
  className,
  onNavigate,
}: {
  current: Locale;
  label: string;
  scrolled: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <div
      aria-label={label}
      className={cn(
        "flex items-center gap-1 text-xs font-medium uppercase tracking-[0.18em]",
        className
      )}
    >
      {locales.map((l, i) => {
        const active = l === current;
        return (
          <span key={l} className="flex items-center gap-1">
            {i > 0 && (
              <span className={scrolled ? "text-stone/50" : "text-bone/35"} aria-hidden="true">
                /
              </span>
            )}
            <a
              href={localeHome(l)}
              hrefLang={localeMeta[l].htmlLang}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              title={localeMeta[l].label}
              className={cn(
                "transition-colors",
                active
                  ? scrolled
                    ? "text-char-900"
                    : "text-bone"
                  : scrolled
                    ? "text-stone hover:text-char-700"
                    : "text-bone/55 hover:text-bone"
              )}
            >
              {localeMeta[l].short}
            </a>
          </span>
        );
      })}
    </div>
  );
}
