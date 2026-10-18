import { Youtube } from "lucide-react";
import { BentoGrid } from "@/components/ds/bento-grid";
import { MediaCard } from "@/components/ds/media-card";
import { HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { SpotifyIcon } from "@/features/productions/components/production-card";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { genreColor } from "@/lib/genre-colors";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type { Production } from "@/types/models";

const productionIconBtn =
  "border-white/25 bg-black/40 text-text-1 backdrop-blur-sm hover:border-fire-500 hover:bg-fire-500 hover:text-fire-on";

/**
 * Producciones destacadas en `BentoGrid` (1 grande 4/5 que ocupa dos filas + el resto 16/9) con
 * `MediaCard` overlay, badges de año/género y botones Spotify/YouTube. Server component.
 */
export function HomeProductionsBento({ productions, priority = true }: { productions: Production[]; priority?: boolean }) {
  if (!productions.length) return null;
  return (
    <HomeStagger>
      <BentoGrid pattern={[8, 4, 4]} rowSpans={[2]}>
        {productions.map((p, i) => {
          const big = i === 0;
          const color = genreColor(p.genre);
          const loc = [p.artistCity, p.artistCountry].filter(Boolean).join(", ");
          return (
            <HomeStaggerItem key={p.id} className="h-full">
              <MediaCard
                layout="overlay"
                aspect={big ? "4/5" : "16/9"}
                src={p.coverUrl ? resolveMediaUrl(p.coverUrl) : null}
                alt={`Portada de ${p.title} por ${p.artistName}`}
                priority={big && priority}
                sizes={big ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"}
                fallbackSeed={p.artistName}
                fallbackLabel={p.artistName}
                title={p.title}
                overlayTitleSize={big ? "display-md" : "display-sm"}
                description={loc ? `${p.artistName} · ${loc}` : p.artistName}
                meta={
                  <>
                    <Badge tone="neutral" variant="outline" className="border-white/25 text-text-1">
                      {p.year}
                    </Badge>
                    {p.genre ? (
                      <Badge variant="outline" style={{ color: color.fg, borderColor: color.border }}>
                        {p.genre}
                      </Badge>
                    ) : null}
                  </>
                }
                action={
                  p.spotifyUrl || p.youtubeUrl ? (
                    <span className="flex gap-2">
                      {p.spotifyUrl ? (
                        <IconButton asChild variant="outline" className={productionIconBtn} aria-label={`Escuchar ${p.title} en Spotify`}>
                          <a href={p.spotifyUrl} target="_blank" rel="noopener noreferrer">
                            <SpotifyIcon className="h-5 w-5" />
                          </a>
                        </IconButton>
                      ) : null}
                      {p.youtubeUrl ? (
                        <IconButton asChild variant="outline" className={productionIconBtn} aria-label={`Ver ${p.title} en YouTube`}>
                          <a href={p.youtubeUrl} target="_blank" rel="noopener noreferrer">
                            <Youtube />
                          </a>
                        </IconButton>
                      ) : null}
                    </span>
                  ) : null
                }
                className="h-full"
                mediaClassName={big ? "lg:aspect-auto lg:min-h-[480px]" : undefined}
              />
            </HomeStaggerItem>
          );
        })}
      </BentoGrid>
    </HomeStagger>
  );
}
