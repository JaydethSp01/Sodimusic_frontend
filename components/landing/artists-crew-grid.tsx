import Image from "next/image";
import { Instagram, Youtube } from "lucide-react";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { Reveal } from "@/components/shared/reveal";
import { RevealItem } from "@/components/shared/reveal-item";
import { COVER_IMAGE_PROPS } from "@/lib/image-blur";
import { genreColor } from "@/lib/genre-colors";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";
import type { SiteCrewMember } from "@/types/site-content";

export type CrewMember = SiteCrewMember;

const socialBtn =
  "flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-primary hover:bg-primary hover:text-[var(--primary-foreground)]";

export function ArtistsCrewGrid({ members }: { members: SiteCrewMember[] }) {
  return (
    <Reveal as="ul" variant="stagger" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => {
        const hasLinks = !!(m.instagramUrl?.trim() || m.youtubeUrl?.trim());
        const color = genreColor(m.genre);
        return (
          <RevealItem as="li" key={m.name} className="h-full">
            <article
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background-card transition-all duration-300",
                "hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_48px_-12px_rgba(255,107,0,0.25)]",
              )}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {m.imageUrl?.trim() ? (
                  <Image
                    src={resolveMediaUrl(m.imageUrl)}
                    alt={`Foto de ${m.name}`}
                    fill
                    {...COVER_IMAGE_PROPS}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <PlaceholderCover seed={m.name} label={m.name} className="absolute inset-0" />
                )}
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0)_40%,rgba(8,8,8,0.55)_75%,rgba(8,8,8,0.95)_100%)]"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.25em]"
                      style={{ color: color.fg }}
                    >
                      {m.genre}
                    </p>
                    <h3 className="display-title mt-1 truncate text-3xl text-white md:text-4xl">{m.name}</h3>
                  </div>
                  {hasLinks ? (
                    <div className="flex shrink-0 gap-2">
                      {m.instagramUrl?.trim() ? (
                        <a
                          href={m.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={socialBtn}
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
                          className={socialBtn}
                          aria-label={`YouTube de ${m.name}`}
                        >
                          <Youtube className="h-5 w-5" aria-hidden />
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
              {m.bio?.trim() ? (
                <p className="p-5 text-sm leading-relaxed text-[var(--text-secondary)]">{m.bio}</p>
              ) : null}
            </article>
          </RevealItem>
        );
      })}
    </Reveal>
  );
}
