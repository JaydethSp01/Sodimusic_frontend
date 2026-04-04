"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) {
    return "0:00";
  }
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function BeatAudioPlayer({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

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
    const onEnded = () => setPlaying(false);
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    a.addEventListener("timeupdate", sync);
    a.addEventListener("loadedmetadata", sync);
    a.addEventListener("ended", onEnded);
    a.addEventListener("pause", onPause);
    a.addEventListener("play", onPlay);
    return () => {
      a.removeEventListener("timeupdate", sync);
      a.removeEventListener("loadedmetadata", sync);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("play", onPlay);
    };
  }, [src]);

  function toggle() {
    const a = ref.current;
    if (!a) {
      return;
    }
    if (playing) {
      a.pause();
    } else {
      void a.play().catch(() => setPlaying(false));
    }
  }

  return (
    <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
      <audio ref={ref} src={src} preload="metadata" className="sr-only" aria-label={`Audio: ${title}`}>
        <track kind="captions" />
      </audio>
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/15",
          "text-primary transition-colors hover:bg-primary/25",
        )}
        aria-pressed={playing}
        aria-label={playing ? "Pausar" : "Reproducir"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-primary transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-[var(--text-muted)]">
          <span>{formatTime(current)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
