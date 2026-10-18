import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Grilla editorial de 12 columnas con patrón 8/4 · 4/4/4 · 6/6 (7 celdas por ciclo). Cada hijo ocupa
 * la celda siguiente; en < lg todo apila (1 columna en móvil, 2 en sm). Pasa `MediaCard layout="overlay"`.
 */
const PATTERN = [8, 4, 4, 4, 4, 6, 6] as const;
const SPAN: Record<number, string> = { 4: "lg:col-span-4", 6: "lg:col-span-6", 8: "lg:col-span-8" };

export function BentoGrid({
  children,
  className,
  pattern = PATTERN,
  rowSpans,
}: {
  children: React.ReactNode;
  className?: string;
  pattern?: readonly number[];
  /** Filas que ocupa cada celda en lg (1 por defecto); p. ej. `[2]` = la primera celda alta (1 grande + 2 apiladas). */
  rowSpans?: readonly number[];
}) {
  const items = React.Children.toArray(children);
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5", className)}>
      {items.map((child, i) => {
        const span = pattern[i % pattern.length];
        const rows = rowSpans?.[i] ?? 1;
        return (
          <div
            key={i}
            className={cn(
              "min-w-0",
              SPAN[span] ?? "lg:col-span-4",
              span === 8 && "sm:col-span-2",
              span === 6 && "sm:col-span-1",
              rows === 2 && "lg:row-span-2",
            )}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
