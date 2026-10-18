import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";
import { fetchSocialFeed } from "@/features/social/api";
import { SocialFeedGrid } from "@/features/social/components/social-feed-grid";
import { SOCIAL_COPY } from "@/features/social/copy";
import { cn } from "@/lib/utils";

interface HomeNewsSectionProps {
  className?: string;
  id?: string;
  /** Máximo de tarjetas (por defecto 6). */
  limit?: number;
}

/**
 * Sección del home: últimas novedades del feed social (`/api/social/feed`).
 * Server component; devuelve `null` si no hay publicaciones (o la API no responde).
 */
export async function HomeNewsSection({ className, id = "news-title", limit = 6 }: HomeNewsSectionProps) {
  const { items } = await fetchSocialFeed(limit);
  if (!items.length) return null;

  const cta = (
    <Link href="/novedades">
      {SOCIAL_COPY.homeAllLabel}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );

  return (
    <section className={cn("px-4 py-16 sm:py-20 lg:px-8 lg:py-32", className)} aria-labelledby={id}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle eyebrow={SOCIAL_COPY.eyebrow} title={SOCIAL_COPY.homeTitle} subtitle={SOCIAL_COPY.homeSubtitle} id={id} />
          <Button asChild variant="outline" className="mb-12 hidden h-11 md:inline-flex">
            {cta}
          </Button>
        </div>
        <SocialFeedGrid posts={items} />
        <div className="mt-10 text-center md:hidden">
          <Button asChild variant="outline" className="h-11">
            {cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
