"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ReleaseCountdownProps {
  /** ISO date del lanzamiento */
  target: string;
  /** `cells` (4 celdas mono) o `compact` (una línea mono: «Faltan 58 d 04 h»). */
  variant?: "cells" | "compact";
  className?: string;
}

function diffParts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Cuenta regresiva en mono (días/horas/min/seg). En SSR y en el primer render muestra guiones para
 * evitar desajustes de hidratación; al montar se actualiza cada segundo.
 */
export function ReleaseCountdown({ target, variant = "cells", className }: ReleaseCountdownProps) {
  const targetMs = new Date(target).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!Number.isFinite(targetMs)) {
    return null;
  }
  const remaining = now == null ? null : targetMs - now;
  if (remaining != null && remaining <= 0) {
    return (
      <p className={cn("text-label text-gold-400", className)} role="status">
        ¡Ya disponible!
      </p>
    );
  }
  const p = remaining == null ? null : diffParts(remaining);
  const cells = [
    { v: p ? pad(p.days) : "--", l: p && p.days === 1 ? "día" : "días" },
    { v: p ? pad(p.hours) : "--", l: "h" },
    { v: p ? pad(p.minutes) : "--", l: "min" },
    { v: p ? pad(p.seconds) : "--", l: "seg" },
  ];
  const timerProps = p
    ? { "aria-live": "off" as const, "aria-label": `Faltan ${p.days} días, ${p.hours} horas y ${p.minutes} minutos` }
    : { "aria-busy": true, "aria-label": "Calculando cuenta regresiva" };

  if (variant === "compact") {
    return (
      <span className={cn("block font-mono text-label tabular-nums text-gold-400", className)} role="timer" {...timerProps}>
        Faltan {cells[0].v} {cells[0].l} {cells[1].v} h {cells[2].v} min
      </span>
    );
  }

  return (
    <div className={className} role="timer" {...timerProps}>
      <p className="text-label text-text-3">Faltan</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {cells.map((c) => (
          <li key={c.l} className="flex min-w-16 flex-col items-center border-l border-gold-500/40 py-1 pl-3 pr-2">
            <span className="font-mono text-display-sm tabular-nums leading-none text-gold-400">{c.v}</span>
            <span className="mt-1.5 text-label text-text-3">{c.l}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
