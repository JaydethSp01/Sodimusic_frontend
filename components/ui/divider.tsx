import { cn } from "@/lib/utils";

/** Separador: `line` (línea 1), `fire` (degradado con naranja al centro), `dots` (tres puntos). */
export function Divider({ variant = "line", className }: { variant?: "line" | "fire" | "dots"; className?: string }) {
  if (variant === "dots") {
    return (
      <div role="separator" className={cn("flex items-center justify-center gap-2 py-2", className)}>
        <span className="h-1 w-1 rounded-full bg-fire-500" />
        <span className="h-1 w-1 rounded-full bg-fire-500/60" />
        <span className="h-1 w-1 rounded-full bg-fire-500/30" />
      </div>
    );
  }
  return <hr className={cn("h-px w-full border-0", variant === "fire" ? "section-divider" : "bg-line-1", className)} />;
}
