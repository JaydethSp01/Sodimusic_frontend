"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/** Solo un preview suena a la vez: al reproducir uno se pausa el anterior. */
let currentAudio: HTMLAudioElement | null = null;

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) {
    return "0:00";
  }
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface BeatPreviewPlayerProps {
  src: string;
  title: string;
  className?: string;
}

/**
 * Player ligero de preview: botón play superpuesto sobre la portada + barra de progreso
 * con `<audio>` nativo (sin dependencias). La barra es un slider accesible.
 */
export function BeatPreviewPlayer({ src, title, className }: BeatPreviewPlayerProps) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const a = ref.current;
    if (!a) {
      return;
    }
    const sync = () => {
      setCurrent(a.currentTime);
      const d = a.duration;
      if (Number.isFinite(d) && d > 0) {
        setDuration(d);
        setProgress((a.currentTime / d) * 100);
      }
    };
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurrent(0);
    };
    const onPause = () => setPlaying(false);
    const onPlay = () => {
      if (currentAudio && currentAudio !== a) {
        currentAudio.pause();
      }
      currentAudio = a;
      setPlaying(true);
    };
    const onError = () => {
      setFailed(true);
      setPlaying(false);
    };
    a.addEventListener("timeupdate", sync);
    a.addEventListener("loadedmetadata", sync);
    a.addEventListener("ended", onEnded);
    a.addEventListener("pause", onPause);
    a.addEventListener("play", onPlay);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("timeupdate", sync);
      a.removeEventListener("loadedmetadata", sync);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("error", onError);
      if (currentAudio === a) {
        currentAudio = null;
      }
    };
  }, [src]);

  function toggle() {
    const a = ref.current;
    if (!a || failed) {
      return;
    }
    if (playing) {
      a.pause();
    } else {
      void a.play().catch(() => setPlaying(false));
    }
  }

  function seek(pct: number) {
    const a = ref.current;
    if (!a || !Number.isFinite(a.duration) || a.duration <= 0) {
      return;
    }
    a.currentTime = (Math.max(0, Math.min(100, pct)) / 100) * a.duration;
  }

  return (
    <div className={cn("absolute inset-0", className)}>
      <audio ref={ref} src={src} preload="none" className="sr-only" aria-label={`Preview de ${title}`}>
        <track kind="captions" />
      </audio>
      <button
        type="button"
        onClick={toggle}
        disabled={failed}
        className={cn(
          "absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
          "border border-white/20 bg-black/60 text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all",
          "hover:scale-105 hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          "motion-reduce:transition-none motion-reduce:hover:scale-100 disabled:cursor-not-allowed disabled:opacity-50",
          playing && "bg-primary",
        )}
        aria-pressed={playing}
        aria-label={failed ? `Preview de ${title} no disponible` : playing ? `Pausar preview de ${title}` : `Reproducir preview de ${title}`}
      >
        {playing ? <Pause className="h-7 w-7" aria-hidden /> : <Play className="ml-1 h-7 w-7" aria-hidden />}
      </button>
      <div className="absolute inset-x-0 bottom-0 px-3 pb-2">
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label={`Posición del preview de ${title}`}
          aria-valuetext={`${formatTime(current)} de ${formatTime(duration)}`}
          className="beat-progress block h-6 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none"
          style={{ "--progress": `${progress}%` } as CSSProperties}
        />
        <div className="flex justify-between font-mono text-[10px] text-white/80">
          <span>{formatTime(current)}</span>
          <span>{duration ? formatTime(duration) : "preview"}</span>
        </div>
      </div>
      <style jsx>{`
        .beat-progress::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 999px;
          background: linear-gradient(to right, var(--primary) var(--progress), rgba(255, 255, 255, 0.25) var(--progress));
        }
        .beat-progress::-moz-range-track {
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.25);
        }
        .beat-progress::-moz-range-progress {
          height: 4px;
          border-radius: 999px;
          background: var(--primary);
        }
        .beat-progress::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          margin-top: -5px;
          height: 14px;
          width: 14px;
          border-radius: 999px;
          background: #fff;
          border: 2px solid var(--primary);
        }
        .beat-progress::-moz-range-thumb {
          height: 14px;
          width: 14px;
          border-radius: 999px;
          background: #fff;
          border: 2px solid var(--primary);
        }
        .beat-progress:focus-visible::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
