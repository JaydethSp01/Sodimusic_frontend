"use client";

import { create } from "zustand";

/** Pista reproducible en la barra global (/beats). */
export interface PlayerTrack {
  id: string;
  title: string;
  artist?: string;
  coverUrl?: string;
  /** URL absoluta del preview (MP3). */
  src: string;
  genre?: string;
  bpm?: number | null;
}

interface PlayerState {
  current: PlayerTrack | null;
  /** Intención de reproducción; el `<audio>` real vive en `BeatPlayerBar` y la sigue. */
  playing: boolean;
  queue: PlayerTrack[];
  /** Si está registrado (desde `BeatsStore`), "Elegir licencia" lo llama en vez de navegar a `/beats?licencia=<id>`. */
  onChooseLicense?: (id: string) => void;
  /** Reproduce `track`; `queue` sustituye la cola (por defecto: los beats visibles con audio). Si ya es la pista actual, reanuda. */
  play: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  /** Pausa y oculta la barra. */
  close: () => void;
  /** Sincroniza el estado desde los eventos del `<audio>` (pausa externa, autoplay bloqueado, error). */
  setPlaying: (playing: boolean) => void;
  setChooseLicenseHandler: (handler?: (id: string) => void) => void;
}

function indexOf(queue: PlayerTrack[], current: PlayerTrack | null): number {
  return current ? queue.findIndex((t) => t.id === current.id) : -1;
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  current: null,
  playing: false,
  queue: [],
  onChooseLicense: undefined,
  play: (track, queue) => {
    const nextQueue = queue ?? get().queue;
    set({
      current: track,
      playing: true,
      queue: nextQueue.some((t) => t.id === track.id) ? nextQueue : [track, ...nextQueue],
    });
  },
  toggle: () => {
    if (get().current) {
      set((s) => ({ playing: !s.playing }));
    }
  },
  next: () => {
    const { queue, current } = get();
    const i = indexOf(queue, current);
    if (i >= 0 && i + 1 < queue.length) {
      set({ current: queue[i + 1], playing: true });
    }
  },
  prev: () => {
    const { queue, current } = get();
    const i = indexOf(queue, current);
    if (i > 0) {
      set({ current: queue[i - 1], playing: true });
    }
  },
  close: () => set({ current: null, playing: false }),
  setPlaying: (playing) => set({ playing }),
  setChooseLicenseHandler: (handler) => set({ onChooseLicense: handler }),
}));

/** ¿Hay una pista después de la actual en la cola? */
export function hasNextTrack(state: Pick<PlayerState, "queue" | "current">): boolean {
  const i = indexOf(state.queue, state.current);
  return i >= 0 && i + 1 < state.queue.length;
}

export function hasPrevTrack(state: Pick<PlayerState, "queue" | "current">): boolean {
  return indexOf(state.queue, state.current) > 0;
}
