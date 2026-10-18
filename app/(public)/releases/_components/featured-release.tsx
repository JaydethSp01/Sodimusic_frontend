import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Sparkles } from "lucide-react";
import { GenreTag } from "@/components/shared/genre-tag";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { COVER_IMAGE_PROPS } from "@/lib/image-blur";
import type { Release } from "@/types/models";
import { SmartLinks } from "./smart-links";
import { ReleaseCountdown } from "./release-countdown";
import { formatReleaseDate, isFutureRelease, parseReleaseDate } from "./release-date";

/**
 * Elige el lanzamiento que se pinta en grande: destacado con fecha futura > destacado > fecha futura > el primero.
 * (`upcoming` del modelo es «visible en /releases», así que lo «próximo» se decide por la fecha.)
 */
export function pickFeaturedRelease(items: Release[]): Release | null {
  if (!items.length) {
    return null;
  }
  return (
    items.find((r) => r.featured && isFutureRelease(r)) ??
    items.find((r) => r.featured) ??
    items.find((r) => isFutureRelease(r)) ??
    items[0]
  );
}

/**
 * Lanzamiento destacado en formato ancho (server component): portada cuadrada con `priority` y, al lado,
 * eyebrow, título display, artista, fecha, cuenta regresiva si es futuro, descripción, género y smart links.
 */
export function FeaturedRelease({ release: r }: { release: Release }) {
  const date = parseReleaseDate(r);
  const future = isFutureRelease(r);
  const href = `/releases/${r.slug}`;

  return (
    <article
      data-testid="featured-release"
      className="group relative grid gap-6 overflow-hidden rounded-lg border border-border bg-background-card transition-colors duration-300 hover:border-primary/30 focus-within:border-primary/50 lg:grid-cols-2 lg:items-center"
    >
      {/* Enlace duplicado solo visual sobre la portada: el enlace accesible es el del título. */}
      <Link href={href} aria-hidden tabIndex={-1} className="relative block aspect-square w-full overflow-hidden">
        {r.coverUrl ? (
          <Image
            src={resolveMediaUrl(r.coverUrl)}
            alt={`Portada de ${r.title} de ${r.artistName}`}
            fill
            priority
            {...COVER_IMAGE_PROPS}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <PlaceholderCover seed={r.artistName} className="absolute inset-0" />
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent lg:hidden"
          aria-hidden
        />
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          {r.upcoming ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--gold)] backdrop-blur-sm">
              <Sparkles className="h-3 w-3" aria-hidden />
              Adelanto
            </span>
          ) : null}
          {r.featured ? (
            <span className="rounded-full bg-primary/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-primary ring-1 ring-primary/40 backdrop-blur-sm">
              Destacado
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-col px-5 pb-6 lg:py-10 lg:pl-2 lg:pr-10">
        <p className="eyebrow">{future ? "Próximo lanzamiento" : "Último lanzamiento"}</p>
        <h2 className="display-title mt-4 text-[clamp(44px,8vw,72px)] text-foreground lg:text-[clamp(56px,5vw,84px)]">
          <Link
            href={href}
            className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background-card"
          >
            {r.title}
          </Link>
        </h2>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">{r.artistName}</p>

        <p className="mt-5 inline-flex items-center gap-2 font-mono text-sm text-white/90">
          <CalendarDays className="h-4 w-4 text-[var(--gold)]" aria-hidden />
          {date ? (
            <>
              {future ? "Sale el " : ""}
              <time dateTime={date.toISOString()}>{formatReleaseDate(date, "long")}</time>
            </>
          ) : (
            <>Previsto · {r.releaseYear}</>
          )}
        </p>
        {future && r.releaseDate ? <ReleaseCountdown target={r.releaseDate} className="mt-5" /> : null}

        {r.description ? (
          <p className="mt-6 max-w-prose text-base leading-relaxed text-[var(--text-secondary)]">{r.description}</p>
        ) : null}
        <div className="mt-5">
          <GenreTag genre={r.genre} />
        </div>
        <div className="relative z-10 mt-8">
          <SmartLinks release={r} />
        </div>
      </div>
    </article>
  );
}
