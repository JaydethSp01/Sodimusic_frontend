import type { ReactNode } from "react";
import Image from "next/image";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { cn } from "@/lib/utils";

/**
 * Base de toda imagen: relación de aspecto, tratamiento (`duotone` / `veil` / `none`), `hoverReveal`
 * (el duotono se va en hover del propio frame o de un `.group` padre), `zoom` (la imagen escala 1.04),
 * badges en las esquinas y `overlay` inferior sobre velo. Sin `src` pinta `PlaceholderCover`.
 */
export type MediaAspect = "1/1" | "4/5" | "16/9" | "3/4" | "auto";

export interface MediaFrameProps {
  src?: string | null;
  alt: string;
  aspect?: MediaAspect;
  treatment?: "duotone" | "veil" | "none";
  hoverReveal?: boolean;
  zoom?: boolean;
  /** Esquina superior izquierda (Badges). */
  badges?: ReactNode;
  /** Esquina superior derecha. */
  badgesEnd?: ReactNode;
  /** Contenido anclado abajo sobre un velo. */
  overlay?: ReactNode;
  /** Contenido centrado (PlayButton). */
  center?: ReactNode;
  /** Semilla del placeholder si no hay `src`. */
  fallbackSeed?: string;
  fallbackLabel?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  /** Sirve la imagen sin el optimizador (hosts fuera de `images.remotePatterns`). */
  unoptimized?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  className?: string;
  /** Relleno del `<img>`: cover (defecto) o contain (logos). */
  fit?: "cover" | "contain";
  children?: ReactNode;
}

const ASPECT: Record<MediaAspect, string> = {
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
  "16/9": "aspect-video",
  "3/4": "aspect-[3/4]",
  auto: "",
};

const ROUNDED = { none: "rounded-none", sm: "rounded-sm", md: "rounded", lg: "rounded-lg", full: "rounded-full" } as const;

export function MediaFrame({
  src,
  alt,
  aspect = "4/5",
  treatment = "duotone",
  hoverReveal = true,
  zoom = false,
  badges,
  badgesEnd,
  overlay,
  center,
  fallbackSeed,
  fallbackLabel,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  quality = 70,
  unoptimized = false,
  rounded = "lg",
  className,
  fit = "cover",
  children,
}: MediaFrameProps) {
  const hasImage = Boolean(src?.trim());
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-ink-2",
        ASPECT[aspect],
        ROUNDED[rounded],
        hasImage && treatment === "duotone" && "media-duotone",
        hasImage && treatment === "duotone" && hoverReveal && "is-reveal",
        hasImage && treatment === "veil" && "media-veil",
        zoom && "hover-zoom",
        className,
      )}
    >
      {hasImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          priority={priority}
          quality={quality}
          unoptimized={unoptimized}
          sizes={sizes}
          className={cn("object-center", fit === "cover" ? "object-cover" : "object-contain")}
        />
      ) : (
        <PlaceholderCover seed={fallbackSeed ?? alt} label={fallbackLabel} className="absolute inset-0" />
      )}
      {badges ? <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">{badges}</div> : null}
      {badgesEnd ? <div className="absolute right-3 top-3 z-10 flex flex-wrap justify-end gap-1.5">{badgesEnd}</div> : null}
      {center ? <div className="absolute inset-0 z-10 flex items-center justify-center">{center}</div> : null}
      {overlay ? (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-[linear-gradient(180deg,transparent_0%,rgba(5,4,4,0.55)_40%,rgba(5,4,4,0.92)_100%)] px-4 pb-4 pt-12">
          {overlay}
        </div>
      ) : null}
      {children}
    </div>
  );
}
