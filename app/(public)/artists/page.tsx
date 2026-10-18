import type { Metadata } from "next";
import Link from "next/link";
import { EditorialSplit } from "@/components/ds/editorial-split";
import { EmptyState } from "@/components/ds/empty-state";
import { HeroPage } from "@/components/ds/hero-page";
import { MediaFrame } from "@/components/ds/media-frame";
import { SectionHeader } from "@/components/ds/section-header";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { GenreTag } from "@/components/shared/genre-tag";
import { ArtistsCrewGrid } from "@/components/landing/artists-crew-grid";
import { HomeChannelsSection } from "@/features/channels/components/home-channels-section";
import { Users } from "lucide-react";
import { getSiteContent } from "@/lib/site-config-server";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: "Artistas y crew",
    description: site.artists.pageHeroDescription,
  };
}

export default async function ArtistsPage() {
  const site = await getSiteContent();
  const crew = site.artists.members;
  const producerImage = site.artists.producerImageUrl?.trim();

  return (
    <div>
      <HeroPage eyebrow="Artistas" title={site.artists.pageHeroTitle} description={site.artists.pageHeroDescription} />

      {/* Productor principal: EditorialSplit invertido, nombre display-lg solapando la foto 3/4 en escritorio. */}
      <section className="container-page py-section" aria-labelledby="jeivy-feature">
        <EditorialSplit
          reverse
          overflow={false}
          className="max-lg:flex max-lg:flex-col-reverse"
          media={
            <MediaFrame
              src={producerImage ? resolveMediaUrl(producerImage) : null}
              alt={producerImage ? `Foto de ${site.artists.producerName}` : ""}
              aspect="3/4"
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              fallbackSeed={site.artists.producerName}
              fallbackLabel={site.artists.producerName}
              className="shadow-card"
            />
          }
        >
          <Eyebrow>{site.artists.producerLabel}</Eyebrow>
          <Heading as="h2" size="display-lg" id="jeivy-feature" className="relative z-10 mt-4 lg:-ml-[22%]">
            {site.artists.producerName}
          </Heading>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Géneros">
            {site.artists.producerGenres.map((g) => (
              <li key={g}>
                <GenreTag genre={g} />
              </li>
            ))}
          </ul>
          <Text size="body-lg" tone="2" prose className="mt-7">
            {site.artists.producerBio}
          </Text>
          <Button asChild size="lg" withArrow className="mt-9">
            <Link href={site.nav.ctaHref}>{site.artists.primaryCtaLabel}</Link>
          </Button>
        </EditorialSplit>
      </section>

      {/* Crew */}
      <section className="relative bg-ink-1 py-section" aria-labelledby="crew-xmen">
        <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
        <div className="container-page">
          <SectionHeader kicker="02" eyebrow="Crew" title={site.artists.crewSectionTitle} lead={site.artists.crewSectionDescription} id="crew-xmen" />
          {crew.length ? (
            <ArtistsCrewGrid members={crew} />
          ) : (
            <EmptyState icon={Users} title="Pronto presentaremos al crew" description="Estamos preparando las fichas de los artistas." />
          )}
        </div>
      </section>

      <HomeChannelsSection youtube={site.youtube} className="border-t border-line-1" id="artists-youtube-title" />
    </div>
  );
}
