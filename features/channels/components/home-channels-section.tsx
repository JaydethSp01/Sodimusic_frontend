import Link from "next/link";
import { SectionHeader } from "@/components/ds/section-header";
import { Button } from "@/components/ui/button";
import { ChannelsList } from "@/features/channels/components/channels-list";
import { fetchChannels } from "@/features/channels/api";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/types/site-content";

interface HomeChannelsSectionProps {
  youtube: SiteContent["youtube"];
  className?: string;
  id?: string;
}

/**
 * Sección de canales (home y /artists): destacados (máx. `youtube.homeLimit`) desde
 * `/api/channels?featured=1` como filas `ListRow` (avatar, categoría, Suscribirse rojo, Ver videos)
 * y botón "{allChannelsLabel} (N)" con el total real de canales activos. Si no hay canales devuelve `null`.
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
  const action = showLink ? (
    <Button asChild variant="outline" withArrow>
      <Link href="/canales">{allLabel}</Link>
    </Button>
  ) : undefined;

  return (
    <section className={cn("py-section", className)} aria-labelledby={id}>
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeader eyebrow={youtube.sectionEyebrow} title={youtube.sectionTitle} lead={youtube.sectionSubtitle} id={id} className="mb-0 lg:flex-col lg:items-start" action={action} />
        </div>
        <div className="lg:col-span-7">
          <ChannelsList channels={channels} subscribeLabel={youtube.subscribeLabel} />
        </div>
      </div>
    </section>
  );
}
