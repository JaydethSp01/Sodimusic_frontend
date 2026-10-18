import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Barra de filtros: uno o varios `FilterGroup` (etiqueta + Chips) con scroll horizontal en móvil
 * (desvanecidos en los bordes) y wrap en escritorio. `sticky` la fija bajo la nav (`--nav-h`).
 * `end` es un slot a la derecha (toggle lista/grilla, contador).
 */
export interface FilterBarProps {
  children: ReactNode;
  end?: ReactNode;
  sticky?: boolean;
  className?: string;
  label?: string;
}

export function FilterBar({ children, end, sticky = false, className, label = "Filtros" }: FilterBarProps) {
  return (
    <section
      aria-label={label}
      className={cn(
        "border-b border-line-1 py-3",
        sticky && "sticky top-[var(--nav-h,72px)] z-40 bg-ink-0/85 backdrop-blur-md",
        className,
      )}
    >
      <div className="container-page flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3">{children}</div>
        {end ? <div className="flex shrink-0 items-center gap-2">{end}</div> : null}
      </div>
    </section>
  );
}

export interface FilterGroupProps {
  label: string;
  /** Muestra la etiqueta en pantalla (mono) además de `aria-label`. */
  showLabel?: boolean;
  as?: "nav" | "div";
  children: ReactNode;
  className?: string;
}

export function FilterGroup({ label, showLabel = false, as: Tag = "div", children, className }: FilterGroupProps) {
  return (
    <Tag aria-label={label} className={cn("relative -mx-4 flex min-w-0 items-center gap-3 sm:-mx-6 lg:mx-0", className)}>
      {showLabel ? <span className="hidden shrink-0 text-label text-text-3 lg:inline">{label}</span> : null}
      <ul className="no-scrollbar max-lg:scroll-fade-x flex w-full gap-2 overflow-x-auto px-4 py-0.5 sm:px-6 lg:flex-wrap lg:overflow-visible lg:px-0">
        {children}
      </ul>
    </Tag>
  );
}
