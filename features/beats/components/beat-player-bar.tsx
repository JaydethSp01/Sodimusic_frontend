"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { SkipBack, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { PlayButton } from "@/components/ds/play-button";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { hasNextTrack, hasPrevTrack, usePlayerStore } from "@/features/beats/stores/player-store";
import { cn } from "@/lib/utils";

const BAR_HEIGHT_VAR = "--player-bar-h";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) {
    return "0:00";
  }
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Barra de reproducción global (fija abajo). Único `<audio preload="none">` del sitio: al reproducir
 * una pista nueva se pausa la anterior; al terminar pasa a la siguiente de la cola. Publica su alto en
 * `--player-bar-h` (globals.css lo usa en `main` y en el botón de WhatsApp) y expone Media Session.
 */
export function BeatPlayerBar() {
  const current = usePlayerStore((s) => s.current);
  const playing = usePlayerStore((s) => s.playing);
  const canNext = usePlayerStore(hasNextTrack);
  const canPrev = usePlayerStore(hasPrevTrack);
  const onChooseLicense = usePlayerStore((s) => s.onChooseLicense);
  const { toggle, next, prev, close, setPlaying } = usePlayerStore.getState();

  const audioRef = useRef<HTMLAudioElement>(null);
  const barRef = useRef<HTMLElement>(null);
  /** Cambiar `src` dispara `pause` en el elemento: lo ignoramos para no cancelar la reproducción. */
  const ignorePauseRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  const src = current?.src ?? null;

  /* Eventos del <audio> → estado local y store. */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) {
      return;
    }
    const sync = () => {
      setCurrentTime(a.currentTime);
      if (Number.isFinite(a.duration) && a.duration > 0) {
        setDuration(a.duration);
      }
    };
    const onPlay = () => {
      ignorePauseRef.current = false;
      setFailed(false);
      setPlaying(true);
    };
    const onPause = () => {
      if (ignorePauseRef.current) {
        ignorePauseRef.current = false;
        return;
      }
      if (!a.ended) {
        setPlaying(false);
      }
    };
    const onEnded = () => {
      const state = usePlayerStore.getState();
      if (hasNextTrack(state)) {
        state.next();
      } else {
        setCurrentTime(0);
        setPlaying(false);
      }
    };
    const onError = () => {
      setFailed(true);
      setPlaying(false);
    };
    a.addEventListener("timeupdate", sync);
    a.addEventListener("loadedmetadata", sync);
    a.addEventListener("durationchange", sync);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("timeupdate", sync);
      a.removeEventListener("loadedmetadata", sync);
      a.removeEventListener("durationchange", sync);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
    };
  }, [setPlaying]);

  /* Pista nueva: cargar en el único <audio> (pausa implícita de la anterior). */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) {
      return;
    }
    setCurrentTime(0);
    setDuration(0);
    setFailed(false);
    if (!src) {
      ignorePauseRef.current = true;
      a.pause();
      a.removeAttribute("src");
      a.load();
      return;
    }
    if (a.getAttribute("src") !== src) {
      ignorePauseRef.current = !a.paused;
      a.setAttribute("src", src);
      a.load();
    }
  }, [src]);

  /* Intención del store → elemento. */
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !src) {
      return;
    }
    if (playing) {
      if (a.paused) {
        void a.play().catch(() => setPlaying(false));
      }
    } else if (!a.paused) {
      a.pause();
    }
  }, [playing, src, setPlaying]);

  /* Alto de la barra → `--player-bar-h` para que el contenido y el botón de WhatsApp no queden tapados. */
  useEffect(() => {
    const el = barRef.current;
    const root = document.documentElement;
    if (!el || !current) {
      root.style.removeProperty(BAR_HEIGHT_VAR);
      return;
    }
    const apply = () => root.style.setProperty(BAR_HEIGHT_VAR, `${Math.ceil(el.getBoundingClientRect().height)}px`);
    apply();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(apply) : null;
    ro?.observe(el);
    return () => {
      ro?.disconnect();
      root.style.removeProperty(BAR_HEIGHT_VAR);
    };
  }, [current]);

  /* Media Session (pantalla de bloqueo, auriculares). */
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }
    const ms = navigator.mediaSession;
    if (!current) {
      try {
        ms.metadata = null;
        ms.playbackState = "none";
      } catch {
        /* navegador sin soporte completo */
      }
      return;
    }
    try {
      if (typeof MediaMetadata !== "undefined") {
        ms.metadata = new MediaMetadata({
          title: current.title,
          artist: current.artist ?? "Sodimusic",
          album: [current.genre, current.bpm ? `${current.bpm} BPM` : null].filter(Boolean).join(" · ") || undefined,
          artwork: current.coverUrl ? [{ src: current.coverUrl, sizes: "512x512", type: "image/jpeg" }] : [],
        });
      }
      ms.playbackState = playing ? "playing" : "paused";
      const s = usePlayerStore.getState;
      ms.setActionHandler("play", () => {
        if (!s().playing) {
          s().toggle();
        }
      });
      ms.setActionHandler("pause", () => {
        if (s().playing) {
          s().toggle();
        }
      });
      ms.setActionHandler("nexttrack", hasNextTrack(s()) ? () => s().next() : null);
      ms.setActionHandler("previoustrack", hasPrevTrack(s()) ? () => s().prev() : null);
    } catch {
      /* setActionHandler puede lanzar en navegadores antiguos */
    }
  }, [current, playing, canNext, canPrev]);

  const seek = useCallback((pct: number) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(a.duration) || a.duration <= 0) {
      return;
    }
    const t = (Math.max(0, Math.min(100, pct)) / 100) * a.duration;
    a.currentTime = t;
    setCurrentTime(t);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const meta = current ? [current.genre, current.bpm ? `${current.bpm} BPM` : null].filter(Boolean).join(" · ") : "";

  return (
    <>
      <audio ref={audioRef} preload="none" className="sr-only" aria-hidden>
        <track kind="captions" />
      </audio>
      <span className="sr-only" aria-live="polite">
        {current ? (failed ? `No se pudo reproducir ${current.title}` : playing ? `Reproduciendo ${current.title}` : `En pausa: ${current.title}`) : ""}
      </span>
      {current ? (
        <section
          ref={barRef}
          role="region"
          aria-label="Reproductor de beats"
          className="fixed inset-x-0 bottom-0 z-player border-t border-line-2 bg-ink-2/95 text-text-1 shadow-[0_-12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="container-page flex items-center gap-3 py-2 sm:gap-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-ink-3">
              {current.coverUrl ? (
                <Image src={current.coverUrl} alt="" fill sizes="48px" className="object-cover" />
              ) : (
                <PlaceholderCover seed={current.title} label="" className="absolute inset-0" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-semibold leading-tight text-text-1" title={current.title}>
                {current.title}
              </p>
              <p className="mt-0.5 truncate text-label-sm text-text-2">{failed ? "Preview no disponible" : meta || "Preview"}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <IconButton onClick={prev} disabled={!canPrev} size="sm" className="hidden sm:inline-flex" aria-label="Pista anterior">
                <SkipBack aria-hidden />
              </IconButton>
              <PlayButton
                onClick={toggle}
                disabled={failed}
                size={40}
                state={playing ? "playing" : "idle"}
                progress={duration > 0 ? progress : undefined}
                aria-label={playing ? "Pausar" : "Reproducir"}
              />
              <IconButton onClick={next} disabled={!canNext} size="sm" className="hidden sm:inline-flex" aria-label="Pista siguiente">
                <SkipForward aria-hidden />
              </IconButton>
            </div>

            <ProgressSlider
              className="hidden flex-[1.2] md:flex"
              title={current.title}
              progress={progress}
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
            />

            {onChooseLicense ? (
              <Button type="button" size="sm" className="shrink-0 px-3 sm:px-4" onClick={() => onChooseLicense(current.id)} aria-label={`Elegir licencia para ${current.title}`}>
                <span className="hidden sm:inline">Elegir licencia</span>
                <span className="sm:hidden">Licencia</span>
              </Button>
            ) : (
              <Button asChild size="sm" className="shrink-0 px-3 sm:px-4">
                <Link href={`/beats?licencia=${encodeURIComponent(current.id)}`} aria-label={`Elegir licencia para ${current.title}`}>
                  <span className="hidden sm:inline">Elegir licencia</span>
                  <span className="sm:hidden">Licencia</span>
                </Link>
              </Button>
            )}

            <IconButton onClick={close} size="sm" aria-label="Cerrar reproductor">
              <X aria-hidden />
            </IconButton>
          </div>
          <ProgressSlider
            className="flex px-4 pb-2 md:hidden"
            title={current.title}
            progress={progress}
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
          />
        </section>
      ) : null}
    </>
  );
}

interface ProgressSliderProps {
  className?: string;
  title: string;
  progress: number;
  currentTime: number;
  duration: number;
  onSeek: (pct: number) => void;
}

function ProgressSlider({ className, title, progress, currentTime, duration, onSeek }: ProgressSliderProps) {
  return (
    <div className={cn("items-center gap-2", className)}>
      <span className="w-10 shrink-0 text-right font-mono text-label-sm normal-case tabular-nums text-text-2">{formatTime(currentTime)}</span>
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={progress}
        disabled={duration <= 0}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label={`Posición de ${title}`}
        aria-valuetext={`${formatTime(currentTime)} de ${formatTime(duration)}`}
        className="beat-progress block h-6 w-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent focus-visible:outline-none disabled:cursor-default"
        style={{ "--progress": `${progress}%` } as CSSProperties}
      />
      <span className="w-10 shrink-0 font-mono text-label-sm normal-case tabular-nums text-text-2">{formatTime(duration)}</span>
    </div>
  );
}
