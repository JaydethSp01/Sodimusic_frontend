import { stringToHue } from "@/lib/string-to-hue";
import { cn } from "@/lib/utils";

interface PlaceholderCoverProps {
  /** Semilla para el tinte (nombre del artista, beat, producto…). */
  seed: string;
  /** Texto pequeño bajo la inicial (por defecto la semilla). Vacío = solo inicial. */
  label?: string;
  className?: string;
}

/**
 * Portada de respaldo con marca: gradiente de la marca (tinte por semilla → negro cálido → sombra
 * naranja) e inicial en Archivo expandido, escalada al ancho del contenedor (container query).
 * Decorativa (`aria-hidden`): el texto accesible lo aporta el componente que la usa.
 */
export function PlaceholderCover({ seed, label, className }: PlaceholderCoverProps) {
  const hue = stringToHue(seed);
  const text = (label ?? seed).trim();
  const initial = (seed.trim().charAt(0) || "S").toUpperCase();

  return (
    <div
      className={cn("relative flex h-full w-full flex-col items-center justify-center overflow-hidden", className)}
      style={{
        containerType: "inline-size",
        background: `linear-gradient(160deg, hsl(${hue} 40% 14%) 0%, #131110 55%, #2a1206 100%)`,
      }}
      aria-hidden
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_100%,rgb(var(--fire-500-rgb)/0.22),transparent)]" />
      <span
        className="relative font-display font-extrabold uppercase leading-none text-text-1/80 [font-stretch:125%]"
        style={{ fontSize: "clamp(18px, 34cqw, 112px)" }}
      >
        {initial}
      </span>
      {text ? <span className="relative mt-2 max-w-[80%] truncate text-label-sm text-text-2/70">{text}</span> : null}
    </div>
  );
}
