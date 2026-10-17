"use client";

import Image from "next/image";
import { Music4 } from "lucide-react";
import type { Beat } from "@/types/models";
import { GenreTag } from "@/components/shared/genre-tag";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { Button } from "@/components/ui/button";
import { BeatPreviewPlayer } from "@/features/beats/components/beat-preview-player";
import { beatPriceFrom } from "@/features/beats/licenses";
import { formatCOP } from "@/lib/format-cop";
import { COVER_IMAGE_PROPS } from "@/lib/image-blur";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";

interface BeatCardProps {
  beat: Beat;
  ivaIncluded: boolean;
  priority?: boolean;
  onChooseLicense: () => void;
}

/**
 * Tarjeta de beat: portada 4:5 con play superpuesto (si hay preview), chip "Desde $X · IVA incluido".
 * Los vendidos muestran badge "Vendido" con precio legible y sin botón.
 */
export function BeatCard({ beat, ivaIncluded, priority = false, onChooseLicense }: BeatCardProps) {
  const sold = beat.status === "SOLD";
  const exclusive = beat.status === "EXCLUSIVE" || beat.exclusive;
  const from = beatPriceFrom(beat);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background-card transition-all duration-300",
        !sold && "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(255,107,0,0.1)]",
      )}
      aria-label={`${beat.title}${sold ? " (vendido)" : ""}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-background-secondary">
        {beat.coverUrl ? (
          <Image
            src={resolveMediaUrl(beat.coverUrl)}
            alt={`Portada del beat ${beat.title}`}
            fill
            priority={priority}
            {...COVER_IMAGE_PROPS}
            className={cn("object-cover", sold && "grayscale-[0.5]")}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <PlaceholderCover seed={beat.title} label={beat.title.slice(0, 2).toUpperCase()} className="absolute inset-0" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/35 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5">
          {sold ? (
            <span className="rounded-full bg-black/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur-sm">
              Vendido
            </span>
          ) : exclusive ? (
            <span className="rounded-full bg-black/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--gold)] ring-1 ring-[var(--gold)]/50 backdrop-blur-sm">
              Exclusivo
            </span>
          ) : (
            <span className="rounded-full bg-green-950/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-green-400 ring-1 ring-green-400/30 backdrop-blur-sm">
              Disponible
            </span>
          )}
        </div>
        {beat.audioUrl ? (
          <BeatPreviewPlayer src={resolveMediaUrl(beat.audioUrl)} title={beat.title} />
        ) : (
          <span
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/70 backdrop-blur-sm"
            title="Sin preview público"
          >
            <Music4 className="h-3 w-3" aria-hidden />
            Sin preview
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-body text-lg font-semibold leading-snug text-foreground">{beat.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <GenreTag genre={beat.genre} />
          {beat.bpm ? <span className="font-mono text-xs text-[var(--text-muted)]">{beat.bpm} BPM</span> : null}
          {beat.mood ? (
            <span className="rounded-full bg-background-elevated px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
              {beat.mood}
            </span>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-baseline gap-1.5 rounded-full border px-3 py-1.5 font-mono text-sm",
              sold ? "border-white/15 text-[var(--text-secondary)]" : "border-primary/40 bg-primary/10 text-primary",
            )}
          >
            <span className="text-[10px] uppercase tracking-wider opacity-80">{sold ? "Vendido por" : "Desde"}</span>
            {formatCOP(from)}
            {ivaIncluded ? <span className="text-[10px] uppercase tracking-wider opacity-80">· IVA incl.</span> : null}
          </span>
        </div>
        {sold ? (
          <p className="mt-4 text-sm text-[var(--text-secondary)]">Este beat ya tiene dueño. Mira los demás o pide uno a medida.</p>
        ) : (
          <Button type="button" size="lg" className="mt-4 h-12 w-full" onClick={onChooseLicense} aria-label={`Elegir licencia para ${beat.title}`}>
            Elegir licencia
          </Button>
        )}
      </div>
    </article>
  );
}
