import { Instagram, Youtube } from "lucide-react";
import { MediaCard } from "@/components/ds/media-card";
import { Reveal } from "@/components/shared/reveal";
import { RevealItem } from "@/components/shared/reveal-item";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type { SiteCrewMember } from "@/types/site-content";

export type CrewMember = SiteCrewMember;

/**
 * Crew: `MediaCard` 3/4 overlay (duotono que el hover revela) con el género como badge, el nombre en
 * display-sm, la bio en dos líneas y las redes como `IconButton` (enlaces externos con `aria-label`).
 */
export function ArtistsCrewGrid({ members }: { members: SiteCrewMember[] }) {
  return (
    <Reveal as="ul" variant="stagger" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {members.map((m) => {
        const hasLinks = !!(m.instagramUrl?.trim() || m.youtubeUrl?.trim());
        return (
          <RevealItem as="li" key={m.name} className="h-full">
            <MediaCard
              as="article"
              layout="overlay"
              aspect="3/4"
              src={m.imageUrl?.trim() ? resolveMediaUrl(m.imageUrl) : null}
              alt={m.imageUrl?.trim() ? `Foto de ${m.name}` : ""}
              fallbackSeed={m.name}
              fallbackLabel={m.name}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              meta={<Badge tone="fire">{m.genre}</Badge>}
              title={m.name}
              description={m.bio?.trim() ? m.bio : undefined}
              className="h-full"
              action={
                hasLinks ? (
                  <div className="flex gap-2">
                    {m.instagramUrl?.trim() ? (
                      <IconButton asChild variant="outline" aria-label={`Instagram de ${m.name}`} className="bg-ink-0/60 backdrop-blur-sm">
                        <a href={m.instagramUrl.trim()} target="_blank" rel="noopener noreferrer">
                          <Instagram />
                        </a>
                      </IconButton>
                    ) : null}
                    {m.youtubeUrl?.trim() ? (
                      <IconButton asChild variant="outline" aria-label={`YouTube de ${m.name}`} className="bg-ink-0/60 backdrop-blur-sm">
                        <a href={m.youtubeUrl.trim()} target="_blank" rel="noopener noreferrer">
                          <Youtube />
                        </a>
                      </IconButton>
                    ) : null}
                  </div>
                ) : undefined
              }
            />
          </RevealItem>
        );
      })}
    </Reveal>
  );
}
