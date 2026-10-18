import Link from "next/link";
import { SectionHeader } from "@/components/ds/section-header";
import { Button } from "@/components/ui/button";
import { HomeFadeSection } from "@/components/landing/home-page-motion";
import { HomeNewsList } from "@/components/landing/home-news-list";
import { fetchSocialFeed } from "@/features/social/api";
import { SOCIAL_COPY } from "@/features/social/copy";
import { cn } from "@/lib/utils";

interface HomeNewsSectionProps {
  className?: string;
  id?: string;
  /** Máximo de publicaciones (1 destacada + el resto en lista; por defecto 5). */
  limit?: number;
}

/**
 * Sección del home: últimas novedades del feed social (`/api/social/feed`) como 1 destacada + lista.
 * Server component; devuelve `null` si no hay publicaciones (o la API no responde).
 */
export async function HomeNewsSection({ className, id = "news-title", limit = 5 }: HomeNewsSectionProps) {
  const { items } = await fetchSocialFeed(limit);
  if (!items.length) return null;

  const cta = (
    <Button asChild variant="outline" withArrow>
      <Link href="/novedades">{SOCIAL_COPY.homeAllLabel}</Link>
    </Button>
  );

  return (
    <HomeFadeSection className={cn("py-section", className)} aria-labelledby={id}>
      <div className="container-page">
        <SectionHeader
          eyebrow={SOCIAL_COPY.eyebrow}
          title={SOCIAL_COPY.homeTitle}
          accent="último"
          lead={SOCIAL_COPY.homeSubtitle}
          id={id}
          action={<div className="hidden md:block">{cta}</div>}
        />
        <HomeNewsList posts={items} />
        <div className="mt-10 text-center md:hidden">{cta}</div>
      </div>
    </HomeFadeSection>
  );
}
