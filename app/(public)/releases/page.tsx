import type { Metadata } from "next";
import { Disc3 } from "lucide-react";
import { EmptyState } from "@/components/ds/empty-state";
import { HeroPage } from "@/components/ds/hero-page";
import { MediaCard } from "@/components/ds/media-card";
import { SectionHeader } from "@/components/ds/section-header";
import { StatItem } from "@/components/ds/stat-item";
import { Badge } from "@/components/ui/badge";
import { fetchPublic } from "@/lib/api";
import { getSiteContent } from "@/lib/site-config-server";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type { Release } from "@/types/models";
import { SmartLinks } from "./_components/smart-links";
import { FeaturedRelease, pickFeaturedRelease } from "./_components/featured-release";
import { ReleaseCountdown } from "./_components/release-countdown";
import { formatReleaseDate, isFutureRelease, parseReleaseDate } from "./_components/release-date";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: site.releasesPage.metaTitle,
    description: site.releasesPage.metaDescription,
  };
}

export default async function ReleasesPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const params = new URLSearchParams();
  if (searchParams.genre) {
    params.set("genre", searchParams.genre);
  }
  if (searchParams.year) {
    params.set("year", searchParams.year);
  }
  if (searchParams.featured === "1") {
    params.set("featured", "1");
  }
  const site = await getSiteContent();
  const res = await fetchPublic(`/api/releases?${params.toString()}`);
  const data = res.ok ? ((await res.json()) as { items: Release[] }) : { items: [] as Release[] };
  const headliner = pickFeaturedRelease(data.items);
  const rest = headliner ? data.items.filter((r) => r.id !== headliner.id) : data.items;
  const upcomingCount = data.items.filter((r) => isFutureRelease(r)).length;

  return (
    <div>
      <HeroPage
        eyebrow={site.releasesPage.heroEyebrow}
        title={site.releasesPage.heroTitle}
        description={site.releasesPage.heroDescription}
        backgroundImageUrl={site.releasesPage.heroImageUrl}
        aside={
          data.items.length ? (
            <div className="grid grid-cols-2 gap-6 lg:flex lg:flex-col lg:items-start lg:gap-4">
              <StatItem value={data.items.length} label={data.items.length === 1 ? "Lanzamiento" : "Lanzamientos"} orientation="left" />
              <StatItem value={upcomingCount} label={upcomingCount === 1 ? "Próximo" : "Próximos"} orientation="left" />
            </div>
          ) : undefined
        }
      />
      <section className="container-page py-section" aria-label="Lanzamientos">
        {headliner ? (
          <FeaturedRelease release={headliner} />
        ) : (
          <EmptyState icon={Disc3} title="Pronto, nuevos lanzamientos" description={site.releasesPage.emptyStateMessage} />
        )}
        {rest.length ? (
          <div className="mt-16 border-t border-line-1 pt-12 lg:mt-24 lg:pt-16">
            <SectionHeader kicker="02" eyebrow="Catálogo" title="Más lanzamientos" id="more-releases-title" />
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5" aria-label="Más lanzamientos">
              {rest.map((r, i) => {
                const date = parseReleaseDate(r);
                const future = isFutureRelease(r);
                return (
                  <li key={r.id} className="h-full">
                    <MediaCard
                      as="article"
                      layout="overlay"
                      aspect="1/1"
                      titleAs="h2"
                      href={`/releases/${r.slug}`}
                      src={r.coverUrl ? resolveMediaUrl(r.coverUrl) : null}
                      alt={r.coverUrl ? `Portada de ${r.title} de ${r.artistName}` : ""}
                      fallbackSeed={r.artistName}
                      priority={i < 2}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      badges={
                        <>
                          {future ? (
                            <Badge tone="gold" variant="solid">
                              Próximo
                            </Badge>
                          ) : null}
                          {r.featured ? <Badge tone="fire">Destacado</Badge> : null}
                        </>
                      }
                      title={r.title}
                      meta={
                        <span className="font-mono text-label text-text-2">
                          {date ? (
                            <>
                              {future ? "Sale el " : ""}
                              <time dateTime={date.toISOString()}>{formatReleaseDate(date, "short")}</time>
                            </>
                          ) : (
                            <>Previsto · {r.releaseYear}</>
                          )}
                        </span>
                      }
                      description={
                        <>
                          {r.artistName}
                          {future && r.releaseDate ? <ReleaseCountdown target={r.releaseDate} variant="compact" className="mt-1" /> : null}
                        </>
                      }
                      action={
                        <SmartLinks
                          release={r}
                          size="sm"
                          iconOnly
                          className="transition-opacity duration-200 lg:opacity-0 lg:focus-within:opacity-100 lg:group-hover:opacity-100"
                        />
                      }
                      className="h-full"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
