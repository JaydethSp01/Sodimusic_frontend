"use client";

import { useState } from "react";
import type { SocialPost } from "@/types/models";
import { SocialPostCard } from "@/features/social/components/social-post-card";
import { SocialVideoDialog } from "@/features/social/components/social-video-dialog";
import { cn } from "@/lib/utils";

interface ArtistVideosProps {
  posts: SocialPost[];
  className?: string;
}

/**
 * Videos y publicaciones del artista en grilla de 3 con UN solo diálogo de YouTube
 * (abrir otro reemplaza al anterior: nunca hay más de un iframe por página).
 */
export function ArtistVideos({ posts, className }: ArtistVideosProps) {
  const [video, setVideo] = useState<{ videoId: string; title: string; author: string | null } | null>(null);
  const single = posts.length === 1;
  return (
    <>
      <ul className={cn("grid gap-6 sm:gap-x-5 sm:gap-y-10", single ? "max-w-xl" : "sm:grid-cols-2", posts.length > 2 && "lg:grid-cols-3", className)}>
        {posts.map((post) => (
          <li key={post.id} className="h-full">
            <SocialPostCard post={post} onWatch={(p, videoId) => setVideo({ videoId, title: p.title, author: p.author })} />
          </li>
        ))}
      </ul>
      <SocialVideoDialog video={video} onClose={() => setVideo(null)} />
    </>
  );
}
