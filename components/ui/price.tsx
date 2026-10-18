import { formatCOP } from "@/lib/format-cop";
import { cn } from "@/lib/utils";

/**
 * Precio: cifra en mono, prefijo ("desde") y nota ("IVA incl.") en label. Sustituye a los chips de precio.
 * `size`: sm (cuerpo), md (18 px), lg (display-sm). `tone="fire"` para el precio destacado.
 */
export interface PriceProps {
  amount: number;
  prefix?: string;
  note?: string;
  size?: "sm" | "md" | "lg";
  tone?: "1" | "fire";
  /** Precio anterior tachado (descuento). */
  compareAt?: number;
  className?: string;
  format?: (n: number) => string;
}

const SIZE = { sm: "text-body", md: "text-body-lg", lg: "text-display-sm" } as const;

export function Price({ amount, prefix, note, size = "md", tone = "1", compareAt, className, format = formatCOP }: PriceProps) {
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      {prefix ? <span className="text-label text-text-3">{prefix}</span> : null}
      <span className={cn("font-mono font-normal tabular-nums leading-none", SIZE[size], tone === "fire" ? "text-fire-400" : "text-text-1")}>
        {format(amount)}
      </span>
      {typeof compareAt === "number" && compareAt > amount ? (
        <s className="font-mono text-body-sm tabular-nums text-text-3">{format(compareAt)}</s>
      ) : null}
      {note ? <span className="text-label-sm text-text-3">{note}</span> : null}
    </span>
  );
}
