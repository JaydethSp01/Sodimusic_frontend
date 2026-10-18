"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { WHATSAPP_URL } from "@/lib/constants";
import type { SiteContent } from "@/types/site-content";

/** Éxito de la reserva: número en display-lg, copy del CMS y botón de WhatsApp. Confeti solo sin reduced-motion. */
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
        colors: ["#d9a62a", "#d4a017", "#f3efe8"],
        ticks: 120,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-ink-1 py-section" aria-labelledby="booking-success-title">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(217,166,42,0.16),transparent)]"
        aria-hidden
      />
      <div className="container-page flex flex-col items-center text-center">
        <span
          className="hero-enter flex h-20 w-20 items-center justify-center rounded-full border border-fire-500/40 bg-fire-500/[0.12] text-fire-400 shadow-fire"
          aria-hidden
        >
          <Check className="h-9 w-9" strokeWidth={2.5} />
        </span>
        <Eyebrow align="center" className="hero-enter mt-8 [--enter-delay:0.1s]">
          {copy.eyebrow}
        </Eyebrow>
        <Heading as="h1" size="display-lg" tone="fire" id="booking-success-title" className="hero-enter mt-4 font-mono [--enter-delay:0.2s]">
          {code}
        </Heading>
        <Text as="p" size="body-lg" tone="2" prose className="hero-enter mt-6 [--enter-delay:0.3s]">
          {copy.body}
        </Text>
        <p className="text-accent hero-enter mt-4 text-body-lg text-gold-400 [--enter-delay:0.35s]">{copy.tagline}</p>
        <div className="hero-enter mt-10 flex w-full flex-col items-center gap-4 [--enter-delay:0.4s]">
          <Button asChild variant="whatsapp" size="lg" className="w-full sm:w-auto">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              {copy.whatsappCtaLabel}
            </a>
          </Button>
          <Button asChild variant="link">
            <Link href="/">{copy.homeLinkLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
