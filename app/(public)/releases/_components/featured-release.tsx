import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { EditorialSplit } from "@/components/ds/editorial-split";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { GenreTag } from "@/components/shared/genre-tag";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
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
 * Lanzamiento destacado como `EditorialSplit` (server component): portada 1/1 en duotono a la izquierda
 * (el hover revela el color), eyebrow serif, título display-md enlazado, artista, fecha en mono,
 * cuenta regresiva si es futuro, descripción, género y smart links.
 */
export function FeaturedRelease({ release: r }: { release: Release }) {
  const date = parseReleaseDate(r);
  const future = isFutureRelease(r);
  const href = `/releases/${r.slug}`;

  return (
    <article data-testid="featured-release" className="group relative">
      <EditorialSplit
        reverse
        overflow={false}
        className="max-lg:flex max-lg:flex-col-reverse"
        image={{
          src: r.coverUrl ? resolveMediaUrl(r.coverUrl) : null,
          alt: r.coverUrl ? `Portada de ${r.title} de ${r.artistName}` : "",
          aspect: "1/1",
          priority: true,
          sizes: "(max-width: 1024px) 100vw, 40vw",
          fallbackSeed: r.artistName,
          badges: (
            <>
              {future ? (
                <Badge tone="gold" variant="solid">
                  Próximo
                </Badge>
              ) : null}
              {r.featured ? <Badge tone="fire">Destacado</Badge> : null}
            </>
          ),
        }}
        caption={
          date ? (
            <>
              <CalendarDays className="h-4 w-4 text-gold-400" strokeWidth={1.75} aria-hidden />
              {future ? "Sale el " : ""}
              <time dateTime={date.toISOString()}>{formatReleaseDate(date, "long")}</time>
            </>
          ) : (
            <>Previsto · {r.releaseYear}</>
          )
        }
      >
        <Eyebrow tone="serif" size="lg">
          {future ? "Próximo lanzamiento" : "Último lanzamiento"}
        </Eyebrow>
        <Heading as="h2" size="display-md" className="mt-3">
          <Link href={href} className="link-sweep transition-colors duration-150 hover:text-fire-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-0">
            {r.title}
          </Link>
        </Heading>
        <Text size="body-lg" tone="2" className="mt-3">
          {r.artistName}
        </Text>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <GenreTag genre={r.genre} />
        </div>
        {future && r.releaseDate ? <ReleaseCountdown target={r.releaseDate} className="mt-8" /> : null}
        {r.description ? (
          <Text size="body" tone="2" prose className="mt-6">
            {r.description}
          </Text>
        ) : null}
        <SmartLinks release={r} className="relative z-10 mt-8" />
      </EditorialSplit>
    </article>
  );
}
