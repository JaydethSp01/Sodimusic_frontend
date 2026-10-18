import Link from "next/link";
import { SectionHeader } from "@/components/ds/section-header";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { HomeFadeSection } from "@/components/landing/home-page-motion";
import { HomeNewsList } from "@/components/landing/home-news-list";
import { HomeProductionsBento } from "@/components/landing/home-productions-bento";
import { cn } from "@/lib/utils";
import type { Production, SocialPost } from "@/types/models";
import type { SiteHomeLatest } from "@/types/site-content";

interface HomeLatestSectionProps {
  latest: SiteHomeLatest;
  /** Publicaciones del feed social (vacío si `source` = "productions"). */
  posts: SocialPost[];
  /** Producciones destacadas (vacío si `source` = "feed"). */
  productions: Production[];
  id?: string;
  className?: string;
}

/**
 * Sección única «Lo último» de la portada (sustituye a «Últimas producciones» + «Novedades»).
 * - `source: "feed"`: 1 destacada del feed + lista (`HomeNewsList`).
 * - `source: "productions"`: bento de producciones destacadas.
 * - `source: "both"`: destacada del feed + bento debajo.
 * Dos CTAs (`ctaLabel` / `secondaryCtaLabel`). Siempre se renderiza; sin datos muestra un aviso.
 */
export function HomeLatestSection({ latest, posts, productions, id = "latest-title", className }: HomeLatestSectionProps) {
  const useFeed = latest.source !== "productions";
  const useProductions = latest.source !== "feed";
  const feedPosts = useFeed ? (latest.source === "both" ? posts.slice(0, 1) : posts.slice(0, latest.limit)) : [];
  const bento = useProductions ? productions.slice(0, latest.source === "both" ? 3 : latest.limit) : [];
  const empty = !feedPosts.length && !bento.length;

  const primary = latest.ctaLabel.trim() ? (
    <Button asChild variant="outline" withArrow>
      <Link href={latest.ctaHref || "/productions"}>{latest.ctaLabel}</Link>
    </Button>
  ) : null;
  const secondary = latest.secondaryCtaLabel.trim() ? (
    <Button asChild variant="ghost" withArrow>
      <Link href={latest.secondaryCtaHref || "/novedades"}>{latest.secondaryCtaLabel}</Link>
    </Button>
  ) : null;
  const actions =
    primary || secondary ? (
      <span className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {primary}
        {secondary}
      </span>
    ) : null;

  return (
    <HomeFadeSection className={cn("py-section", className)} aria-labelledby={id}>
      <div className="container-page">
        <SectionHeader
          eyebrow={latest.eyebrow || undefined}
          title={latest.title}
          accent="último"
          lead={latest.subtitle || undefined}
          id={id}
          action={actions ? <div className="hidden md:block">{actions}</div> : undefined}
        />
        {empty ? (
          <Text tone="3" className="rounded-lg border border-dashed border-line-2 px-6 py-12 text-center">
            Pronto verás aquí lo último del sello.
          </Text>
        ) : (
          <div className="space-y-12">
            {feedPosts.length ? <HomeNewsList posts={feedPosts} /> : null}
            {bento.length ? <HomeProductionsBento productions={bento} priority={!feedPosts.length} /> : null}
          </div>
        )}
        {actions ? <div className="mt-10 flex justify-center md:hidden">{actions}</div> : null}
      </div>
    </HomeFadeSection>
  );
}
