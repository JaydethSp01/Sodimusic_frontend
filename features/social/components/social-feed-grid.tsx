"use client";

import { useState } from "react";
import type { SocialPost } from "@/types/models";
import { HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { SocialPostCard } from "@/features/social/components/social-post-card";
import { SocialVideoDialog } from "@/features/social/components/social-video-dialog";
import { cn } from "@/lib/utils";

interface SocialFeedGridProps {
  posts: SocialPost[];
  /** Pinta la primera novedad en formato destacado (imagen 16/9 ancha + texto) y el resto en grilla de 3. */
  featuredFirst?: boolean;
  className?: string;
}

/**
 * Grilla de novedades con UN solo diálogo de video: abrir otro reemplaza el
 * anterior, así nunca hay más de un iframe de YouTube montado por página.
 */
export function SocialFeedGrid({ posts, featuredFirst = false, className }: SocialFeedGridProps) {
  const [video, setVideo] = useState<{ videoId: string; title: string; author: string | null } | null>(null);
  const [head, ...tail] = featuredFirst ? posts : [];
  const grid = featuredFirst ? tail : posts;
  const single = grid.length === 1 && !featuredFirst;
  const onWatch = (p: SocialPost, videoId: string) => setVideo({ videoId, title: p.title, author: p.author });

  return (
    <>
      {head ? (
        <div className="mb-12 border-b border-line-1 pb-12 lg:mb-16 lg:pb-16">
          <SocialPostCard post={head} variant="featured" priority onWatch={onWatch} />
        </div>
      ) : null}
      {grid.length ? (
        <HomeStagger className={cn("grid gap-6 sm:gap-x-5 sm:gap-y-10", single ? "max-w-xl" : "sm:grid-cols-2", grid.length > 2 && "lg:grid-cols-3", className)}>
          {grid.map((post, i) => (
            <HomeStaggerItem key={post.id} className="h-full">
              <SocialPostCard post={post} priority={!featuredFirst && i < 3} onWatch={onWatch} />
            </HomeStaggerItem>
          ))}
        </HomeStagger>
      ) : null}
      <SocialVideoDialog video={video} onClose={() => setVideo(null)} />
    </>
  );
}
