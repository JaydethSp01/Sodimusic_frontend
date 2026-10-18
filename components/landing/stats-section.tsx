"use client";

import { useEffect, useRef, useState } from "react";
import { StatItem } from "@/components/ds/stat-item";
import { cn } from "@/lib/utils";
import type { SiteStat } from "@/types/site-content";

const DURATION_MS = 1600;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Contador: el valor final se renderiza en SSR (sin "0+") y solo se anima
 * en cliente cuando entra en vista y el usuario no pide reducir movimiento.
 */
function AnimatedValue({ value, run }: { value: number; run: boolean }) {
  const [shown, setShown] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (!run || started.current || value <= 0) {
      return;
    }
    started.current = true;
    let raf = 0;
    const t0 = performance.now();
    setShown(0);
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / DURATION_MS);
      setShown(Math.round(easeOut(p) * value));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value]);

  return <>{shown}</>;
}

/**
 * Cifras de «Quiénes somos» como fila de `StatItem` (cifra fire + rótulo mono + línea), sin caja.
 * Semántica `<dl>` con `dd` (cifra) y `dt` (rótulo) hermanos: los e2e leen el valor final en SSR.
 */
export function StatsSection({ stats, className }: { stats: SiteStat[]; className?: string }) {
  const ref = useRef<HTMLDListElement>(null);
  // Arranca una vez con el 30 % visible salvo con movimiento reducido.
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          setRun(true);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!stats.length) {
    return null;
  }

  return (
    <dl ref={ref} className={cn("grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4", className)}>
      {stats.map((item, i) => (
        <StatItem
          key={`${item.label}-${i}`}
          valueAs="dd"
          labelAs="dt"
          value={<AnimatedValue value={item.value} run={run} />}
          suffix={item.suffix || undefined}
          label={item.label}
          className="self-stretch"
        />
      ))}
    </dl>
  );
}
