import * as React from "react";
import { cn } from "@/lib/utils";

/** Texto de cuerpo con la escala del sistema. `tone` 1/2/3 = jerarquía; `fire` solo para énfasis. */
export type TextSize = "body-lg" | "body" | "body-sm" | "label" | "label-sm";

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "p" | "span" | "div" | "dd" | "dt" | "li" | "figcaption" | "small";
  size?: TextSize;
  tone?: "1" | "2" | "3" | "fire";
  /** Limita el ancho a 68ch (container-prose). */
  prose?: boolean;
}

const SIZE: Record<TextSize, string> = {
  "body-lg": "text-body-lg",
  body: "text-body",
  "body-sm": "text-body-sm",
  label: "text-label",
  "label-sm": "text-label-sm",
};

const TONE = { "1": "text-text-1", "2": "text-text-2", "3": "text-text-3", fire: "text-fire-400" } as const;

export const Text = React.forwardRef<HTMLElement, TextProps>(function Text(
  { as = "p", size = "body", tone = "2", prose = false, className, ...props },
  ref,
) {
  return React.createElement(as, { ref, className: cn(SIZE[size], TONE[tone], prose && "container-prose", className), ...props });
});
