import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";
import { ChannelsGrid } from "@/features/channels/components/channels-grid";
import { fetchChannels } from "@/features/channels/api";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/types/site-content";

interface HomeChannelsSectionProps {
  youtube: SiteContent["youtube"];
  className?: string;
  id?: string;
}

/**
 * Sección del home: canales destacados (máx. `youtube.homeLimit`) desde
 * `/api/channels?featured=1` y botón "{allChannelsLabel} (N)" con el total
 * real de canales activos. Si no hay canales devuelve `null`.
 * Si no hay destacados suficientes, completa con los primeros canales activos.
 */
export async function HomeChannelsSection({ youtube, className, id = "youtube-title" }: HomeChannelsSectionProps) {
  const limit = Math.min(48, youtube.homeLimit > 0 ? youtube.homeLimit : 6);
  const [featured, all] = await Promise.all([
    fetchChannels({ featured: true, pageSize: limit }),
    fetchChannels({ pageSize: limit }),
  ]);
  const total = all.total;
  if (total === 0) return null;

  const seen = new Set<string>();
  const channels = [...featured.items, ...all.items]
    .filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)))
    .slice(0, limit);
  if (!channels.length) return null;

  const allLabel = `${youtube.allChannelsLabel?.trim() || "Ver todos los canales"} (${total})`;
  const showLink = total > channels.length || total > 1;

  return (
    <section className={cn("px-4 py-16 sm:py-20 lg:px-8 lg:py-32", className)} aria-labelledby={id}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle eyebrow={youtube.sectionEyebrow} title={youtube.sectionTitle} subtitle={youtube.sectionSubtitle} id={id} />
          {showLink ? (
            <Button asChild variant="outline" className="mb-12 hidden h-11 md:inline-flex">
              <Link href="/canales">
                {allLabel}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          ) : null}
        </div>
        <ChannelsGrid channels={channels} subscribeLabel={youtube.subscribeLabel} variant="home" />
        {showLink ? (
          <div className="mt-10 text-center md:hidden">
            <Button asChild variant="outline" className="h-11">
              <Link href="/canales">
                {allLabel}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
