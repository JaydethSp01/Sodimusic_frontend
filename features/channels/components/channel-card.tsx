"use client";

import Image from "next/image";
import { Play, Youtube, X } from "lucide-react";
import type { YoutubeChannel } from "@/types/models";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { YoutubeLazyEmbed } from "@/components/landing/youtube-lazy-embed";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { stringToHue } from "@/lib/string-to-hue";
import { subscribeUrl } from "@/lib/youtube";
import { channelEmbedSrc } from "@/features/channels/api";
import { cn } from "@/lib/utils";

export type ChannelCardVariant = "home" | "grid";

export interface ChannelCardProps {
  channel: YoutubeChannel;
  variant?: ChannelCardVariant;
  /** Texto del botón de suscripción (`site.youtube.subscribeLabel`). */
  subscribeLabel: string;
  /** El embed está abierto en esta tarjeta (solo una a la vez en la grilla). */
  expanded?: boolean;
  /** Abre/cierra el embed. Si no se pasa, la tarjeta no ofrece "Ver videos". */
  onToggle?: () => void;
  /** Prioriza la carga del avatar (primeras tarjetas sobre el pliegue). */
  priority?: boolean;
  className?: string;
}

function ChannelAvatar({ channel, priority, className }: { channel: YoutubeChannel; priority?: boolean; className?: string }) {
  const hue = stringToHue(channel.name);
  const hue2 = (hue + 40) % 360;
  const initial = channel.name.trim().charAt(0).toUpperCase() || "?";
  const base = "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full";
  if (channel.avatarUrl?.trim()) {
    return (
      <span className={cn(base, className)}>
        <Image
          src={resolveMediaUrl(channel.avatarUrl)}
          alt=""
          fill
          priority={priority}
          quality={70}
          sizes="64px"
          className="object-cover"
        />
      </span>
    );
  }
  return (
    <span
      className={cn(base, "font-display text-2xl text-white/85", className)}
      style={{ background: `linear-gradient(135deg, hsl(${hue}, 70%, 24%) 0%, hsl(${hue2}, 50%, 10%) 100%)` }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

/**
 * Tarjeta de canal: portada 16:9 (placeholder de marca tintado o el embed al
 * expandir), avatar superpuesto, nombre, categoría, descripción truncada y
 * acciones "Suscribirse" / "Ver videos". El iframe solo se monta al expandir.
 */
export function ChannelCard({
  channel,
  variant = "grid",
  subscribeLabel,
  expanded = false,
  onToggle,
  priority = false,
  className,
}: ChannelCardProps) {
  const src = channelEmbedSrc(channel);
  const canExpand = Boolean(src && onToggle);
  const isOpen = canExpand && expanded;
  const hue = stringToHue(channel.name);
  const home = variant === "home";
  const titleId = `channel-${channel.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(255,107,0,0.1)] focus-within:border-primary/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        isOpen && "border-primary/40",
        className,
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {isOpen && src ? (
          <YoutubeLazyEmbed
            src={src}
            title={`Videos de ${channel.name} en YouTube`}
            className="h-full rounded-none border-0"
            posterStyle={{
              background: `linear-gradient(135deg, hsl(${hue}, 60%, 14%) 0%, hsl(${(hue + 40) % 360}, 45%, 6%) 100%)`,
            }}
          />
        ) : (
          <>
            <PlaceholderCover seed={channel.name} label="" className="absolute inset-0" />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              aria-hidden
            />
            {canExpand ? (
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={false}
                aria-label={`Ver videos de ${channel.name}`}
                className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 text-white shadow-[0_8px_32px_rgba(255,107,0,0.35)] transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none">
                  <Play className="ml-0.5 h-6 w-6" aria-hidden fill="currentColor" />
                </span>
              </button>
            ) : null}
            <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-black/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/85 backdrop-blur-sm">
                {channel.category}
              </span>
              {channel.featured ? (
                <span className="rounded-full bg-[var(--gold)]/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--gold)] ring-1 ring-[var(--gold)]/40 backdrop-blur-sm">
                  Destacado
                </span>
              ) : null}
            </div>
          </>
        )}
      </div>

      <div className="relative flex flex-1 flex-col px-5 pb-5">
        <div className={cn("flex items-end gap-3", isOpen ? "pt-4" : "-mt-7")}>
          <ChannelAvatar
            channel={channel}
            priority={priority}
            className={cn(
              "h-14 w-14 border-[3px] border-background-card shadow-[0_6px_20px_rgba(0,0,0,0.5)] ring-1 ring-white/10",
              home && "h-16 w-16",
            )}
          />
          {isOpen ? (
            <span className="pb-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{channel.category}</span>
          ) : null}
        </div>
        <h3 id={titleId} className={cn("display-title mt-3 text-foreground", home ? "text-2xl md:text-3xl" : "text-2xl")}>
          {channel.name}
        </h3>
        {channel.handle ? (
          <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">@{channel.handle}</p>
        ) : null}
        {channel.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">{channel.description}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          <a
            href={subscribeUrl(channel.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#ff0000] px-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#e60000] hover:shadow-[0_8px_24px_rgba(255,0,0,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            aria-label={`${subscribeLabel}: ${channel.name} en YouTube`}
          >
            <Youtube className="h-5 w-5" aria-hidden />
            {subscribeLabel}
          </a>
          {canExpand ? (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isOpen}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-md border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isOpen
                  ? "border-primary/50 text-primary hover:bg-primary/10"
                  : "border-border text-foreground hover:border-border-hover hover:bg-background-elevated",
              )}
            >
              {isOpen ? <X className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              {isOpen ? "Cerrar" : "Ver videos"}
            </button>
          ) : (
            <a
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link-underline inline-flex min-h-11 items-center px-1 text-sm text-[var(--text-secondary)] transition-colors hover:text-primary"
            >
              Ver canal
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
