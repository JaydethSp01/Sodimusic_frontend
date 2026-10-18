"use client";

import * as React from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Botón de reproducción 40/56/72 px. `state`: idle / playing / loading. `progress` (0–100) dibuja un
 * anillo fire alrededor. `variant`: solid (fire) o glass (sobre fotos). `aria-label` se deriva del `title`.
 */
export interface PlayButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  state?: "idle" | "playing" | "loading";
  size?: 40 | 56 | 72;
  progress?: number;
  variant?: "solid" | "glass";
  /** Nombre de la pista para el `aria-label` ("Reproducir X" / "Pausar X"). */
  title?: string;
}

const SIZE = {
  40: { box: "h-10 w-10", icon: "h-4 w-4" },
  56: { box: "h-14 w-14", icon: "h-6 w-6" },
  72: { box: "h-[72px] w-[72px]", icon: "h-7 w-7" },
} as const;

export const PlayButton = React.forwardRef<HTMLButtonElement, PlayButtonProps>(function PlayButton(
  { state = "idle", size = 56, progress, variant = "solid", title, className, ...props },
  ref,
) {
  const playing = state === "playing";
  const loading = state === "loading";
  const label = props["aria-label"] ?? (title ? `${playing ? "Pausar" : "Reproducir"} ${title}` : playing ? "Pausar" : "Reproducir");
  const ring = typeof progress === "number";
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-pressed={playing}
      aria-busy={loading || undefined}
      className={cn(
        "group/play relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-[background-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0 disabled:cursor-not-allowed disabled:opacity-50",
        SIZE[size].box,
        variant === "solid"
          ? playing
            ? "bg-fire-500 text-fire-on shadow-fire"
            : "bg-text-1 text-ink-0 hover:bg-fire-500 hover:text-fire-on hover:shadow-fire"
          : playing
            ? "bg-fire-500 text-fire-on shadow-fire"
            : "border border-white/20 bg-black/40 text-text-1 backdrop-blur-sm hover:bg-fire-500 hover:text-fire-on",
        className,
      )}
      {...props}
    >
      {ring ? (
        <svg className="play-ring pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
          <circle cx="18" cy="18" r="16.5" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
          <circle
            className="play-ring-bar"
            cx="18"
            cy="18"
            r="16.5"
            fill="none"
            stroke="var(--fire-400)"
            strokeWidth="1.5"
            strokeLinecap="round"
            pathLength={100}
            style={{ ["--progress" as string]: Math.max(0, Math.min(100, progress ?? 0)) }}
          />
        </svg>
      ) : null}
      {loading ? (
        <Loader2 className={cn(SIZE[size].icon, "animate-spin")} aria-hidden />
      ) : playing ? (
        <Pause className={SIZE[size].icon} fill="currentColor" strokeWidth={0} aria-hidden />
      ) : (
        <Play className={cn(SIZE[size].icon, "ml-0.5")} fill="currentColor" strokeWidth={0} aria-hidden />
      )}
    </button>
  );
});
