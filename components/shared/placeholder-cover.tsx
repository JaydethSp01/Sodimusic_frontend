import Image from "next/image";
import { stringToHue } from "@/lib/string-to-hue";
import { cn } from "@/lib/utils";

interface PlaceholderCoverProps {
  /** Semilla para el tinte (nombre del artista, beat, producto…). */
  seed: string;
  /** Texto pequeño bajo el logo (por defecto la semilla). Vacío = solo logo. */
  label?: string;
  className?: string;
}

/**
 * Portada de respaldo con marca: logo Sodimusic tenue sobre un degradado
 * tintado por la semilla y el nombre en pequeño. Decorativa (`aria-hidden`):
 * el texto accesible lo aporta el componente que la usa.
 */
export function PlaceholderCover({ seed, label, className }: PlaceholderCoverProps) {
  const hue = stringToHue(seed);
  const hue2 = (hue + 40) % 360;
  const text = (label ?? seed).trim();

  return (
    <div
      className={cn("relative flex h-full w-full flex-col items-center justify-center overflow-hidden", className)}
      style={{
        background: `radial-gradient(ellipse 80% 70% at 50% 30%, hsl(${hue}, 45%, 16%) 0%, hsl(${hue2}, 35%, 7%) 70%, #0a0a0a 100%)`,
      }}
      aria-hidden
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 14px)",
        }}
      />
      <span className="relative h-[34%] w-[34%] min-h-12 min-w-12 max-h-24 max-w-24 overflow-hidden rounded-full opacity-45 grayscale transition-opacity duration-300 group-hover:opacity-70">
        <Image src="/logosodi.jpeg" alt="" fill sizes="96px" className="object-cover" />
      </span>
      {text ? (
        <span className="relative mt-3 max-w-[80%] truncate font-mono text-[10px] uppercase tracking-[0.25em] text-white/55">
          {text}
        </span>
      ) : null}
    </div>
  );
}
