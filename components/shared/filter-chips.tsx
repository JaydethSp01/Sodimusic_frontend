"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type FilterChip = { value: string; label: string; count?: number };

interface FilterChipsProps {
  label: string;
  chips: FilterChip[];
  active?: string;
  /** Modo enlace: construye la URL para cada chip (server-friendly, sin JS). */
  hrefFor?: (value: string) => string;
  /** Modo controlado: callback al elegir. */
  onSelect?: (value: string) => void;
  className?: string;
}

/**
 * Chips de filtro unificados (beats, producciones, tienda, canales).
 * Scroll horizontal en móvil con desvanecido al borde; wrap en desktop.
 */
export function FilterChips({ label, chips, active, hrefFor, onSelect, className }: FilterChipsProps) {
  if (!chips.length) {
    return null;
  }
  const current = active ?? "";
  return (
    <nav aria-label={label} className={cn("relative -mx-4 lg:mx-0", className)}>
      <ul className="no-scrollbar flex w-full gap-2 overflow-x-auto px-4 pb-1 lg:flex-wrap lg:overflow-visible lg:px-0">
        {chips.map((c) => {
          const isActive = current === c.value;
          const cls = cn(
            "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 font-mono text-xs uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isActive
              ? "border-primary bg-primary/15 text-primary"
              : "border-border text-[var(--text-secondary)] hover:border-primary/40 hover:text-foreground",
          );
          const inner = (
            <>
              {c.label}
              {typeof c.count === "number" ? (
                <span className="rounded-full bg-white/10 px-1.5 text-[10px] text-[var(--text-muted)]">{c.count}</span>
              ) : null}
            </>
          );
          return (
            <li key={c.value || "__all"}>
              {hrefFor ? (
                <Link href={hrefFor(c.value)} scroll={false} aria-current={isActive ? "page" : undefined} className={cls}>
                  {inner}
                </Link>
              ) : (
                <button type="button" aria-pressed={isActive} onClick={() => onSelect?.(c.value)} className={cls}>
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent lg:hidden"
      />
    </nav>
  );
}
