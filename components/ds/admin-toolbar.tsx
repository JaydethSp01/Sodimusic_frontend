import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Barra de módulo admin: búsqueda + filtros + acción primaria; `sticky` bajo la cabecera. */
export interface AdminToolbarProps {
  search?: ReactNode;
  filters?: ReactNode;
  action?: ReactNode;
  /** Texto corto a la izquierda de la acción (p. ej. "24 resultados"). */
  summary?: ReactNode;
  sticky?: boolean;
  className?: string;
}

export function AdminToolbar({ search, filters, action, summary, sticky = true, className }: AdminToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-line-1 bg-ink-1/90 p-3 backdrop-blur-md md:flex-row md:items-center",
        sticky && "sticky top-[var(--admin-header-h,64px)] z-30",
        className,
      )}
    >
      {search ? <div className="w-full md:max-w-sm">{search}</div> : null}
      {filters ? <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{filters}</div> : <div className="flex-1" />}
      <div className="flex items-center justify-between gap-3 md:justify-end">
        {summary ? <span className="font-mono text-body-sm tabular-nums text-text-3">{summary}</span> : null}
        {action}
      </div>
    </div>
  );
}
