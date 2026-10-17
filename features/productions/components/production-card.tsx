import Image from "next/image";
import { Youtube } from "lucide-react";
import type { Production } from "@/types/models";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { Reveal } from "@/components/shared/reveal";
import { COVER_IMAGE_PROPS } from "@/lib/image-blur";
import { genreColor } from "@/lib/genre-colors";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";

interface ProductionCardProps {
  production: Production;
  /** Prioriza la carga (primeras tarjetas visibles). */
  priority?: boolean;
  className?: string;
}

/** Logotipo de Spotify (SVG inline; Lucide no incluye marcas). */
export function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.504 17.31a.748.748 0 0 1-1.03.249c-2.82-1.724-6.37-2.114-10.55-1.16a.748.748 0 1 1-.333-1.459c4.574-1.045 8.5-.595 11.664 1.339a.748.748 0 0 1 .249 1.03zm1.469-3.267a.936.936 0 0 1-1.287.308c-3.228-1.984-8.148-2.559-11.966-1.4a.936.936 0 1 1-.544-1.791c4.362-1.324 9.785-.683 13.49 1.595a.936.936 0 0 1 .307 1.288zm.126-3.403C15.235 8.34 8.81 8.13 5.116 9.251a1.123 1.123 0 0 1-.652-2.149c4.24-1.287 11.29-1.038 15.747 1.608a1.123 1.123 0 1 1-1.145 1.93z" />
    </svg>
  );
}

const iconBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-sm transition-colors hover:border-primary hover:bg-primary hover:text-[var(--primary-foreground)] focus-visible:border-primary";

export function ProductionCard({ production, priority = false, className }: ProductionCardProps) {
  const loc = [production.artistCity, production.artistCountry].filter(Boolean).join(", ");
  const color = genreColor(production.genre);
  const hasLinks = !!(production.spotifyUrl || production.youtubeUrl);

  return (
    <Reveal
      as="article"
      variant="card"
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-background-card transition-[border-color,box-shadow,transform] duration-300",
        "hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_22px_48px_-18px_rgba(255,107,0,0.35)]",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {production.coverUrl ? (
          <Image
            src={resolveMediaUrl(production.coverUrl)}
            alt={`Portada de ${production.title} por ${production.artistName}`}
            fill
            priority={priority}
            {...COVER_IMAGE_PROPS}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <PlaceholderCover seed={production.artistName} label={production.artistName} className="absolute inset-0" />
        )}

        {/* Degradado: transparente arriba, casi opaco abajo para la jerarquía de texto. */}
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.05)_0%,rgba(8,8,8,0)_30%,rgba(8,8,8,0.55)_62%,rgba(8,8,8,0.96)_100%)]"
          aria-hidden
        />

        {/* Chips superiores: año y género */}
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/15 bg-black/70 px-2.5 py-1 font-mono text-[10px] tracking-wider text-white/90 backdrop-blur-sm">
            {production.year}
          </span>
          {production.genre ? (
            <span
              className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm"
              style={{ color: color.fg, borderColor: color.border, background: "rgba(8,8,8,0.72)" }}
            >
              {production.genre}
            </span>
          ) : null}
        </div>

        {/* Bloque inferior: título, artista, ubicación y enlaces */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0">
            <h3 className="display-title text-balance text-2xl text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.5)] md:text-3xl">
              {production.title}
            </h3>
            <p className="mt-1.5 truncate text-sm font-medium text-white/90">{production.artistName}</p>
            {loc ? <p className="mt-0.5 truncate font-mono text-[11px] text-white/60">{loc}</p> : null}
          </div>
          {hasLinks ? (
            <div className="flex shrink-0 gap-2">
              {production.spotifyUrl ? (
                <a
                  href={production.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={iconBtn}
                  aria-label={`Escuchar ${production.title} en Spotify`}
                >
                  <SpotifyIcon className="h-5 w-5" />
                </a>
              ) : null}
              {production.youtubeUrl ? (
                <a
                  href={production.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={iconBtn}
                  aria-label={`Ver ${production.title} en YouTube`}
                >
                  <Youtube className="h-5 w-5" aria-hidden />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}
