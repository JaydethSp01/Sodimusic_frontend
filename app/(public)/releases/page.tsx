import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/shared/page-hero";
import { fetchPublic } from "@/lib/api";
import { getSiteContent } from "@/lib/site-config-server";
import { GenreTag } from "@/components/shared/genre-tag";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import type { Release } from "@/types/models";
import { CalendarDays, Sparkles } from "lucide-react";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { COVER_IMAGE_PROPS } from "@/lib/image-blur";
import { SmartLinks } from "./_components/smart-links";
import { FeaturedRelease, pickFeaturedRelease } from "./_components/featured-release";
import { formatReleaseDate, isFutureRelease, parseReleaseDate } from "./_components/release-date";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: site.releasesPage.metaTitle,
    description: site.releasesPage.metaDescription,
  };
}

export default async function ReleasesPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
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

  return (
    <div>
      <PageHero
        eyebrow={site.releasesPage.heroEyebrow}
        title={site.releasesPage.heroTitle}
        description={site.releasesPage.heroDescription}
        backgroundImageUrl={site.releasesPage.heroImageUrl}
      />
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8" aria-label="Lanzamientos">
        {headliner ? (
          <FeaturedRelease release={headliner} />
        ) : (
          <p className="rounded-lg border border-dashed border-border px-6 py-14 text-center text-[var(--text-secondary)]">
            {site.releasesPage.emptyStateMessage}
          </p>
        )}
        {rest.length ? (
          <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Más lanzamientos">
            {rest.map((r, i) => {
              const date = parseReleaseDate(r);
              const future = isFutureRelease(r);
              return (
                <li key={r.id} className="h-full">
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(255,107,0,0.1)] focus-within:border-primary/50 motion-reduce:transition-none">
                    <div className="relative aspect-square w-full overflow-hidden">
                      {r.coverUrl ? (
                        <Image
                          src={resolveMediaUrl(r.coverUrl)}
                          alt={`Portada de ${r.title} de ${r.artistName}`}
                          fill
                          priority={i < 2}
                          {...COVER_IMAGE_PROPS}
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <PlaceholderCover seed={r.artistName} className="absolute inset-0" />
                      )}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent" aria-hidden />
                      <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5">
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
                      <div className="pointer-events-none absolute bottom-2 left-2 right-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 font-mono text-xs text-white/90 backdrop-blur-sm">
                          <CalendarDays className="h-3.5 w-3.5 text-[var(--gold)]" aria-hidden />
                          {date ? (
                            <>
                              {future ? "Sale el " : ""}
                              <time dateTime={date.toISOString()}>{formatReleaseDate(date, "short")}</time>
                            </>
                          ) : (
                            <>Previsto · {r.releaseYear}</>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h2 className="font-body text-lg font-semibold leading-snug text-foreground">
                        <Link
                          href={`/releases/${r.slug}`}
                          className="after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-primary"
                        >
                          {r.title}
                        </Link>
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)]">{r.artistName}</p>
                      {r.description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">{r.description}</p>
                      ) : null}
                      <div className="mt-3">
                        <GenreTag genre={r.genre} />
                      </div>
                      <div className="relative z-10 mt-auto pt-4">
                        <SmartLinks release={r} />
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
