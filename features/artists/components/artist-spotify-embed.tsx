"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { spotifyArtistEmbedUrl } from "@/features/artists/api";
import { cn } from "@/lib/utils";

interface ArtistSpotifyEmbedProps {
  artistId: string;
  artistName: string;
  className?: string;
}

/**
 * Reproductor de Spotify cargado de forma perezosa: el iframe solo se monta al pulsar
 * «Escuchar en Spotify» (nada de terceros en la carga inicial).
 */
export function ArtistSpotifyEmbed({ artistId, artistName, className }: ArtistSpotifyEmbedProps) {
  const [mounted, setMounted] = useState(false);
  const title = `Reproductor de Spotify de ${artistName}`;
  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-line-1 bg-ink-2", className)}>
      {mounted ? (
        <iframe
          src={spotifyArtistEmbedUrl(artistId)}
          title={title}
          width="100%"
          height="352"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          className="block h-[352px] w-full"
        />
      ) : (
        <div className="flex min-h-[200px] flex-col items-start justify-center gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="min-w-0">
            <p className="text-title text-text-1">Top temas en Spotify</p>
            <Text size="body-sm" tone="2" className="mt-1">
              Carga el reproductor de Spotify para escuchar lo más sonado de {artistName} sin salir de aquí.
            </Text>
          </div>
          <Button type="button" size="lg" className="shrink-0" onClick={() => setMounted(true)} aria-label={`Escuchar ${artistName} en Spotify: cargar el reproductor`}>
            <Play fill="currentColor" strokeWidth={0} aria-hidden />
            Escuchar en Spotify
          </Button>
        </div>
      )}
    </div>
  );
}
