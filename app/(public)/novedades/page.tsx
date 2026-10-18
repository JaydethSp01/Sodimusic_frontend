import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { fetchSocialFeed, isSocialPostKind, SOCIAL_FEED_MAX } from "@/features/social/api";
import { SocialFeedGrid } from "@/features/social/components/social-feed-grid";
import { SocialKindChips } from "@/features/social/components/social-kind-chips";
import { SOCIAL_COPY, SOCIAL_KIND_LABEL } from "@/features/social/copy";
import { buildNovedadesHref } from "@/features/social/hrefs";
import { formatSocialRelative } from "@/features/social/format-date";

export const revalidate = 60;

type Search = { kind?: string };

export async function generateMetadata(): Promise<Metadata> {
  const title = SOCIAL_COPY.metaTitle;
  const description = SOCIAL_COPY.metaDescription;
  return {
    title,
    description,
    alternates: { canonical: "/novedades" },
    openGraph: { title, description },
  };
}

export default async function NovedadesPage({ searchParams }: { searchParams: Search }) {
  const kind = isSocialPostKind(searchParams.kind) ? searchParams.kind : undefined;
  const data = await fetchSocialFeed(SOCIAL_FEED_MAX, kind);
  // La chip «Todas» muestra el total sin filtrar aunque el filtro actual esté vacío.
  const overview = kind ? await fetchSocialFeed(SOCIAL_FEED_MAX) : data;
  const updated = overview.updatedAt ? formatSocialRelative(overview.updatedAt) : "";

  return (
    <div>
      <PageHero eyebrow={SOCIAL_COPY.eyebrow} title={SOCIAL_COPY.pageTitle} description={SOCIAL_COPY.pageDescription} />

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8" aria-label={SOCIAL_COPY.listLabel}>
        <div className="mb-8">
          <SocialKindChips active={kind} totalAll={overview.items.length} />
        </div>

        {data.items.length === 0 ? (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-lg border border-dashed border-border bg-background-card/50 px-6 py-14 text-center">
            <Newspaper className="h-10 w-10 text-[var(--text-muted)]" aria-hidden />
            <p className="text-[var(--text-secondary)]">{kind ? SOCIAL_COPY.emptyFiltered : SOCIAL_COPY.emptyAll}</p>
            {kind ? (
              <Button asChild variant="outline" className="h-11">
                <a href={buildNovedadesHref()}>{SOCIAL_COPY.emptyCta}</a>
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
                {data.items.length} {data.items.length === 1 ? "novedad" : "novedades"}
                {kind ? ` · ${SOCIAL_KIND_LABEL[kind]}` : ""}
              </p>
              {updated ? (
                <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
                  {SOCIAL_COPY.updatedPrefix} {updated}
                </p>
              ) : null}
            </div>
            <SocialFeedGrid posts={data.items} />
          </>
        )}
      </section>
    </div>
  );
}
