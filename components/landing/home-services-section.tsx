"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ArrowRight } from "lucide-react";
import type { SiteContent } from "@/types/site-content";

type Service = SiteContent["booking"]["services"][number];

export function HomeServicesSection({
  services,
  ctaHref,
  ctaLabel = "Agendar",
}: {
  services: Service[];
  ctaHref: string;
  ctaLabel?: string;
}) {
  if (!services.length) {
    return null;
  }

  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {services.map((s, i) => {
        const n = String(i + 1).padStart(2, "0");
        return (
          <motion.article
            key={`${s.type}-${s.title}`}
            variants={fadeInUp}
            className="group relative overflow-hidden rounded-lg border border-border bg-background-card/80 p-6 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
          >
            <span
              className="pointer-events-none absolute -right-2 -top-4 font-display text-[120px] leading-none text-white/[0.03] transition-colors group-hover:text-primary/[0.06]"
              aria-hidden
            >
              {n}
            </span>
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-3xl">
                <span aria-hidden>{s.icon}</span>
              </div>
              <h3 className="mt-4 font-display text-xl text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{s.desc}</p>
              <Link
                href={ctaHref}
                className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-primary"
                aria-label={`${ctaLabel}: ${s.title}`}
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
}
