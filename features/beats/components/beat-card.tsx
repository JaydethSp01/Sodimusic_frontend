"use client";

import type { Beat } from "@/types/models";
import { MediaCard } from "@/components/ds/media-card";
import { PlayButton } from "@/components/ds/play-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { GenreTag } from "@/components/shared/genre-tag";
import { BeatStatusBadge } from "@/features/beats/components/beat-status-badge";
import { useBeatPlayback } from "@/features/beats/components/use-beat-playback";
import { beatPriceFrom } from "@/features/beats/licenses";
import type { PlayerTrack } from "@/features/beats/stores/player-store";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";

export { beatToTrack } from "@/features/beats/components/use-beat-playback";

interface BeatCardProps {
  beat: Beat;
  ivaIncluded: boolean;
  priority?: boolean;
  /** Beats visibles con audio: cola de la barra global al pulsar play. */
  queue: PlayerTrack[];
  onChooseLicense: () => void;
}

/**
 * Tarjeta de beat (vista grilla): `MediaCard` vertical con portada 1/1, PlayButton 56 centrado (visible al
 * hover en escritorio, siempre en táctil), badges sobre la imagen y, debajo, título, meta, precio y botón.
 * (Overlay descartado: a 2 columnas en 390 px no caben título + precio + botón sobre la foto.)
 * Sin `audioUrl` no hay botón de play. Los vendidos van atenuados y sin botón de licencia.
 */
export function BeatCard({ beat, ivaIncluded, priority = false, queue, onChooseLicense }: BeatCardProps) {
  const sold = beat.status === "SOLD";
  const from = beatPriceFrom(beat);
  const { track, isCurrent, isPlaying, onPlayClick } = useBeatPlayback(beat, queue);

  return (
    <article aria-label={`${beat.title}${sold ? " (vendido)" : ""}`} className={cn("flex h-full flex-col", sold && "opacity-60")}>
      <MediaCard
        as="div"
        aspect="1/1"
        src={beat.coverUrl ? resolveMediaUrl(beat.coverUrl) : null}
        alt={beat.coverUrl ? `Portada del beat ${beat.title}` : ""}
        fallbackSeed={beat.title}
        fallbackLabel=""
        priority={priority}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        treatment={sold ? "duotone" : "none"}
        hoverReveal={false}
        zoom={!sold}
        className="flex-1"
        mediaClassName={cn(isCurrent && "ring-1 ring-fire-500/60")}
        badges={
          <>
            <BeatStatusBadge beat={beat} />
            {beat.bpm ? (
              <Badge tone="neutral" className="bg-ink-0/70 backdrop-blur-sm">
                {beat.bpm} BPM
              </Badge>
            ) : null}
          </>
        }
        center={
          track ? (
            <PlayButton
              size={56}
              variant="glass"
              title={beat.title}
              state={isPlaying ? "playing" : "idle"}
              onClick={onPlayClick}
              className={cn(
                "transition-opacity duration-200",
                !isPlaying && "lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100",
              )}
            />
          ) : null
        }
        title={<span title={beat.title}>{beat.title}</span>}
        meta={
          <>
            <GenreTag genre={beat.genre} />
            {beat.mood ? <Badge tone="neutral">{beat.mood}</Badge> : null}
          </>
        }
        description={
          <Price amount={from} size="sm" prefix={sold ? "vendido en" : "desde"} note={ivaIncluded && !sold ? "IVA incl." : undefined} tone={sold ? "1" : "fire"} />
        }
      />
      {sold ? null : (
        <Button type="button" size="sm" className="mt-4 w-full" onClick={onChooseLicense} aria-label={`Elegir licencia para ${beat.title}`}>
          Elegir licencia
        </Button>
      )}
    </article>
  );
}
