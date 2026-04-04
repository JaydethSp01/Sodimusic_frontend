import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/shared/page-hero";
import { fetchPublic } from "@/lib/api";
import { getSiteContent } from "@/lib/site-config-server";
import { GenreTag } from "@/components/shared/genre-tag";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import type { Release } from "@/types/models";
import { Music2, Sparkles, Youtube } from "lucide-react";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

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

  return (
    <div>
      <PageHero
        eyebrow={site.releasesPage.heroEyebrow}
        title={site.releasesPage.heroTitle}
        description={site.releasesPage.heroDescription}
        backgroundImageUrl={site.releasesPage.heroImageUrl}
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-12 lg:grid-cols-2 lg:px-8">
        {data.items.length === 0 ? (
          <p className="col-span-full text-center text-[var(--text-secondary)]">{site.releasesPage.emptyStateMessage}</p>
        ) : null}
        {data.items.map((r) => (
          <article
            key={r.id}
            className="flex flex-col overflow-hidden rounded-lg border border-border bg-background-card transition-colors hover:border-primary/25 md:flex-row"
          >
            <Link
              href={`/releases/${r.slug}`}
              className="relative block aspect-square w-full shrink-0 md:w-44 lg:w-52"
            >
              {r.coverUrl ? (
                <Image
                  src={resolveMediaUrl(r.coverUrl)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 200px"
                />
              ) : (
                <PlaceholderCover seed={r.artistName} className="h-full w-full" />
              )}
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--gold)] backdrop-blur-sm">
                <Sparkles className="h-3 w-3" aria-hidden />
                Adelanto
              </span>
            </Link>
            <div className="flex flex-1 flex-col p-4">
              <Link href={`/releases/${r.slug}`} className="group">
                <h2 className="font-body text-lg font-semibold text-foreground group-hover:text-primary">{r.title}</h2>
              </Link>
              <p className="text-sm text-[var(--text-secondary)]">{r.artistName}</p>
              {r.description ? (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--text-muted)]">{r.description}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-[var(--text-muted)]">Previsto · {r.releaseYear}</span>
                <GenreTag genre={r.genre} />
              </div>
              <div className="mt-auto flex gap-3 pt-4">
                {r.youtubeUrl ? (
                  <a
                    href={r.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-primary"
                    aria-label={`Ver adelanto en YouTube: ${r.title}`}
                  >
                    <Youtube className="h-5 w-5 shrink-0" />
                    Ver adelanto
                  </a>
                ) : null}
                {r.spotifyUrl ? (
                  <a
                    href={r.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-secondary)] hover:text-primary"
                    aria-label={`Spotify ${r.title}`}
                  >
                    <Music2 className="h-5 w-5" />
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
