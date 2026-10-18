"use client";

import { ExternalLink, Facebook, Link2, Play, Youtube, type LucideIcon } from "lucide-react";
import type { SocialPost, SocialPostKind } from "@/types/models";
import { MediaFrame } from "@/components/ds/media-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
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
  /** `card` (grilla 16/9) o `featured` (destacada: imagen 7 col + texto 5 col en escritorio). */
  variant?: "card" | "featured";
  className?: string;
}

const KIND_META: Record<SocialPostKind, { Icon: LucideIcon; badge: string }> = {
  YOUTUBE_VIDEO: { Icon: Youtube, badge: "border-transparent bg-[#d90000] text-text-1" },
  FACEBOOK_POST: { Icon: Facebook, badge: "border-transparent bg-[#1877f2] text-text-1" },
  LINK: { Icon: Link2, badge: "" },
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
 * Tarjeta de novedad: miniatura 16/9 en `MediaFrame` (duotono que el hover revela), badge de red,
 * título, autor · fecha relativa en mono y acción «Ver» (YouTube → diálogo con embed) o «Abrir»
 * (enlace externo). La miniatura entera es el botón «Ver en YouTube: …» (e2e).
 */
export function SocialPostCard({ post, onWatch, priority = false, variant = "card", className }: SocialPostCardProps) {
  const meta = KIND_META[post.kind] ?? KIND_META.LINK;
  const Icon = meta.Icon;
  const videoId = socialVideoId(post);
  const canWatch = Boolean(videoId && onWatch);
  const titleId = `social-${post.id}-title`;
  const image = post.imageUrl?.trim() ? post.imageUrl.trim() : null;
  const relative = formatSocialRelative(post.publishedAt);
  const absolute = formatSocialAbsolute(post.publishedAt);
  const network = SOCIAL_KIND_NETWORK[post.kind] ?? SOCIAL_KIND_NETWORK.LINK;
  const externalLabel = `${SOCIAL_COPY.open} en ${network}: ${post.title}`;
  const featured = variant === "featured";

  const playGlyph = canWatch ? (
    <span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-text-1 backdrop-blur-sm transition-[background-color,color] duration-150 group-hover:bg-fire-500 group-hover:text-fire-on"
    >
      <Play className="ml-0.5 h-6 w-6" fill="currentColor" strokeWidth={0} />
    </span>
  ) : null;

  const media = (
    <MediaFrame
      src={image}
      alt=""
      aspect="16/9"
      priority={priority}
      sizes={featured ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
      fallbackSeed={post.author?.trim() || post.title}
      fallbackLabel={SOCIAL_KIND_LABEL[post.kind] ?? SOCIAL_KIND_LABEL.LINK}
      zoom
      badges={
        <>
          <Badge icon={<Icon aria-hidden />} tone="neutral" className={cn("backdrop-blur-sm", meta.badge || "bg-ink-0/70")}>
            {SOCIAL_KIND_LABEL[post.kind] ?? SOCIAL_KIND_LABEL.LINK}
          </Badge>
          {post.pinned ? <Badge tone="gold">{SOCIAL_COPY.pinned}</Badge> : null}
        </>
      }
    >
      {canWatch && videoId ? (
        <button
          type="button"
          onClick={() => onWatch?.(post, videoId)}
          aria-label={`${SOCIAL_COPY.watch} en YouTube: ${post.title}`}
          className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fire-500"
        />
      ) : (
        <a href={post.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden className="absolute inset-0 z-10" />
      )}
      {playGlyph}
    </MediaFrame>
  );

  const body = (
    <div className={cn("flex min-w-0 flex-1 flex-col", featured ? "lg:justify-center" : "pt-4")}>
      {featured ? <Badge tone="fire" className="mb-4 self-start">Destacada</Badge> : null}
      <Heading as="h3" id={titleId} size={featured ? "display-sm" : "title"} balance={false} className={cn(!featured && "line-clamp-2")}>
        {post.title}
      </Heading>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 font-mono text-label text-text-3">
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
        <Text size={featured ? "body" : "body-sm"} tone="2" className={cn("mt-3", featured ? "line-clamp-3" : "line-clamp-2")}>
          {post.text}
        </Text>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        {canWatch && videoId ? (
          <Button type="button" size="sm" onClick={() => onWatch?.(post, videoId)}>
            <Play fill="currentColor" strokeWidth={0} aria-hidden />
            {SOCIAL_COPY.watch}
          </Button>
        ) : (
          <Button asChild variant="outline" size="sm">
            <a href={post.url} target="_blank" rel="noopener noreferrer" aria-label={externalLabel}>
              <ExternalLink aria-hidden />
              {SOCIAL_COPY.open}
            </a>
          </Button>
        )}
        {canWatch ? (
          <Button asChild variant="link" size="sm">
            <a href={post.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir en YouTube: ${post.title}`}>
              YouTube
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );

  return (
    <article
      aria-labelledby={titleId}
      data-kind={post.kind}
      className={cn("group relative flex h-full", featured ? "flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-12" : "flex-col", className)}
    >
      {featured ? <div className="lg:col-span-7">{media}</div> : media}
      {featured ? <div className="flex lg:col-span-5">{body}</div> : body}
    </article>
  );
}
