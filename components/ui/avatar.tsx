import Image from "next/image";
import { stringToHue } from "@/lib/string-to-hue";
import { cn } from "@/lib/utils";

/** Avatar 32/40/56/80 con fallback: inicial en Archivo sobre gradiente tintado por el nombre. */
export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 32 | 40 | 56 | 80;
  className?: string;
  /** Cuadrado con radio 8 en vez de círculo (canales, portadas pequeñas). */
  square?: boolean;
}

const SIZE = {
  32: "h-8 w-8 text-body-sm",
  40: "h-10 w-10 text-body",
  56: "h-14 w-14 text-title",
  80: "h-20 w-20 text-display-sm",
} as const;

export function Avatar({ name, src, size = 40, className, square = false }: AvatarProps) {
  const hue = stringToHue(name || "?");
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden border border-line-1 font-display font-extrabold uppercase text-text-1",
        square ? "rounded" : "rounded-full",
        SIZE[size],
        className,
      )}
      style={{
        background: `linear-gradient(145deg, hsl(${hue} 55% 22%) 0%, hsl(${(hue + 30) % 360} 60% 10%) 100%)`,
      }}
      aria-hidden
    >
      {src ? <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" /> : initial}
    </span>
  );
}
