"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { usePlayerStore } from "@/features/beats/stores/player-store";
import { cn } from "@/lib/utils";

interface MobileCtaBarProps {
  ctaHref: string;
  ctaLabel: string;
  /** WhatsApp E.164 sin «+». */
  whatsapp: string;
  businessName: string;
  /** Selector del hero cuya salida de pantalla muestra la barra. */
  heroSelector?: string;
}

/** Clase en `<body>` mientras la barra está visible: globals.css oculta el botón flotante de WhatsApp y añade padding. */
const BODY_CLASS = "has-mobile-cta";

/**
 * Barra CTA fija en móvil (< lg) que aparece al pasar el hero (IntersectionObserver): «Agendar» (primary)
 * + WhatsApp (icono). Se apoya sobre `--player-bar-h`; se oculta si el reproductor está abierto o en /booking.
 * Se monta en la portada (no en el layout).
 */
export function MobileCtaBar({ ctaHref, ctaLabel, whatsapp, businessName, heroSelector = "section[aria-label='Presentación']" }: MobileCtaBarProps) {
  const pathname = usePathname() ?? "/";
  const playerOpen = usePlayerStore((s) => s.current !== null);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(heroSelector);
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // Sin intersección y con el hero ya por encima del viewport → barra visible.
        setPastHero(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
      },
      { threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [heroSelector]);

  const visible = pastHero && !playerOpen && !pathname.startsWith("/booking");

  useEffect(() => {
    document.body.classList.toggle(BODY_CLASS, visible);
    return () => document.body.classList.remove(BODY_CLASS);
  }, [visible]);

  const phone = whatsapp.replace(/\D/g, "");
  const waHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hola ${businessName}, vengo de la página web y quiero agendar una sesión.`)}`
    : null;

  return (
    <div
      data-testid="mobile-cta-bar"
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 z-player border-t border-line-1 bg-ink-0/90 px-4 pt-3 backdrop-blur-md transition-[transform,opacity] duration-200 ease-out lg:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
      style={{
        bottom: "var(--player-bar-h, 0px)",
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="flex items-center gap-3">
        <Button asChild size="lg" className="min-w-0 flex-1" tabIndex={visible ? undefined : -1}>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
        {waHref ? (
          <IconButton asChild variant="whatsapp" size="lg" aria-label={`WhatsApp: agendar con ${businessName}`} tabIndex={visible ? undefined : -1}>
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="h-5 w-5" />
            </a>
          </IconButton>
        ) : null}
      </div>
    </div>
  );
}
