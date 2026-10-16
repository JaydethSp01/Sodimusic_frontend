"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram, Youtube } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";
import type { SiteCrewMember } from "@/types/site-content";

export type CrewMember = SiteCrewMember;

export function ArtistsCrewGrid({ members }: { members: SiteCrewMember[] }) {
  return (
    <motion.ul
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {members.map((m) => {
        const hasLinks = !!(m.instagramUrl?.trim() || m.youtubeUrl?.trim());
        return (
          <motion.li key={m.name} variants={fadeInUp}>
            <article
              className={cn(
                "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background-card transition-all duration-300",
                "hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(255,107,0,0.12)]",
              )}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {m.imageUrl?.trim() ? (
                  <Image
                    src={resolveMediaUrl(m.imageUrl)}
                    alt={`Foto de ${m.name}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <PlaceholderCover seed={m.name} className="absolute inset-0" />
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-display text-2xl text-foreground">{m.name}</h3>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-primary">{m.genre}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{m.bio}</p>
                {hasLinks ? (
                  <div className="mt-auto flex gap-2 pt-4">
                    {m.instagramUrl?.trim() ? (
                      <a
                        href={m.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-[var(--text-secondary)] transition-colors hover:border-primary/40 hover:text-primary"
                        aria-label={`Instagram de ${m.name}`}
                      >
                        <Instagram className="h-5 w-5" aria-hidden />
                      </a>
                    ) : null}
                    {m.youtubeUrl?.trim() ? (
                      <a
                        href={m.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-[var(--text-secondary)] transition-colors hover:border-primary/40 hover:text-primary"
                        aria-label={`YouTube de ${m.name}`}
                      >
                        <Youtube className="h-5 w-5" aria-hidden />
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </article>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
