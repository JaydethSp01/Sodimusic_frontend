import type { ReactNode } from "react";
import { MediaFrame, type MediaFrameProps } from "@/components/ds/media-frame";
import { cn } from "@/lib/utils";

/**
 * Dos columnas 7/5: texto (children) y una imagen 4/5 en `MediaFrame` que sobresale verticalmente
 * del bloque de texto en escritorio (`overflow`). `quote` va en serif encima del texto.
 * `reverse` pone la imagen a la izquierda. `media` admite un nodo propio en vez de la imagen.
 */
export interface EditorialSplitProps {
  children: ReactNode;
  quote?: ReactNode;
  media?: ReactNode;
  image?: Omit<MediaFrameProps, "className">;
  reverse?: boolean;
  overflow?: boolean;
  caption?: ReactNode;
  className?: string;
}

export function EditorialSplit({ children, quote, media, image, reverse = false, overflow = true, caption, className }: EditorialSplitProps) {
  return (
    <div className={cn("grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16", className)}>
      <div className={cn("min-w-0 lg:col-span-7", reverse && "lg:order-2")}>
        {quote ? <blockquote className="text-accent mb-8 text-display-sm text-fire-300 lg:text-balance">{quote}</blockquote> : null}
        {children}
      </div>
      <figure className={cn("relative min-w-0 lg:col-span-5", reverse && "lg:order-1", overflow && "lg:-my-12")}>
        {media ?? (image ? <MediaFrame aspect="4/5" treatment="duotone" hoverReveal {...image} /> : null)}
        {caption ? (
          <figcaption className="mt-3 flex items-center gap-3 text-label text-text-3">
            <span className="h-px w-6 bg-gold-500" aria-hidden />
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </div>
  );
}
