"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Music2, Youtube } from "lucide-react";
import type { Production } from "@/types/models";
import { GenreTag } from "@/components/shared/genre-tag";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

interface ProductionCardProps {
  production: Production;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function ProductionCard({ production }: ProductionCardProps) {
  const loc = `${production.artistCity}, ${production.artistCountry}`;
  const ini = initials(production.artistName);

  return (
    <motion.article
      className="group overflow-hidden rounded-lg border border-border bg-background-card transition-shadow duration-300 hover:border-primary/30"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {production.coverUrl ? (
          <Image
            src={resolveMediaUrl(production.coverUrl)}
            alt={`Portada de ${production.title} por ${production.artistName}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <PlaceholderCover seed={production.artistName} label={ini} className="h-full w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 pt-16">
          <h3 className="font-body text-lg font-semibold text-white">{production.title}</h3>
          <p className="text-sm text-white/80">{production.artistName}</p>
          <p className="font-mono text-[10px] text-white/50">{loc}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-white/45">{production.year}</span>
            <GenreTag genre={production.genre} />
          </div>
          <div className="flex gap-3 pt-1">
            {production.spotifyUrl ? (
              <a
                href={production.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("text-white/70 transition-colors hover:text-primary")}
                aria-label={`Spotify: ${production.title}`}
              >
                <Music2 className="h-5 w-5" />
              </a>
            ) : null}
            {production.youtubeUrl ? (
              <a
                href={production.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 transition-colors hover:text-primary"
                aria-label={`YouTube: ${production.title}`}
              >
                <Youtube className="h-5 w-5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
