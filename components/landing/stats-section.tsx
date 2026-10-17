"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteStat } from "@/types/site-content";

const DURATION_MS = 1600;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Contador: el valor final se renderiza en SSR (sin "0+") y solo se anima
 * en cliente cuando entra en vista y el usuario no pide reducir movimiento.
 */
function AnimatedValue({ value, suffix, run }: { value: number; suffix: string; run: boolean }) {
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

  return (
    <>
      {shown}
      {suffix}
    </>
  );
}

export function StatsSection({ stats }: { stats: SiteStat[] }) {
  const ref = useRef<HTMLDListElement>(null);
  // Arranca una vez con el 30 % visible (antes `useInView` de framer) salvo con movimiento reducido.
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
    <dl ref={ref} className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
      {stats.map((item, i) => (
        <div
          key={`${item.label}-${i}`}
          className="flex flex-col-reverse bg-background-card/90 px-4 py-6 text-center transition-colors duration-300 hover:bg-background-elevated sm:px-5 sm:py-7"
        >
          <dt className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {item.label}
          </dt>
          <dd className="display-title text-5xl text-primary md:text-6xl">
            <AnimatedValue value={item.value} suffix={item.suffix} run={run} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
