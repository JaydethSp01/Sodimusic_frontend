"use client";

import { useState } from "react";
import type { SocialPost } from "@/types/models";
import { HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { SocialPostCard } from "@/features/social/components/social-post-card";
import { SocialVideoDialog } from "@/features/social/components/social-video-dialog";
import { cn } from "@/lib/utils";

interface SocialFeedGridProps {
  posts: SocialPost[];
  className?: string;
}

/**
 * Grilla de novedades con UN solo diálogo de video: abrir otro reemplaza el
 * anterior, así nunca hay más de un iframe de YouTube montado por página.
 */
export function SocialFeedGrid({ posts, className }: SocialFeedGridProps) {
  const [video, setVideo] = useState<{ videoId: string; title: string; author: string | null } | null>(null);
  const single = posts.length === 1;

  return (
    <>
      <HomeStagger
        className={cn(
          "grid gap-5 sm:gap-6",
          single ? "mx-auto max-w-xl" : "sm:grid-cols-2",
          posts.length > 2 && "lg:grid-cols-3",
          className,
        )}
      >
        {posts.map((post, i) => (
          <HomeStaggerItem key={post.id} className="h-full">
            <SocialPostCard
              post={post}
              priority={i < 3}
              onWatch={(p, videoId) => setVideo({ videoId, title: p.title, author: p.author })}
            />
          </HomeStaggerItem>
        ))}
      </HomeStagger>
      <SocialVideoDialog video={video} onClose={() => setVideo(null)} />
    </>
  );
}
