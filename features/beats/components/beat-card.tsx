"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import type { Beat } from "@/types/models";
import { GenreTag } from "@/components/shared/genre-tag";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { Button } from "@/components/ui/button";
import { beatPriceFrom } from "@/features/beats/licenses";
import { usePlayerStore, type PlayerTrack } from "@/features/beats/stores/player-store";
import { formatCOP } from "@/lib/format-cop";
import { COVER_IMAGE_PROPS } from "@/lib/image-blur";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";

/** Pista para la barra global a partir de un beat con `audioUrl`. */
export function beatToTrack(beat: Beat): PlayerTrack | null {
  if (!beat.audioUrl) {
    return null;
  }
  return {
    id: beat.id,
    title: beat.title,
    src: resolveMediaUrl(beat.audioUrl),
    coverUrl: beat.coverUrl ? resolveMediaUrl(beat.coverUrl) : undefined,
    genre: beat.genre,
    bpm: beat.bpm,
  };
}

interface BeatCardProps {
  beat: Beat;
  ivaIncluded: boolean;
  priority?: boolean;
  /** Beats visibles con audio: cola de la barra global al pulsar play. */
  queue: PlayerTrack[];
  onChooseLicense: () => void;
}

/**
 * Tarjeta de beat. En < sm es una fila (portada 96 px + info); en ≥ sm, portada 4:5 con la info debajo.
 * El play superpuesto manda la pista a la barra global (`usePlayerStore`); sin `audioUrl` no hay botón.
 * Los vendidos van atenuados, con badge "Vendido", precio legible y sin botón de licencia.
 */
export function BeatCard({ beat, ivaIncluded, priority = false, queue, onChooseLicense }: BeatCardProps) {
  const sold = beat.status === "SOLD";
  const exclusive = beat.status === "EXCLUSIVE" || beat.exclusive;
  const from = beatPriceFrom(beat);
  const track = beatToTrack(beat);

  const isCurrent = usePlayerStore((s) => s.current?.id === beat.id);
  const isPlaying = usePlayerStore((s) => s.playing && s.current?.id === beat.id);
  const play = usePlayerStore((s) => s.play);
  const toggle = usePlayerStore((s) => s.toggle);

  function onPlayClick() {
    if (!track) {
      return;
    }
    if (isCurrent) {
      toggle();
    } else {
      play(track, queue);
    }
  }

  return (
    <article
      className={cn(
        "group relative flex h-full flex-row overflow-hidden rounded-lg border border-border bg-background-card transition-all duration-300 sm:flex-col",
        sold
          ? "opacity-70"
          : "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(255,107,0,0.1)]",
        isCurrent && "border-primary/50",
      )}
      aria-label={`${beat.title}${sold ? " (vendido)" : ""}`}
    >
      <div
        className="relative aspect-square w-24 shrink-0 self-start overflow-hidden bg-background-secondary sm:aspect-[4/5] sm:w-full sm:self-auto"
        title={track ? undefined : "Este beat no tiene preview público"}
      >
        {beat.coverUrl ? (
          <Image
            src={resolveMediaUrl(beat.coverUrl)}
            alt={`Portada del beat ${beat.title}`}
            fill
            priority={priority}
            {...COVER_IMAGE_PROPS}
            className={cn("object-cover", sold && "grayscale-[0.5]")}
            sizes="(max-width: 640px) 96px, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <PlaceholderCover seed={beat.title} label={beat.title.slice(0, 2).toUpperCase()} className="absolute inset-0" />
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/2 bg-gradient-to-t from-black/85 via-black/35 to-transparent sm:block"
          aria-hidden
        />
        {track ? (
          <button
            type="button"
            onClick={onPlayClick}
            className={cn(
              "absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full sm:h-16 sm:w-16",
              "border border-white/20 bg-black/60 text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all",
              "hover:scale-105 hover:bg-primary hover:text-[var(--primary-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black",
              "motion-reduce:transition-none motion-reduce:hover:scale-100",
              isPlaying && "bg-primary text-[var(--primary-foreground)]",
            )}
            aria-pressed={isPlaying}
            aria-label={isPlaying ? `Pausar ${beat.title}` : `Reproducir ${beat.title}`}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 sm:h-7 sm:w-7" aria-hidden />
            ) : (
              <Play className="ml-0.5 h-4 w-4 sm:ml-1 sm:h-7 sm:w-7" aria-hidden />
            )}
          </button>
        ) : null}
        {isPlaying ? (
          <span className="absolute right-1.5 top-1.5 inline-flex rounded-sm bg-black/60 p-1 backdrop-blur-sm sm:right-2 sm:top-2" aria-hidden>
            <span className="beat-eq">
              <span />
              <span />
              <span />
            </span>
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <div className="pointer-events-none mb-1.5 flex flex-wrap gap-1.5 sm:absolute sm:left-2 sm:top-2 sm:z-[1] sm:mb-0">
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
        <h3 className="truncate font-body text-base font-semibold leading-snug text-foreground sm:whitespace-normal sm:text-lg" title={beat.title}>
          {beat.title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:mt-2">
          <GenreTag genre={beat.genre} />
          {beat.bpm ? <span className="font-mono text-xs text-[var(--text-muted)]">{beat.bpm} BPM</span> : null}
          {beat.mood ? (
            <span className="rounded-full bg-background-elevated px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
              {beat.mood}
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:mt-4 sm:flex-col sm:items-stretch sm:gap-4">
          <span
            className={cn(
              "inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0 self-start whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[13px] sm:text-sm",
              sold ? "border-white/15 text-[var(--text-secondary)]" : "border-primary/40 bg-primary/10 text-primary",
            )}
          >
            <span className="text-[10px] uppercase tracking-wider opacity-80">{sold ? "Vendido en" : "Desde"}</span>
            {formatCOP(from)}
            {ivaIncluded ? <span className="text-[10px] uppercase tracking-wider opacity-80">· IVA incl.</span> : null}
          </span>
          {sold ? (
            <p className="w-full text-sm text-[var(--text-secondary)]">Este beat ya tiene dueño. Mira los demás o pide uno a medida.</p>
          ) : (
            <Button
              type="button"
              size="lg"
              className="h-10 px-4 sm:h-12 sm:w-full"
              onClick={onChooseLicense}
              aria-label={`Elegir licencia para ${beat.title}`}
            >
              Elegir licencia
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
