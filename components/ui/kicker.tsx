import { cn } from "@/lib/utils";

/** Número de sección grande en serif itálica (01, 02…). Decorativo: `aria-hidden`. */
export function Kicker({ children, className, size = "md" }: { children: React.ReactNode; className?: string; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden
      className={cn("text-accent block tabular-nums leading-none text-fire-500/80", size === "lg" ? "text-display-md" : "text-display-sm", className)}
    >
      {children}
    </span>
  );
}
