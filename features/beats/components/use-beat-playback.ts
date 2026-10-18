"use client";

import type { Beat } from "@/types/models";
import { usePlayerStore, type PlayerTrack } from "@/features/beats/stores/player-store";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

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

/**
 * Estado de reproducción de un beat frente a la barra global (`usePlayerStore`):
 * `track` (null sin preview), si es la pista actual, si suena y el handler del PlayButton.
 */
export function useBeatPlayback(beat: Beat, queue: PlayerTrack[]) {
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

  return { track, isCurrent, isPlaying, onPlayClick };
}
