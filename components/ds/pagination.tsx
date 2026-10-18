"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Paginación 44 px: anterior/siguiente + páginas con elipsis. Enlaces con `hrefTemplate`
 * ("/beats?page={page}", válido desde server components) o `hrefFor`; botones con `onChange`.
 */
export interface PaginationProps {
  page: number;
  pageCount: number;
  /** Plantilla de URL con `{page}`; usable desde un server component. */
  hrefTemplate?: string;
  hrefFor?: (page: number) => string;
  onChange?: (page: number) => void;
  label?: string;
  /** Texto resumen («Página 2 de 5») dentro del nav, en mono. */
  summary?: ReactNode;
  className?: string;
}

function range(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const pages = new Set<number>([1, count, page - 1, page, page + 1]);
  const list = Array.from(pages).filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < list.length; i++) {
    if (i > 0 && list[i] - list[i - 1] > 1) out.push("…");
    out.push(list[i]);
  }
  return out;
}

const item =
  "inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded px-3 font-mono text-body-sm tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0 disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

export function Pagination({ page, pageCount, hrefTemplate, hrefFor: hrefForProp, onChange, label = "Paginación", summary, className }: PaginationProps) {
  if (pageCount <= 1) return null;
  const hrefFor = hrefForProp ?? (hrefTemplate ? (p: number) => hrefTemplate.replace("{page}", String(p)) : undefined);
  const Item = ({ p, children, current, ariaLabel, far, rel }: { p: number; children: React.ReactNode; current?: boolean; ariaLabel?: string; far?: boolean; rel?: "prev" | "next" }) => {
    const disabled = p < 1 || p > pageCount;
    /* En < sm solo se muestran la actual y sus vecinas (las lejanas ocultas evitan desbordar a 390 px). */
    const cls = cn(item, far && "max-sm:hidden", current ? "bg-fire-500 text-fire-on" : "border border-line-2 text-text-2 hover:border-fire-500/60 hover:text-text-1");
    if (hrefFor && !disabled) {
      return (
        <Link href={hrefFor(p)} rel={rel} aria-current={current ? "page" : undefined} aria-label={ariaLabel} className={cls}>
          {children}
        </Link>
      );
    }
    return (
      <button type="button" disabled={disabled} aria-current={current ? "page" : undefined} aria-label={ariaLabel} onClick={() => onChange?.(p)} className={cls}>
        {children}
      </button>
    );
  };
  return (
    <nav aria-label={label} className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}>
      <Item p={page - 1} ariaLabel="Página anterior" rel="prev">
        <ChevronLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </Item>
      {range(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-text-3 max-sm:hidden" aria-hidden>
            …
          </span>
        ) : (
          <Item key={p} p={p} current={p === page} ariaLabel={`Página ${p}`} far={Math.abs(p - page) > 1}>
            {p}
          </Item>
        ),
      )}
      <Item p={page + 1} ariaLabel="Página siguiente" rel="next">
        <ChevronRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </Item>
      {summary ? <p className="ml-2 w-full text-center font-mono text-label text-text-3 sm:w-auto sm:text-left">{summary}</p> : null}
    </nav>
  );
}
