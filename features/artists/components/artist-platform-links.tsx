import { SmartLinkButton } from "@/components/ds/smart-link-button";
import { artistPlatforms } from "@/features/artists/api";
import { cn } from "@/lib/utils";
import type { Artist } from "@/types/models";

interface ArtistPlatformLinksProps {
  artist: Artist;
  size?: "sm" | "md";
  iconOnly?: boolean;
  className?: string;
}

/** Botonera de plataformas del artista (`SmartLinkButton`): solo las que tienen URL. */
export function ArtistPlatformLinks({ artist, size = "md", iconOnly = false, className }: ArtistPlatformLinksProps) {
  const available = artistPlatforms(artist);
  if (!available.length) return null;
  return (
    <nav aria-label={`Plataformas de ${artist.name}`} className={className}>
      <ul className={cn("flex flex-wrap", iconOnly ? "gap-2" : "gap-3")}>
        {available.map((p) => (
          <li key={p.key}>
            <SmartLinkButton platform={p.platform} href={p.url} size={size} iconOnly={iconOnly} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
