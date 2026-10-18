import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Único componente para titulares. `size` = escala display (xl/lg/md/sm) o `title` (tarjeta).
 * `accent="palabra"` envuelve esa palabra (primera coincidencia) en `<em>` serif itálica naranja;
 * también se puede escribir `<em>` a mano dentro de `children`.
 */
export type HeadingSize = "display-xl" | "display-lg" | "display-md" | "display-sm" | "title";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span";
  size?: HeadingSize;
  tone?: "1" | "2" | "fire";
  accent?: string;
  balance?: boolean;
}

const SIZE: Record<HeadingSize, string> = {
  "display-xl": "font-display font-extrabold text-display-xl",
  "display-lg": "font-display font-extrabold text-display-lg",
  "display-md": "font-display font-extrabold text-display-md",
  "display-sm": "font-display font-extrabold text-display-sm",
  title: "text-title",
};

const TONE = { "1": "text-text-1", "2": "text-text-2", fire: "text-fire-500" } as const;

const EM =
  "[&_em]:text-accent [&_em]:text-fire-300 [&_em]:font-normal [&_em]:normal-case [&_em]:tracking-normal";

function withAccent(children: React.ReactNode, accent?: string): React.ReactNode {
  if (!accent || typeof children !== "string") return children;
  const i = children.toLowerCase().indexOf(accent.toLowerCase());
  if (i < 0) return children;
  return (
    <>
      {children.slice(0, i)}
      <em>{children.slice(i, i + accent.length)}</em>
      {children.slice(i + accent.length)}
    </>
  );
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { as: Tag = "h2", size = "display-md", tone = "1", accent, balance = true, className, children, ...props },
  ref,
) {
  return (
    <Tag ref={ref} className={cn(SIZE[size], TONE[tone], EM, balance && "text-balance", className)} {...props}>
      {withAccent(children, accent)}
    </Tag>
  );
});
