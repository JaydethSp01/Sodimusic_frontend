import { stringToHue } from "@/lib/string-to-hue";
import { cn } from "@/lib/utils";

/**
 * Retrato de respaldo cuando el artista no tiene foto: círculo con la inicial en Archivo sobre un
 * tinte por nombre. Sustituye al placeholder 3/4 (demasiado vacío a página completa). Decorativo.
 */
export function ArtistMonogram({ name, size = "md", className }: { name: string; size?: "md" | "lg"; className?: string }) {
  const hue = stringToHue(name);
  const initial = (name.trim().charAt(0) || "S").toUpperCase();
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-line-2 shadow-card",
        size === "lg" ? "h-36 w-36 lg:h-44 lg:w-44" : "h-28 w-28 lg:h-32 lg:w-32",
        className,
      )}
      style={{ background: `linear-gradient(160deg, hsl(${hue} 40% 18%) 0%, #131110 60%, rgb(var(--fire-500-rgb) / 0.35) 100%)` }}
    >
      <span className={cn("font-display font-extrabold uppercase leading-none text-text-1 [font-stretch:125%]", size === "lg" ? "text-display-md" : "text-display-sm")}>
        {initial}
      </span>
    </div>
  );
}
