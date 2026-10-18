import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Único componente para eyebrows. `tone="fire"`: línea + mono en naranja (por defecto).
 * `tone="serif"`: Instrument Serif itálica, sin línea (editorial). `size="lg"` sube el serif a display-sm.
 */
export interface EyebrowProps extends React.HTMLAttributes<HTMLElement> {
  tone?: "fire" | "serif";
  as?: "p" | "span" | "div";
  size?: "md" | "lg";
  align?: "left" | "center";
}

export function Eyebrow({ tone = "fire", as: Tag = "p", size = "md", align = "left", className, children, ...props }: EyebrowProps) {
  return (
    <Tag
      className={cn(
        tone === "fire"
          ? "inline-flex items-center gap-3 text-label text-fire-500 before:h-px before:w-6 before:shrink-0 before:bg-fire-500 before:content-['']"
          : cn("text-accent text-text-2", size === "lg" ? "text-display-sm" : "text-body-lg"),
        align === "center" && "justify-center text-center",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
