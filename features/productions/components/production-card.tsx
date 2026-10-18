import { Play } from "lucide-react";
import type { Production } from "@/types/models";
import { MediaCard } from "@/components/ds/media-card";
import { Badge } from "@/components/ui/badge";
import { GenreTag } from "@/components/shared/genre-tag";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";

interface ProductionCardProps {
  production: Production;
  /** Prioriza la carga (primeras tarjetas visibles). */
  priority?: boolean;
  /** Relación de aspecto de la portada (la grilla editorial usa 16/9 en la celda ancha). */
  aspect?: "4/5" | "16/9" | "1/1";
  /** Tamaño del título sobre la imagen. */
  titleSize?: "display-sm" | "display-md" | "title";
  sizes?: string;
  className?: string;
  /** Clases del `MediaFrame` (p. ej. `max-sm:aspect-video`). */
  mediaClassName?: string;
}

/** Logotipo de Spotify (SVG inline; Lucide no incluye marcas). */
export function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.504 17.31a.748.748 0 0 1-1.03.249c-2.82-1.724-6.37-2.114-10.55-1.16a.748.748 0 1 1-.333-1.459c4.574-1.045 8.5-.595 11.664 1.339a.748.748 0 0 1 .249 1.03zm1.469-3.267a.936.936 0 0 1-1.287.308c-3.228-1.984-8.148-2.559-11.966-1.4a.936.936 0 1 1-.544-1.791c4.362-1.324 9.785-.683 13.49 1.595a.936.936 0 0 1 .307 1.288zm.126-3.403C15.235 8.34 8.81 8.13 5.116 9.251a1.123 1.123 0 0 1-.652-2.149c4.24-1.287 11.29-1.038 15.747 1.608a1.123 1.123 0 1 1-1.145 1.93z" />
    </svg>
  );
}

const glass =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 text-text-1 backdrop-blur-sm transition-[background-color,color,box-shadow] duration-150 ease-out hover:bg-fire-500 hover:text-fire-on hover:shadow-fire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0";

/**
 * Tarjeta de producción: `MediaCard` overlay con duotono que el hover revela, badges de año y género,
 * título display sobre la imagen, artista en mono, play de YouTube centrado y Spotify en el pie.
 * Los enlaces externos abren en pestaña nueva con `rel="noopener noreferrer"` y `aria-label` (e2e).
 */
export function ProductionCard({ production, priority = false, aspect = "4/5", titleSize = "display-sm", sizes, className, mediaClassName }: ProductionCardProps) {
  const loc = [production.artistCity, production.artistCountry].filter(Boolean).join(", ");
  return (
    <MediaCard
      as="article"
      layout="overlay"
      aspect={aspect}
      overlayTitleSize={titleSize}
      src={production.coverUrl ? resolveMediaUrl(production.coverUrl) : null}
      alt={production.coverUrl ? `Portada de ${production.title} por ${production.artistName}` : ""}
      fallbackSeed={production.artistName}
      fallbackLabel={production.artistName}
      priority={priority}
      sizes={sizes ?? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
      className={cn("h-full", className)}
      mediaClassName={mediaClassName}
      meta={
        <>
          <Badge tone="fire" variant="solid">
            {production.year}
          </Badge>
          {production.genre ? <GenreTag genre={production.genre} className="bg-ink-0/70 backdrop-blur-sm" /> : null}
        </>
      }
      title={production.title}
      description={
        <span className="font-mono text-label text-text-2">
          {production.artistName}
          {loc ? <span className="text-text-3"> · {loc}</span> : null}
        </span>
      }
      center={
        production.youtubeUrl ? (
          <a
            href={production.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver ${production.title} en YouTube`}
            className={cn(glass, "h-14 w-14")}
          >
            <Play className="ml-0.5 h-6 w-6" fill="currentColor" strokeWidth={0} aria-hidden />
          </a>
        ) : null
      }
      action={
        production.spotifyUrl ? (
          <a
            href={production.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Escuchar ${production.title} en Spotify`}
            className={cn(glass, "h-11 w-11")}
          >
            <SpotifyIcon className="h-5 w-5" />
          </a>
        ) : null
      }
    />
  );
}
