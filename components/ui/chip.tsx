"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Chip de filtro seleccionable (44 px, pill). Con `href` es un enlace (`aria-current="page"` si está
 * seleccionado, sin JS); sin `href` es un botón (`aria-pressed`). `count` muestra un contador mono.
 */
export interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  count?: number;
  /** Modo enlace. */
  href?: string;
  /** Alias de `href` (contrato): se ignora si no hay `href`. */
  asLink?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  /** `scroll` de next/link (false para filtros que no deben saltar arriba). */
  scroll?: boolean;
  /**
   * Modo radio (solo botón): `role="radio"` + `aria-checked` en vez de `aria-pressed`, para grupos de
   * selección única (`role="radiogroup"` en el contenedor). Aditivo: no cambia el comportamiento por defecto.
   */
  radio?: boolean;
  id?: string;
}

const base =
  "inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-label transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0 disabled:cursor-not-allowed disabled:opacity-50";
const idle = "border-line-2 text-text-2 hover:border-fire-500/60 hover:text-text-1";
const on = "border-fire-500 bg-fire-500/[0.12] text-fire-300";

export const Chip = React.forwardRef<HTMLElement, ChipProps>(function Chip(
  { children, selected = false, count, href, onClick, disabled, className, scroll = false, radio = false, id },
  ref,
) {
  const cls = cn(base, selected ? on : idle, className);
  const inner = (
    <>
      {children}
      {typeof count === "number" ? (
        <span className={cn("rounded-full px-1.5 py-0.5 text-label-sm", selected ? "bg-fire-500/20 text-fire-300" : "bg-white/10 text-text-2")}>
          {count}
        </span>
      ) : null}
    </>
  );
  if (href) {
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        scroll={scroll}
        aria-current={selected ? "page" : undefined}
        className={cls}
        onClick={onClick}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      id={id}
      role={radio ? "radio" : undefined}
      aria-checked={radio ? selected : undefined}
      aria-pressed={radio ? undefined : selected}
      disabled={disabled}
      onClick={onClick}
      className={cls}
    >
      {inner}
    </button>
  );
});
