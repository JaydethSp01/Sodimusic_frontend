"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface YoutubeLazyEmbedProps {
  src: string;
  title: string;
  /** Texto del botón/póster antes de montar el iframe */
  ctaLabel?: string;
  className?: string;
  /** Fondo del póster (gradiente por canal) */
  posterStyle?: React.CSSProperties;
}

/**
 * Embed 16:9 que NO carga YouTube de entrada: muestra un póster con botón
 * y monta el iframe al hacer clic o cuando la tarjeta entra en el viewport.
 */
export function YoutubeLazyEmbed({ src, title, ctaLabel = "Ver videos", className, posterStyle }: YoutubeLazyEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted || !ref.current || typeof IntersectionObserver === "undefined") {
      return;
    }
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  return (
    <div
      ref={ref}
      className={cn("relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black", className)}
    >
      {mounted ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setMounted(true)}
          className="group absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 text-foreground"
          style={posterStyle}
          aria-label={`${ctaLabel}: ${title}`}
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" aria-hidden />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_32px_rgba(217,166,42,0.35)] transition-transform duration-300 group-hover:scale-105">
            <Play className="ml-1 h-7 w-7" aria-hidden fill="currentColor" />
          </span>
          <span className="relative font-mono text-xs uppercase tracking-[0.2em] text-white/80">{ctaLabel}</span>
        </button>
      )}
    </div>
  );
}
