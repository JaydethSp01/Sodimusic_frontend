import { MediaCard } from "@/components/ds/media-card";
import { Reveal } from "@/components/shared/reveal";
import { RevealItem } from "@/components/shared/reveal-item";
import { Badge } from "@/components/ui/badge";
import { artistHref } from "@/features/artists/hrefs";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type { Artist } from "@/types/models";

interface ArtistsGridProps {
  artists: Artist[];
  /** `false` cuando los datos vienen del SiteConfig de respaldo (sin ficha en la API). */
  linkToDetail?: boolean;
}

/**
 * Crew/artistas: `MediaCard` 3/4 overlay (duotono que el hover revela) con rol · ciudad en badge,
 * nombre en display-sm, bio corta en dos líneas y géneros en mono. Cada tarjeta enlaza a `/artists/[slug]`.
 */
export function ArtistsGrid({ artists, linkToDetail = true }: ArtistsGridProps) {
  return (
    <Reveal as="ul" variant="stagger" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5" aria-label="Artistas del sello">
      {artists.map((a, i) => {
        const photo = a.photoUrl?.trim() ? resolveMediaUrl(a.photoUrl) : null;
        return (
          <RevealItem as="li" key={a.id} className="h-full">
            <MediaCard
              as="article"
              layout="overlay"
              aspect="3/4"
              src={photo}
              alt={photo ? `Foto de ${a.name}` : ""}
              fallbackSeed={a.name}
              fallbackLabel={a.name}
              priority={i < 3}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              href={linkToDetail ? artistHref(a.slug) : undefined}
              meta={
                <>
                  <Badge tone="fire">{a.role}</Badge>
                  {a.city ? <Badge tone="neutral" className="bg-ink-0/70 backdrop-blur-sm">{a.city}</Badge> : null}
                </>
              }
              title={a.name}
              description={
                a.shortBio?.trim() ? (
                  a.shortBio
                ) : a.genres.length ? (
                  <span className="font-mono text-label text-text-2">{a.genres.join(" · ")}</span>
                ) : undefined
              }
              className="h-full"
            />
          </RevealItem>
        );
      })}
    </Reveal>
  );
}
