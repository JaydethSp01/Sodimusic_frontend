import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Cifra display-sm en fire + label mono + línea inferior. Sustituye a las cajas de cifras. */
export interface StatItemProps {
  value: ReactNode;
  suffix?: string;
  label: ReactNode;
  as?: "div" | "li";
  /** Línea a la izquierda (lista vertical) en vez de inferior. */
  orientation?: "bottom" | "left";
  /** Etiquetas de la cifra y del rótulo: `dd`/`dt` para usarlo dentro de un `<dl>`. */
  valueAs?: "p" | "dd";
  labelAs?: "p" | "dt";
  className?: string;
}

export function StatItem({
  value,
  suffix,
  label,
  as: Tag = "div",
  orientation = "bottom",
  valueAs: ValueTag = "p",
  labelAs: LabelTag = "p",
  className,
}: StatItemProps) {
  return (
    <Tag
      className={cn(
        "self-start border-line-2",
        orientation === "bottom" ? "border-b pb-4" : "border-l pl-4",
        className,
      )}
    >
      <ValueTag className="font-display font-extrabold text-display-sm tabular-nums text-text-1">
        {value}
        {suffix ? <span className="text-text-2">{suffix}</span> : null}
      </ValueTag>
      <LabelTag className="mt-2 text-label text-text-3">{label}</LabelTag>
    </Tag>
  );
}
