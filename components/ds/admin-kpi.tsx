import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** Cifra + delta + label para el resumen del panel. */
export interface AdminKpiProps {
  label: ReactNode;
  value: ReactNode;
  /** Variación en % (positivo = success, negativo = danger, 0 = neutro). */
  delta?: number;
  deltaLabel?: string;
  icon?: LucideIcon;
  href?: string;
  /** Nota corta bajo la cifra cuando no hay delta (p. ej. "Últimos 30 días"). */
  hint?: ReactNode;
  className?: string;
}

export function AdminKpi({ label, value, delta, deltaLabel = "vs. periodo anterior", icon, hint, className }: AdminKpiProps) {
  const dir = typeof delta !== "number" || delta === 0 ? "flat" : delta > 0 ? "up" : "down";
  return (
    <div className={cn("rounded-lg border border-line-1 bg-ink-2 p-5 shadow-card", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-label text-text-3">{label}</p>
        {icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fire-500/[0.12] text-fire-400">
            <Icon icon={icon} size={20} />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display font-extrabold text-display-sm tabular-nums text-text-1">{value}</p>
      {typeof delta === "number" ? (
        <p className="mt-2 flex items-center gap-1.5 text-body-sm text-text-3">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-sm px-1.5 py-0.5 font-mono text-label-sm",
              dir === "up" && "bg-success/[0.14] text-success",
              dir === "down" && "bg-danger/[0.14] text-danger",
              dir === "flat" && "bg-white/[0.08] text-text-2",
            )}
          >
            {dir === "up" ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden /> : dir === "down" ? <ArrowDownRight className="h-3.5 w-3.5" aria-hidden /> : <Minus className="h-3.5 w-3.5" aria-hidden />}
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
          {deltaLabel}
        </p>
      ) : hint ? (
        <span className="mt-2 block text-body-sm text-text-3">{hint}</span>
      ) : null}
    </div>
  );
}
