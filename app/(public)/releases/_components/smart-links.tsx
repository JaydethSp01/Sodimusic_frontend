import { SmartLinkButton, type SmartLinkPlatform } from "@/components/ds/smart-link-button";
import type { Release } from "@/types/models";
import { cn } from "@/lib/utils";

type PlatformKey = keyof Pick<Release, "spotifyUrl" | "appleUrl" | "youtubeUrl" | "deezerUrl" | "amazonUrl" | "tidalUrl" | "soundcloudUrl">;

const PLATFORMS: Array<{ key: PlatformKey; platform: SmartLinkPlatform }> = [
  { key: "spotifyUrl", platform: "spotify" },
  { key: "appleUrl", platform: "apple" },
  { key: "youtubeUrl", platform: "youtube" },
  { key: "deezerUrl", platform: "deezer" },
  { key: "amazonUrl", platform: "amazon" },
  { key: "tidalUrl", platform: "tidal" },
  { key: "soundcloudUrl", platform: "soundcloud" },
];

/** Plataformas con URL válida de un lanzamiento. */
export function releasePlatforms(release: Release): Array<{ key: PlatformKey; platform: SmartLinkPlatform; url: string }> {
  return PLATFORMS.flatMap((p) => {
    const url = release[p.key];
    return typeof url === "string" && /^https?:\/\//i.test(url.trim()) ? [{ ...p, url: url.trim() }] : [];
  });
}

interface SmartLinksProps {
  release: Release;
  /** Etiqueta personalizada para Spotify/YouTube (CMS) */
  labels?: Partial<Record<PlatformKey, string>>;
  size?: "sm" | "md";
  /** Solo iconos (overlay de tarjeta). */
  iconOnly?: boolean;
  className?: string;
}

/** Botonera de smart links (`SmartLinkButton`): solo renderiza las plataformas con URL. */
export function SmartLinks({ release, labels, size = "md", iconOnly = false, className }: SmartLinksProps) {
  const available = releasePlatforms(release);
  if (!available.length) {
    return null;
  }
  return (
    <nav aria-label="Escuchar en plataformas" className={className}>
      <ul className={cn("flex flex-wrap", iconOnly ? "gap-2" : "gap-3")}>
        {available.map((p) => (
          <li key={p.key}>
            <SmartLinkButton platform={p.platform} href={p.url} label={labels?.[p.key]} size={size} iconOnly={iconOnly} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
