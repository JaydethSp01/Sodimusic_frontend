"use client";

import type { Beat } from "@/types/models";
import { ListRow } from "@/components/ds/list-row";
import { MediaFrame } from "@/components/ds/media-frame";
import { PlayButton } from "@/components/ds/play-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { GenreTag } from "@/components/shared/genre-tag";
import { BeatStatusBadge } from "@/features/beats/components/beat-status-badge";
import { useBeatPlayback } from "@/features/beats/components/use-beat-playback";
import { beatPriceFrom } from "@/features/beats/licenses";
import type { PlayerTrack } from "@/features/beats/stores/player-store";
import { formatCOP } from "@/lib/format-cop";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";

interface BeatRowProps {
  beat: Beat;
  ivaIncluded: boolean;
  priority?: boolean;
  queue: PlayerTrack[];
  onChooseLicense: () => void;
}

/**
 * Fila de beat (vista lista): PlayButton sobre la portada de 64 px, título + badges, BPM en mono,
 * precio «desde» y botón «Licencia». Los vendidos van atenuados, con badge y sin botón.
 * El `<article aria-label>` envolvente es lo que cuentan y nombran los e2e.
 */
export function BeatRow({ beat, ivaIncluded, priority = false, queue, onChooseLicense }: BeatRowProps) {
  const sold = beat.status === "SOLD";
  const from = beatPriceFrom(beat);
  const { track, isCurrent, isPlaying, onPlayClick } = useBeatPlayback(beat, queue);

  return (
    <li>
      <article aria-label={`${beat.title}${sold ? " (vendido)" : ""}`}>
        <ListRow
          as="div"
          muted={sold}
          active={isCurrent}
          className="px-0 sm:px-2"
          media={
            <span className="relative block h-16 w-16">
              <MediaFrame
                src={beat.coverUrl ? resolveMediaUrl(beat.coverUrl) : null}
                alt={beat.coverUrl ? `Portada del beat ${beat.title}` : ""}
                aspect="1/1"
                rounded="md"
                priority={priority}
                sizes="64px"
                fallbackSeed={beat.title}
                fallbackLabel=""
                hoverReveal={false}
                treatment={sold ? "duotone" : "none"}
              />
              {track ? (
                <PlayButton
                  size={40}
                  variant="glass"
                  title={beat.title}
                  state={isPlaying ? "playing" : "idle"}
                  onClick={onPlayClick}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              ) : null}
            </span>
          }
          title={<span title={beat.title}>{beat.title}</span>}
          meta={
            <>
              <GenreTag genre={beat.genre} />
              {beat.mood ? <Badge tone="neutral">{beat.mood}</Badge> : null}
              <BeatStatusBadge beat={beat} />
              {beat.bpm ? <span className="font-mono text-label text-text-3 sm:hidden">{beat.bpm} BPM</span> : null}
              <span className="basis-full font-mono text-body-sm text-text-2 sm:hidden">
                {sold ? "Vendido en " : "Desde "}
                <span className={cn("tabular-nums", sold ? "text-text-2" : "text-text-1")}>{formatCOP(from)}</span>
              </span>
            </>
          }
          data={
            <span className="flex items-center gap-5">
              {beat.bpm ? <span className="text-label text-text-3">{beat.bpm} BPM</span> : null}
              <Price amount={from} size="sm" prefix={sold ? "vendido en" : "desde"} note={ivaIncluded && !sold ? "IVA incl." : undefined} tone={sold ? "1" : "fire"} />
            </span>
          }
          action={
            sold ? null : (
              <Button type="button" size="sm" onClick={onChooseLicense} aria-label={`Elegir licencia para ${beat.title}`}>
                Licencia
              </Button>
            )
          }
        />
      </article>
    </li>
  );
}
