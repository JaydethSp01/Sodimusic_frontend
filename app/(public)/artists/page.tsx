import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { EditorialSplit } from "@/components/ds/editorial-split";
import { EmptyState } from "@/components/ds/empty-state";
import { HeroPage } from "@/components/ds/hero-page";
import { MediaFrame } from "@/components/ds/media-frame";
import { SectionHeader } from "@/components/ds/section-header";
import { StatItem } from "@/components/ds/stat-item";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { GenreTag } from "@/components/shared/genre-tag";
import { artistsFromSiteContent, fetchArtists, pickProducer } from "@/features/artists/api";
import { ArtistPlatformLinks } from "@/features/artists/components/artist-platform-links";
import { ArtistsGrid } from "@/features/artists/components/artists-grid";
import { artistHref } from "@/features/artists/hrefs";
import { HomeChannelsSection } from "@/features/channels/components/home-channels-section";
import { getSiteContent } from "@/lib/site-config-server";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const title = "Artistas y crew";
  const description = site.artists.pageHeroDescription;
  return { title, description, alternates: { canonical: "/artists" }, openGraph: { title, description } };
}

/**
 * /artists: productor principal en `EditorialSplit` (foto 3/4, nombre display-lg solapando la foto en
 * escritorio) enlazando a su ficha; crew/artistas en grilla de `MediaCard` 3/4; canales de YouTube debajo.
 * Si la API aún no tiene artistas, se pintan los del SiteConfig (sin enlace a ficha).
 */
export default async function ArtistsPage() {
  const site = await getSiteContent();
  const fromApi = await fetchArtists();
  const fromCms = fromApi.length === 0;
  const artists = fromCms ? artistsFromSiteContent(site) : fromApi;
  const producer = pickProducer(artists);
  const crew = artists.filter((a) => a.id !== producer?.id);
  const producerPhoto = producer?.photoUrl?.trim() ? resolveMediaUrl(producer.photoUrl) : null;
  const producerBio = producer?.bio?.split(/\n\n+/)[0]?.trim() || producer?.shortBio?.trim() || "";

  return (
    <div>
      <HeroPage
        eyebrow="Artistas"
        title={site.artists.pageHeroTitle}
        description={site.artists.pageHeroDescription}
        aside={artists.length ? <StatItem value={artists.length} label={artists.length === 1 ? "Artista del sello" : "Artistas del sello"} orientation="left" /> : undefined}
      />

      {producer ? (
        <section className="container-page py-section" aria-labelledby="producer-feature">
          <EditorialSplit
            reverse
            overflow={false}
            className="max-lg:flex max-lg:flex-col-reverse"
            media={
              <MediaFrame
                src={producerPhoto}
                alt={producerPhoto ? `Foto de ${producer.name}` : ""}
                aspect="3/4"
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                fallbackSeed={producer.name}
                fallbackLabel={producer.name}
                className="shadow-card"
              />
            }
            caption={producer.city ? producer.city : undefined}
          >
            <Eyebrow>{producer.role === "Productor principal" ? site.artists.producerLabel : producer.role}</Eyebrow>
            <Heading as="h2" size="display-lg" id="producer-feature" className="relative z-10 mt-4 lg:-ml-[22%]">
              {fromCms ? (
                producer.name
              ) : (
                <Link href={artistHref(producer.slug)} className="link-sweep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-0">
                  {producer.name}
                </Link>
              )}
            </Heading>
            {producer.genres.length ? (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Géneros">
                {producer.genres.map((g) => (
                  <li key={g}>
                    <GenreTag genre={g} />
                  </li>
                ))}
              </ul>
            ) : null}
            {producerBio ? (
              <Text size="body-lg" tone="2" prose className="mt-7">
                {producerBio}
              </Text>
            ) : null}
            <ArtistPlatformLinks artist={producer} size="sm" className="mt-7" />
            <div className="mt-9 flex flex-wrap gap-3">
              {!fromCms ? (
                <Button asChild size="lg" withArrow>
                  <Link href={artistHref(producer.slug)}>Ver ficha de {producer.name}</Link>
                </Button>
              ) : null}
              <Button asChild size="lg" variant={fromCms ? "primary" : "outline"} withArrow={fromCms}>
                <Link href={site.nav.ctaHref}>{site.artists.primaryCtaLabel}</Link>
              </Button>
            </div>
          </EditorialSplit>
        </section>
      ) : null}

      <section className="relative bg-ink-1 py-section" aria-labelledby="crew-xmen">
        <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
        <div className="container-page">
          <SectionHeader kicker="02" eyebrow="Crew" title={site.artists.crewSectionTitle} lead={site.artists.crewSectionDescription} id="crew-xmen" />
          {crew.length ? (
            <ArtistsGrid artists={crew} linkToDetail={!fromCms} />
          ) : (
            <EmptyState icon={Users} title="Pronto presentaremos al crew" description="Estamos preparando las fichas de los artistas." />
          )}
        </div>
      </section>

      <HomeChannelsSection youtube={site.youtube} className="border-t border-line-1" id="artists-youtube-title" />
    </div>
  );
}
