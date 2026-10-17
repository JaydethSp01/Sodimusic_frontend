import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Youtube } from "lucide-react";
import { SectionTitle } from "@/components/shared/section-title";
import { HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { YoutubeLazyEmbed } from "@/components/landing/youtube-lazy-embed";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { stringToHue } from "@/lib/string-to-hue";
import { parseYoutubeChannelId, parseYoutubeVideoId, subscribeUrl, uploadsPlaylistEmbedUrl, videoEmbedUrl } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import type { SiteContent, SiteYoutubeChannel } from "@/types/site-content";

function channelEmbedSrc(ch: SiteYoutubeChannel): string | null {
  const videoId = ch.featuredVideoUrl?.trim() ? parseYoutubeVideoId(ch.featuredVideoUrl) : null;
  if (videoId) {
    return videoEmbedUrl(videoId);
  }
  const channelId = ch.channelId?.trim() || parseYoutubeChannelId(ch.url);
  return channelId ? uploadsPlaylistEmbedUrl(channelId) : null;
}

function ChannelAvatar({ channel }: { channel: SiteYoutubeChannel }) {
  const hue = stringToHue(channel.name);
  const hue2 = (hue + 40) % 360;
  const initial = channel.name.trim().charAt(0).toUpperCase() || "?";
  if (channel.avatarUrl?.trim()) {
    return (
      <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10">
        <Image
          src={resolveMediaUrl(channel.avatarUrl)}
          alt={`Avatar del canal ${channel.name}`}
          fill
          quality={70}
          className="object-cover"
          sizes="56px"
        />
      </span>
    );
  }
  return (
    <span
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 font-display text-2xl text-white/80"
      style={{ background: `linear-gradient(135deg, hsl(${hue}, 70%, 22%) 0%, hsl(${hue2}, 50%, 10%) 100%)` }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

interface YoutubeChannelsSectionProps {
  youtube: SiteContent["youtube"];
  /**
   * Canales a mostrar. Si no se pasan, se usan `youtube.channels` (datos antiguos del SiteConfig).
   * El home solo muestra `youtube.homeLimit`; `/canales` muestra todos.
   */
  channels?: SiteYoutubeChannel[];
  /** Total real de canales (para "Ver todos los canales (N)"); por defecto la longitud de la lista. */
  totalCount?: number;
  /** Límite de tarjetas; por defecto `youtube.homeLimit`. `0` = sin límite. */
  limit?: number;
  /** Mostrar enlace a `/canales` cuando hay más canales de los mostrados (o siempre si `true`). */
  showAllLink?: boolean | "auto";
  /** Texto alternativo del enlace al canal (p. ej. `artists.youtubeCtaLabel`) */
  linkLabel?: string;
  className?: string;
  id?: string;
}

export function YoutubeChannelsSection({
  youtube,
  channels: channelsProp,
  totalCount,
  limit,
  showAllLink = true,
  linkLabel,
  className,
  id = "youtube-title",
}: YoutubeChannelsSectionProps) {
  const all = (channelsProp ?? youtube.channels).filter((c) => c.name?.trim() && c.url?.trim());
  if (!all.length) {
    return null;
  }
  const max = limit ?? (youtube.homeLimit > 0 ? youtube.homeLimit : 6);
  const channels = max > 0 ? all.slice(0, max) : all;
  const total = totalCount ?? all.length;
  const single = channels.length === 1;
  const showLink = showAllLink === true || (showAllLink === "auto" && total > channels.length);
  const allLabel = `${youtube.allChannelsLabel?.trim() || "Ver todos los canales"} (${total})`;

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
        <HomeStagger className={cn("grid gap-6", single ? "mx-auto max-w-3xl" : "md:grid-cols-2", channels.length > 2 && "xl:grid-cols-3")}>
          {channels.map((ch) => {
            const src = channelEmbedSrc(ch);
            const hue = stringToHue(ch.name);
            return (
              <HomeStaggerItem key={`${ch.name}-${ch.url}`} className="h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background-card transition-colors duration-300 hover:border-primary/40">
                  <div className="flex items-start gap-4 p-5">
                    <ChannelAvatar channel={ch} />
                    <div className="min-w-0 flex-1">
                      <h3 className="display-title text-2xl text-foreground md:text-3xl">{ch.name}</h3>
                      {ch.description ? (
                        <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{ch.description}</p>
                      ) : null}
                    </div>
                  </div>
                  {src ? (
                    <div className="px-5">
                      <YoutubeLazyEmbed
                        src={src}
                        title={`Videos de ${ch.name} en YouTube`}
                        posterStyle={{
                          background: `linear-gradient(135deg, hsl(${hue}, 60%, 14%) 0%, hsl(${(hue + 40) % 360}, 45%, 6%) 100%)`,
                        }}
                      />
                    </div>
                  ) : null}
                  <div className="mt-auto flex flex-wrap items-center gap-3 p-5">
                    <a
                      href={subscribeUrl(ch.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#ff0000] px-5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#e60000] hover:shadow-[0_8px_24px_rgba(255,0,0,0.25)]"
                      aria-label={`${youtube.subscribeLabel}: ${ch.name} en YouTube`}
                    >
                      <Youtube className="h-5 w-5" aria-hidden />
                      {youtube.subscribeLabel}
                    </a>
                    <a
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nav-link-underline inline-flex min-h-11 items-center text-sm text-[var(--text-secondary)] transition-colors hover:text-primary"
                    >
                      {linkLabel?.trim() || "Ver canal"}
                    </a>
                  </div>
                </article>
              </HomeStaggerItem>
            );
          })}
        </HomeStagger>
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
