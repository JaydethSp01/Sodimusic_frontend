import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { ArtistsCrewGrid } from "@/components/landing/artists-crew-grid";
import { HomeChannelsSection } from "@/features/channels/components/home-channels-section";
import { getSiteContent } from "@/lib/site-config-server";
import { genreColor } from "@/lib/genre-colors";
import { COVER_IMAGE_PROPS } from "@/lib/image-blur";
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
      <PageHero eyebrow="Artistas" title={site.artists.pageHeroTitle} description={site.artists.pageHeroDescription} />

      {/* Productor principal */}
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-28" aria-labelledby="jeivy-feature">
        <div className="grid gap-10 lg:grid-cols-[360px_1fr] lg:items-center lg:gap-20">
          <div className="relative mx-auto w-full max-w-[360px] lg:mx-0">
            <div className="pointer-events-none absolute -inset-3 rounded-lg border border-primary/15" aria-hidden />
            <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" aria-hidden />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-border bg-background-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
              {producerImage ? (
                <Image
                  src={resolveMediaUrl(producerImage)}
                  alt={`Foto de ${site.artists.producerName}`}
                  fill
                  priority
                  {...COVER_IMAGE_PROPS}
                  className="object-cover"
                  sizes="(max-width: 1024px) 360px, 360px"
                />
              ) : (
                <PlaceholderCover seed={site.artists.producerName} label={site.artists.producerName} className="absolute inset-0" />
              )}
            </div>
          </div>
          <div>
            <p className="eyebrow">{site.artists.producerLabel}</p>
            <h2 id="jeivy-feature" className="display-title mt-4 text-6xl text-foreground sm:text-7xl md:text-8xl">
              {site.artists.producerName}
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Géneros">
              {site.artists.producerGenres.map((g) => {
                const c = genreColor(g);
                return (
                  <li
                    key={g}
                    className="rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider"
                    style={{ color: c.fg, borderColor: c.border, background: c.bg }}
                  >
                    {g}
                  </li>
                );
              })}
            </ul>
            <p className="mt-7 max-w-prose text-lg leading-relaxed text-[var(--text-secondary)]">{site.artists.producerBio}</p>
            <Button asChild className="mt-9 h-12 px-8 text-base font-semibold">
              <Link href={site.nav.ctaHref}>
                {site.artists.primaryCtaLabel}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Crew */}
      <section className="relative px-4 py-16 lg:px-8 lg:py-28" aria-labelledby="crew-xmen">
        <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Crew" title={site.artists.crewSectionTitle} subtitle={site.artists.crewSectionDescription} id="crew-xmen" />
          {crew.length ? (
            <ArtistsCrewGrid members={crew} />
          ) : (
            <p className="rounded-lg border border-dashed border-border px-6 py-12 text-center text-[var(--text-secondary)]">
              Pronto presentaremos al crew.
            </p>
          )}
        </div>
      </section>

      <HomeChannelsSection youtube={site.youtube} className="border-t border-border" id="artists-youtube-title" />
    </div>
  );
}
