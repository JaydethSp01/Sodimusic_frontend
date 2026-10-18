"use client";

import { useState } from "react";
import { ExternalLink, Facebook, Link2, Play, Youtube, type LucideIcon } from "lucide-react";
import { ListRow } from "@/components/ds/list-row";
import { MediaFrame } from "@/components/ds/media-frame";
import { PlayButton } from "@/components/ds/play-button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { IconButton } from "@/components/ui/icon-button";
import { Text } from "@/components/ui/text";
import { HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { isOptimizableImageUrl, socialVideoId } from "@/features/social/components/social-post-card";
import { SocialVideoDialog } from "@/features/social/components/social-video-dialog";
import { SOCIAL_COPY, SOCIAL_KIND_LABEL, SOCIAL_KIND_NETWORK } from "@/features/social/copy";
import { formatSocialAbsolute, formatSocialRelative } from "@/features/social/format-date";
import type { SocialPost, SocialPostKind } from "@/types/models";

const KIND: Record<SocialPostKind, { Icon: LucideIcon; tone: BadgeTone }> = {
  YOUTUBE_VIDEO: { Icon: Youtube, tone: "danger" },
  FACEBOOK_POST: { Icon: Facebook, tone: "sea" },
  LINK: { Icon: Link2, tone: "neutral" },
};

type Video = { videoId: string; title: string; author: string | null };

function kindBadge(post: SocialPost) {
  const k = KIND[post.kind] ?? KIND.LINK;
  return (
    <Badge tone={k.tone} icon={<k.Icon />}>
      {SOCIAL_KIND_LABEL[post.kind] ?? SOCIAL_KIND_LABEL.LINK}
    </Badge>
  );
}

function dateNode(post: SocialPost) {
  const relative = formatSocialRelative(post.publishedAt);
  return relative ? (
    <time dateTime={post.publishedAt} title={formatSocialAbsolute(post.publishedAt)}>
      {relative}
    </time>
  ) : null;
}

/**
 * Novedades de la home: 1 destacada horizontal (imagen 16/9 + título display-sm) y hasta 4 `ListRow`.
 * Un solo `SocialVideoDialog` para toda la sección (nunca más de un iframe de YouTube montado).
 */
export function HomeNewsList({ posts }: { posts: SocialPost[] }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [featured, ...rest] = posts;
  if (!featured) return null;

  const featuredVideo = socialVideoId(featured);
  const featuredImage = featured.imageUrl?.trim() || null;
  const network = SOCIAL_KIND_NETWORK[featured.kind] ?? SOCIAL_KIND_NETWORK.LINK;
  const openFeatured = featuredVideo ? () => setVideo({ videoId: featuredVideo, title: featured.title, author: featured.author }) : null;

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Destacada */}
        <article className="group relative min-w-0 lg:col-span-7" aria-labelledby="home-news-featured">
          <MediaFrame
            src={featuredImage}
            alt=""
            aspect="16/9"
            treatment="duotone"
            hoverReveal
            zoom
            priority
            unoptimized={Boolean(featuredImage && !isOptimizableImageUrl(featuredImage))}
            sizes="(max-width: 1024px) 100vw, 58vw"
            fallbackSeed={featured.author?.trim() || featured.title}
            fallbackLabel=""
            badges={
              <>
                {kindBadge(featured)}
                {featured.pinned ? <Badge tone="gold">{SOCIAL_COPY.pinned}</Badge> : null}
              </>
            }
            center={
              openFeatured ? (
                <PlayButton size={72} variant="glass" aria-label={`${SOCIAL_COPY.watch} en YouTube: ${featured.title}`} onClick={openFeatured} />
              ) : null
            }
          />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2 text-label text-text-3">
                {featured.author?.trim() ? <span>{featured.author}</span> : null}
                {featured.author?.trim() && dateNode(featured) ? <span aria-hidden>·</span> : null}
                {dateNode(featured)}
              </p>
              <Heading as="h3" id="home-news-featured" size="display-sm" className="mt-2 line-clamp-2 text-text-1">
                {featured.title}
              </Heading>
              {featured.text?.trim() ? (
                <Text size="body-sm" tone="2" className="mt-2 line-clamp-2">
                  {featured.text}
                </Text>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {openFeatured ? (
                <Button onClick={openFeatured} aria-label={`${SOCIAL_COPY.watch} en YouTube: ${featured.title}`}>
                  <Play fill="currentColor" strokeWidth={0} aria-hidden />
                  {SOCIAL_COPY.watch}
                </Button>
              ) : null}
              <Button asChild variant={openFeatured ? "ghost" : "outline"}>
                <a href={featured.url} target="_blank" rel="noopener noreferrer" aria-label={`${SOCIAL_COPY.open} en ${network}: ${featured.title}`}>
                  <ExternalLink aria-hidden />
                  {SOCIAL_COPY.open}
                </a>
              </Button>
            </div>
          </div>
        </article>

        {/* Lista */}
        {rest.length ? (
          <HomeStagger className="min-w-0 border-t border-line-1 lg:col-span-5">
            {rest.map((post) => {
              const videoId = socialVideoId(post);
              const image = post.imageUrl?.trim() || null;
              const net = SOCIAL_KIND_NETWORK[post.kind] ?? SOCIAL_KIND_NETWORK.LINK;
              const open = videoId ? () => setVideo({ videoId, title: post.title, author: post.author }) : null;
              return (
                <HomeStaggerItem key={post.id}>
                  <ListRow
                    as="article"
                    className="px-0"
                    media={
                      <MediaFrame
                        src={image}
                        alt=""
                        aspect="16/9"
                        rounded="md"
                        quality={60}
                        unoptimized={Boolean(image && !isOptimizableImageUrl(image))}
                        sizes="112px"
                        fallbackSeed={post.author?.trim() || post.title}
                        fallbackLabel=""
                        className="w-24 sm:w-28"
                      />
                    }
                    title={
                      <span className="whitespace-normal line-clamp-2">{post.title}</span>
                    }
                    meta={
                      <>
                        {kindBadge(post)}
                        <span className="text-label text-text-3">{dateNode(post)}</span>
                      </>
                    }
                    action={
                      open ? (
                        <IconButton variant="outline" aria-label={`${SOCIAL_COPY.watch} en YouTube: ${post.title}`} onClick={open}>
                          <Play fill="currentColor" strokeWidth={0} />
                        </IconButton>
                      ) : (
                        <IconButton asChild variant="outline" aria-label={`${SOCIAL_COPY.open} en ${net}: ${post.title}`}>
                          <a href={post.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink />
                          </a>
                        </IconButton>
                      )
                    }
                  />
                </HomeStaggerItem>
              );
            })}
          </HomeStagger>
        ) : null}
      </div>
      <SocialVideoDialog video={video} onClose={() => setVideo(null)} />
    </>
  );
}
