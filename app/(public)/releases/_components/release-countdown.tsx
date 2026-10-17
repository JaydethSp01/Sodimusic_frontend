"use client";

import { useEffect, useState } from "react";

interface ReleaseCountdownProps {
  /** ISO date del lanzamiento */
  target: string;
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

/** Cuenta regresiva simple (días/horas/min/seg). En SSR muestra solo los días; al montar se actualiza cada segundo. */
export function ReleaseCountdown({ target, className }: ReleaseCountdownProps) {
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
  // En SSR y en el primer render del cliente se muestran guiones para evitar desajustes de hidratación.
  if (now == null) {
    return (
      <div className={className} role="timer" aria-busy="true" aria-label="Calculando cuenta regresiva">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Faltan</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {["días", "h", "min", "seg"].map((l) => (
            <span key={l} className="flex min-w-[64px] flex-col items-center rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/5 px-3 py-2">
              <span className="font-display text-2xl tabular-nums text-[var(--gold)]">--</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">{l}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }
  const remaining = targetMs - now;
  if (remaining <= 0) {
    return (
      <p className={className} role="status">
        <span className="font-mono text-sm uppercase tracking-widest text-[var(--gold)]">¡Ya disponible!</span>
      </p>
    );
  }
  const p = diffParts(remaining);
  const cells = [
    { v: p.days, l: p.days === 1 ? "día" : "días" },
    { v: p.hours, l: "h" },
    { v: p.minutes, l: "min" },
    { v: p.seconds, l: "seg" },
  ];
  return (
    <div className={className} role="timer" aria-live="off" aria-label={`Faltan ${p.days} días, ${p.hours} horas y ${p.minutes} minutos`}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Faltan</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {cells.map((c) => (
          <span key={c.l} className="flex min-w-[64px] flex-col items-center rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/5 px-3 py-2">
            <span className="font-display text-2xl tabular-nums text-[var(--gold)]">{String(c.v).padStart(2, "0")}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">{c.l}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
