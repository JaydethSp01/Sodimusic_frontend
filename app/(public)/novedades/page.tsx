import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { EmptyState } from "@/components/ds/empty-state";
import { HeroPage } from "@/components/ds/hero-page";
import { StatItem } from "@/components/ds/stat-item";
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
  const countLine = `${data.items.length} ${data.items.length === 1 ? "novedad" : "novedades"}${kind ? ` · ${SOCIAL_KIND_LABEL[kind]}` : ""}`;

  return (
    <div>
      <HeroPage
        eyebrow={SOCIAL_COPY.eyebrow}
        title={SOCIAL_COPY.pageTitle}
        description={SOCIAL_COPY.pageDescription}
        aside={
          overview.items.length ? (
            <StatItem value={overview.items.length} label={updated ? `Publicaciones · ${SOCIAL_COPY.updatedPrefix} ${updated}` : "Publicaciones"} orientation="left" />
          ) : undefined
        }
      />

      <SocialKindChips active={kind} totalAll={overview.items.length} end={<p className="font-mono text-label text-text-3">{countLine}</p>} />

      <section className="container-page py-12 lg:py-16" aria-label={SOCIAL_COPY.listLabel}>
        {data.items.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title={kind ? "Nada por aquí todavía" : "Pronto habrá novedades"}
            description={kind ? SOCIAL_COPY.emptyFiltered : SOCIAL_COPY.emptyAll}
            action={
              kind ? (
                <Button asChild variant="outline">
                  <a href={buildNovedadesHref()}>{SOCIAL_COPY.emptyCta}</a>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <SocialFeedGrid posts={data.items} featuredFirst />
        )}
      </section>
    </div>
  );
}
