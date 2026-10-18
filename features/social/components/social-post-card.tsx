"use client";

import Image from "next/image";
import { ExternalLink, Facebook, Link2, Play, Youtube, type LucideIcon } from "lucide-react";
import type { SocialPost, SocialPostKind } from "@/types/models";
import { COVER_IMAGE_PROPS } from "@/lib/image-blur";
import { stringToHue } from "@/lib/string-to-hue";
import { parseYoutubeVideoId } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import { SOCIAL_COPY, SOCIAL_KIND_LABEL, SOCIAL_KIND_NETWORK } from "@/features/social/copy";
import { formatSocialAbsolute, formatSocialRelative } from "@/features/social/format-date";

export interface SocialPostCardProps {
  post: SocialPost;
  /** Abre el video en el diálogo (solo YOUTUBE_VIDEO). Si falta, el botón «Ver» enlaza a YouTube. */
  onWatch?: (post: SocialPost, videoId: string) => void;
  /** Prioriza la miniatura (primeras tarjetas sobre el pliegue). */
  priority?: boolean;
  className?: string;
}

const KIND_META: Record<SocialPostKind, { Icon: LucideIcon; badge: string }> = {
  YOUTUBE_VIDEO: { Icon: Youtube, badge: "bg-[#d90000] text-white" },
  FACEBOOK_POST: { Icon: Facebook, badge: "bg-[#1877f2] text-white" },
  LINK: { Icon: Link2, badge: "bg-black/70 text-white/85 ring-1 ring-white/15" },
};

/** Hosts cubiertos por `images.remotePatterns` (next.config.mjs); el resto se sirve sin optimizar. */
const OPTIMIZED_HOSTS = [/^i\.ytimg\.com$/, /^img\.youtube\.com$/, /\.fbcdn\.net$/, /\.public\.blob\.vercel-storage\.com$/];

export function isOptimizableImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && OPTIMIZED_HOSTS.some((re) => re.test(u.hostname));
  } catch {
    return false;
  }
}

export function socialVideoId(post: Pick<SocialPost, "kind" | "externalId" | "url">): string | null {
  if (post.kind !== "YOUTUBE_VIDEO") return null;
  const fromExternal = post.externalId.startsWith("yt:") ? post.externalId.slice(3) : "";
  return /^[\w-]{11}$/.test(fromExternal) ? fromExternal : parseYoutubeVideoId(post.url);
}

/**
 * Tarjeta de novedad: miniatura 16:9 (o placeholder con el icono de la red),
 * badge de red, título (2 líneas), autor · fecha relativa y acción «Ver»
 * (YouTube → diálogo con embed) o «Abrir» (enlace externo en pestaña nueva).
 */
export function SocialPostCard({ post, onWatch, priority = false, className }: SocialPostCardProps) {
  const meta = KIND_META[post.kind] ?? KIND_META.LINK;
  const Icon = meta.Icon;
  const videoId = socialVideoId(post);
  const canWatch = Boolean(videoId && onWatch);
  const titleId = `social-${post.id}-title`;
  const hue = stringToHue(post.author?.trim() || post.title);
  const image = post.imageUrl?.trim() ? post.imageUrl.trim() : null;
  const relative = formatSocialRelative(post.publishedAt);
  const absolute = formatSocialAbsolute(post.publishedAt);
  const network = SOCIAL_KIND_NETWORK[post.kind] ?? SOCIAL_KIND_NETWORK.LINK;
  const externalLabel = `${SOCIAL_COPY.open} en ${network}: ${post.title}`;

  const thumbnail = image ? (
    <Image
      src={image}
      alt=""
      fill
      priority={priority}
      unoptimized={!isOptimizableImageUrl(image)}
      {...COVER_IMAGE_PROPS}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
    />
  ) : (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, hsl(${hue}, 45%, 16%) 0%, hsl(${(hue + 40) % 360}, 35%, 7%) 100%)` }}
      aria-hidden
    >
      <Icon className="h-12 w-12 text-white/25" strokeWidth={1.5} />
    </div>
  );

  const overlay = (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" aria-hidden />
      {canWatch ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 text-white shadow-[0_8px_32px_rgba(255,107,0,0.35)] transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none">
            <Play className="ml-0.5 h-6 w-6" aria-hidden fill="currentColor" />
          </span>
        </span>
      ) : null}
    </>
  );

  return (
    <article
      aria-labelledby={titleId}
      data-kind={post.kind}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(255,107,0,0.1)] focus-within:border-primary/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {canWatch && videoId ? (
          <button
            type="button"
            onClick={() => onWatch?.(post, videoId)}
            aria-label={`${SOCIAL_COPY.watch} en YouTube: ${post.title}`}
            className="absolute inset-0 block h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          >
            {thumbnail}
            {overlay}
          </button>
        ) : (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden
            className="absolute inset-0 block h-full w-full focus-visible:outline-none"
          >
            {thumbnail}
            {overlay}
          </a>
        )}
        <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm",
              meta.badge,
            )}
          >
            <Icon className="h-3 w-3" aria-hidden />
            {SOCIAL_KIND_LABEL[post.kind] ?? SOCIAL_KIND_LABEL.LINK}
          </span>
          {post.pinned ? (
            <span className="rounded-full bg-[var(--gold)]/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--gold)] ring-1 ring-[var(--gold)]/40 backdrop-blur-sm">
              {SOCIAL_COPY.pinned}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 id={titleId} className="line-clamp-2 text-lg font-semibold leading-snug text-foreground">
          {post.title}
        </h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
          {post.author?.trim() ? (
            <>
              <span className="truncate">{post.author}</span>
              <span aria-hidden>·</span>
            </>
          ) : null}
          {relative ? (
            <time dateTime={post.publishedAt} title={absolute}>
              {relative}
            </time>
          ) : null}
        </p>
        {post.text?.trim() ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">{post.text}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          {canWatch && videoId ? (
            <button
              type="button"
              onClick={() => onWatch?.(post, videoId)}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#d90000] px-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#ff0000] hover:shadow-[0_8px_24px_rgba(217,0,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <Play className="h-4 w-4" aria-hidden fill="currentColor" />
              {SOCIAL_COPY.watch}
            </button>
          ) : (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={externalLabel}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm text-foreground transition-colors hover:border-border-hover hover:bg-background-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              {SOCIAL_COPY.open}
            </a>
          )}
          {canWatch ? (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir en YouTube: ${post.title}`}
              className="nav-link-underline inline-flex min-h-11 items-center rounded-md px-1 text-sm text-[var(--text-secondary)] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              YouTube
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
