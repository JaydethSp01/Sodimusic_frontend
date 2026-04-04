import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { ArtistsCrewGrid, type CrewMember } from "@/components/landing/artists-crew-grid";
import { getSiteContent } from "@/lib/site-config-server";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: "Artistas y crew",
    description: site.artists.pageHeroDescription,
  };
}

export default async function ArtistsPage() {
  const site = await getSiteContent();
  const crew = site.artists.members as CrewMember[];
  return (
    <div>
      <PageHero
        title={site.artists.pageHeroTitle}
        description={site.artists.pageHeroDescription}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24" aria-labelledby="jeivy-feature">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:items-start lg:gap-16">
          <div className="relative mx-auto w-full max-w-[300px] lg:mx-0">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-border shadow-2xl">
              <PlaceholderCover seed="JeiVy LaZy" label="JL" className="absolute inset-0" />
            </div>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">{site.artists.producerLabel}</p>
            <h2 id="jeivy-feature" className="mt-2 font-display text-6xl leading-none text-foreground md:text-7xl">
              {site.artists.producerName}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {site.artists.producerGenres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-[var(--text-secondary)]"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-[var(--text-secondary)]">{site.artists.producerBio}</p>
            <Button asChild size="lg" className="mt-8">
              <Link href={site.nav.ctaHref}>{site.artists.primaryCtaLabel}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-primary/10 bg-background-secondary/50 px-4 py-16 lg:px-8 lg:py-24" aria-labelledby="crew-xmen">
        <div className="mx-auto max-w-7xl">
          <h2
            id="crew-xmen"
            className="inline-block border-b-2 border-primary pb-2 font-display text-4xl tracking-wide text-foreground md:text-5xl"
          >
            {site.artists.crewSectionTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">{site.artists.crewSectionDescription}</p>
          <div className="mt-12">
            <ArtistsCrewGrid members={crew} />
          </div>
          <p className="mt-12 text-center">
            <Link
              href={site.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {site.artists.youtubeCtaLabel}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
