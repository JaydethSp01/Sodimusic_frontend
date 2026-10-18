import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Etiqueta de datos (mono, mayúsculas, radio 4 px). `tone` × `variant` × `size`.
 * Sustituye a todos los `<span class="rounded-full … text-[10px]">` sueltos.
 * Alias de compatibilidad para `variant`: `default` (= fire/soft), `secondary` (= neutral/soft).
 */
export type BadgeTone = "neutral" | "fire" | "sea" | "gold" | "success" | "warning" | "danger";
export type BadgeVariant = "solid" | "soft" | "outline";
export type BadgeSize = "sm" | "md";

const TONES: Record<BadgeTone, Record<BadgeVariant, string>> = {
  neutral: {
    solid: "border-transparent bg-text-1 text-ink-0",
    soft: "border-transparent bg-white/[0.08] text-text-2",
    outline: "border-line-2 bg-transparent text-text-2",
  },
  fire: {
    solid: "border-transparent bg-fire-500 text-fire-on",
    soft: "border-transparent bg-fire-500/[0.14] text-fire-300",
    outline: "border-fire-500/50 bg-transparent text-fire-400",
  },
  sea: {
    solid: "border-transparent bg-sea-500 text-sea-on",
    soft: "border-transparent bg-sea-500/[0.14] text-sea-400",
    outline: "border-sea-500/50 bg-transparent text-sea-400",
  },
  gold: {
    solid: "border-transparent bg-gold-500 text-ink-0",
    soft: "border-transparent bg-gold-500/[0.16] text-gold-400",
    outline: "border-gold-500/50 bg-transparent text-gold-400",
  },
  success: {
    solid: "border-transparent bg-success text-ink-0",
    soft: "border-transparent bg-success/[0.14] text-success",
    outline: "border-success/50 bg-transparent text-success",
  },
  warning: {
    solid: "border-transparent bg-warning text-ink-0",
    soft: "border-transparent bg-warning/[0.14] text-warning",
    outline: "border-warning/50 bg-transparent text-warning",
  },
  danger: {
    solid: "border-transparent bg-danger text-ink-0",
    soft: "border-transparent bg-danger/[0.14] text-danger",
    outline: "border-danger/50 bg-transparent text-danger",
  },
};

const SIZES: Record<BadgeSize, string> = {
  sm: "h-5 px-1.5 text-label-sm",
  md: "h-6 px-2 text-label",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant | "default" | "secondary";
  size?: BadgeSize;
  /** Icono Lucide opcional a la izquierda (16 px). */
  icon?: React.ReactNode;
}

function resolve(tone: BadgeTone | undefined, variant: BadgeProps["variant"]): [BadgeTone, BadgeVariant] {
  if (variant === "default") return [tone ?? "fire", "soft"];
  if (variant === "secondary") return [tone ?? "neutral", "soft"];
  return [tone ?? "neutral", variant ?? "soft"];
}

function Badge({ className, tone, variant, size = "sm", icon, children, ...props }: BadgeProps) {
  const [t, v] = resolve(tone, variant);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-sm border align-middle [&_svg]:size-3.5 [&_svg]:shrink-0",
        TONES[t][v],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

export { Badge };
