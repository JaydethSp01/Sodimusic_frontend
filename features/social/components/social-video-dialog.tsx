"use client";

import { YoutubeLazyEmbed } from "@/components/landing/youtube-lazy-embed";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { videoEmbedUrl } from "@/lib/youtube";

export interface SocialVideoDialogProps {
  /** `null` = cerrado. */
  video: { videoId: string; title: string; author?: string | null } | null;
  onClose: () => void;
}

/**
 * Diálogo con el embed lazy de YouTube (nocookie). Solo monta el iframe mientras
 * está abierto: al cerrar se desmonta y nunca hay más de un iframe por página.
 */
export function SocialVideoDialog({ video, onClose }: SocialVideoDialogProps) {
  const open = video !== null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl gap-3 p-4 sm:p-5">
        {video ? (
          <>
            <DialogHeader className="pr-8">
              <DialogTitle className="display-title text-xl text-foreground md:text-2xl">{video.title}</DialogTitle>
              <DialogDescription>{video.author?.trim() ? `${video.author} · YouTube` : "YouTube"}</DialogDescription>
            </DialogHeader>
            <YoutubeLazyEmbed
              src={`${videoEmbedUrl(video.videoId)}?autoplay=1&rel=0`}
              title={video.title}
              ctaLabel="Reproducir"
              className="border-border"
            />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
