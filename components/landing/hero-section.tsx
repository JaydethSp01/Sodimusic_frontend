"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/types/site-content";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

const titleEase = [0.25, 0.1, 0.25, 1] as const;

export function HeroSection({ hero }: { hero: SiteContent["hero"] }) {
  const heroSrc = resolveMediaUrl(hero.heroImageUrl);
  return (
    <section
      aria-label="Presentación"
      className="relative flex min-h-screen flex-col justify-end overflow-hidden"
    >
      <Image
        src={heroSrc}
        alt="Sesión de estudio con equipo de audio"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/75 to-[#080808]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-16 top-20 h-44 w-44 rounded-full bg-primary/20 blur-3xl md:h-72 md:w-72" />
        <div className="absolute -right-16 bottom-24 h-40 w-40 rounded-full bg-[var(--gold-muted)] blur-3xl md:h-64 md:w-64" />
      </div>

      <motion.div
        className="absolute right-4 top-4 z-10 md:right-10 md:top-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6, ease: titleEase }}
      >
        <span className="font-mono text-xs uppercase tracking-widest text-white/40">{hero.eyebrow}</span>
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-20 pt-28 lg:px-8">
        <motion.h1
          className="font-display text-[64px] leading-none tracking-[0.15em] text-white md:text-[120px]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: titleEase }}
        >
          {hero.title}
        </motion.h1>
        <motion.p
          className="mt-4 max-w-xl text-balance font-body text-base italic text-[#D4A017] sm:text-lg md:text-2xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: titleEase }}
        >
          {hero.tagline}
        </motion.p>
        <motion.div
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: titleEase }}
        >
          <Button
            asChild
            size="lg"
            className={cn(
              "rounded-md px-8 transition-shadow duration-300",
              "hover:shadow-[0_0_20px_rgba(255,107,0,0.4)]",
            )}
          >
            <Link href={hero.primaryHref} aria-label={hero.primaryCta}>
              {hero.primaryCta}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-md border-white/20 px-8 hover:border-primary/50">
            <Link href={hero.secondaryHref} aria-label={hero.secondaryCta}>
              {hero.secondaryCta}
            </Link>
          </Button>
        </motion.div>
      </div>

      <div className="relative z-10 flex justify-center pb-8" aria-hidden>
        <ChevronDown className="h-8 w-8 animate-bounce text-[#D4A017]/60" />
      </div>
    </section>
  );
}
