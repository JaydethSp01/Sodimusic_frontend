"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WHATSAPP_URL } from "@/lib/constants";
import type { SiteContent } from "@/types/site-content";

export function BookingSuccessView({
  code,
  copy,
}: {
  code: string;
  copy: SiteContent["bookingSuccess"];
}) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    let cancelled = false;
    void import("canvas-confetti").then((mod) => {
      if (cancelled) {
        return;
      }
      const c = mod.default;
      c({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.55 },
        colors: ["#ff6b00", "#d4a017", "#ffffff"],
        ticks: 120,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <motion.div
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        aria-hidden
      >
        <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <motion.path
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
      <p className="mt-8 font-mono text-xs uppercase tracking-widest text-primary">{copy.eyebrow}</p>
      <h1 className="mt-4 font-display text-6xl tracking-wide text-primary md:text-7xl">{code}</h1>
      <p className="mt-6 text-[var(--text-secondary)]">{copy.body}</p>
      <p className="mt-4 text-sm italic text-[var(--gold)]">{copy.tagline}</p>
      <Button
        asChild
        className="mt-10 gap-2 bg-[#25D366] text-white hover:bg-[#20bd5a] hover:text-white"
      >
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {copy.whatsappCtaLabel}
        </a>
      </Button>
      <div className="mt-6">
        <Link href="/" className="text-sm text-primary hover:underline">
          {copy.homeLinkLabel}
        </Link>
      </div>
    </section>
  );
}
