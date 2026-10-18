import { fetchPublic, PUBLIC_REVALIDATE_DEFAULT, publicTags } from "@/lib/api";
import type { SmartLinkPlatform } from "@/components/ds/smart-link-button";
import type { SiteContent } from "@/types/site-content";
import type { Artist, ArtistDetail } from "@/types/models";

export const PRODUCER_ROLE = "Productor principal";

export interface ArtistListParams {
  featured?: boolean;
  role?: string;
}

/**
 * Lista pública de artistas (solo ACTIVE; orden `featured desc, sortOrder, name`).
 * Degrada a lista vacía si la API no responde o aún no existe (404).
 */
export async function fetchArtists(params: ArtistListParams = {}, revalidate = PUBLIC_REVALIDATE_DEFAULT): Promise<Artist[]> {
  const qs = new URLSearchParams();
  if (params.featured) qs.set("featured", "1");
  if (params.role?.trim()) qs.set("role", params.role.trim());
  const query = qs.toString();
  try {
    const res = await fetchPublic(`/api/artists${query ? `?${query}` : ""}`, {
      next: { tags: [publicTags.artists], revalidate },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Partial<{ items: Artist[] }>;
    return Array.isArray(data.items) ? data.items.map(normalizeArtist) : [];
  } catch {
    return [];
  }
}

/** `null` si no existe (404 / HIDDEN) o si la API no responde. */
export async function fetchArtist(slug: string, revalidate = PUBLIC_REVALIDATE_DEFAULT): Promise<ArtistDetail | null> {
  try {
    const res = await fetchPublic(`/api/artists/${encodeURIComponent(slug)}`, {
      next: { tags: [publicTags.artists], revalidate },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<ArtistDetail>;
    if (!data.artist || typeof data.artist !== "object") return null;
    return {
      artist: normalizeArtist(data.artist),
      productions: Array.isArray(data.productions) ? data.productions : [],
      releases: Array.isArray(data.releases) ? data.releases : [],
      posts: Array.isArray(data.posts) ? data.posts : [],
    };
  } catch {
    return null;
  }
}

/** Rellena arrays/strings opcionales para que las vistas no tengan que comprobar `undefined`. */
export function normalizeArtist(a: Partial<Artist> & { id: string; slug: string; name: string }): Artist {
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    role: a.role?.trim() || "Artista",
    shortBio: a.shortBio ?? null,
    bio: a.bio ?? null,
    photoUrl: a.photoUrl ?? null,
    coverUrl: a.coverUrl ?? null,
    city: a.city ?? null,
    genres: Array.isArray(a.genres) ? a.genres.filter((g): g is string => typeof g === "string" && g.trim().length > 0) : [],
    spotifyUrl: a.spotifyUrl ?? null,
    instagramUrl: a.instagramUrl ?? null,
    youtubeUrl: a.youtubeUrl ?? null,
    tiktokUrl: a.tiktokUrl ?? null,
    facebookUrl: a.facebookUrl ?? null,
    appleUrl: a.appleUrl ?? null,
    youtubeChannelId: a.youtubeChannelId ?? null,
    aliases: Array.isArray(a.aliases) ? a.aliases.filter((x): x is string => typeof x === "string") : [],
    featured: a.featured === true,
    status: a.status === "HIDDEN" ? "HIDDEN" : "ACTIVE",
    sortOrder: typeof a.sortOrder === "number" ? a.sortOrder : 0,
    createdAt: a.createdAt ?? "",
    updatedAt: a.updatedAt ?? "",
  };
}

/** Productor principal: el `featured` con rol «Productor principal», si no el primero de ese rol, si no el primero. */
export function pickProducer(artists: Artist[]): Artist | null {
  if (!artists.length) return null;
  return (
    artists.find((a) => a.featured && a.role === PRODUCER_ROLE) ??
    artists.find((a) => a.role === PRODUCER_ROLE) ??
    artists[0]
  );
}

/* ------------------------------------------------------------------ */
/* Plataformas                                                         */
/* ------------------------------------------------------------------ */

export type ArtistPlatformKey = keyof Pick<Artist, "spotifyUrl" | "appleUrl" | "youtubeUrl" | "instagramUrl" | "tiktokUrl" | "facebookUrl">;

const PLATFORMS: Array<{ key: ArtistPlatformKey; platform: SmartLinkPlatform }> = [
  { key: "spotifyUrl", platform: "spotify" },
  { key: "appleUrl", platform: "apple" },
  { key: "youtubeUrl", platform: "youtube" },
  { key: "instagramUrl", platform: "instagram" },
  { key: "tiktokUrl", platform: "tiktok" },
  { key: "facebookUrl", platform: "facebook" },
];

/** Plataformas con URL válida (`https?://`) del artista, en el orden del contrato. */
export function artistPlatforms(
  artist: Pick<Artist, ArtistPlatformKey>,
): Array<{ key: ArtistPlatformKey; platform: SmartLinkPlatform; url: string }> {
  return PLATFORMS.flatMap((p) => {
    const url = artist[p.key];
    return typeof url === "string" && /^https?:\/\//i.test(url.trim()) ? [{ ...p, url: url.trim() }] : [];
  });
}

/** `open.spotify.com/artist/<id>` → id (22 caracteres alfanuméricos) o `null`. */
export function spotifyArtistId(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  try {
    const u = new URL(url.trim());
    if (!/(^|\.)spotify\.com$/i.test(u.hostname)) return null;
    const m = u.pathname.match(/\/(?:intl-[a-z]{2}\/)?artist\/([A-Za-z0-9]{22})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export function spotifyArtistEmbedUrl(id: string): string {
  return `https://open.spotify.com/embed/artist/${id}?utm_source=generator&theme=0`;
}

/* ------------------------------------------------------------------ */
/* Respaldo desde el SiteConfig (hasta que la API esté sembrada)       */
/* ------------------------------------------------------------------ */

export function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Mismo mapeo que la siembra del backend (§1.1): productor + `members[]` del SiteConfig publicado.
 * Se usa solo cuando `/api/artists` devuelve vacío; las tarjetas no enlazan a la ficha.
 */
export function artistsFromSiteContent(site: SiteContent): Artist[] {
  const now = "";
  const base = {
    shortBio: null,
    bio: null,
    photoUrl: null,
    coverUrl: null,
    city: null,
    spotifyUrl: null,
    instagramUrl: null,
    youtubeUrl: null,
    tiktokUrl: null,
    facebookUrl: null,
    appleUrl: null,
    youtubeChannelId: null,
    aliases: [] as string[],
    status: "ACTIVE" as const,
    createdAt: now,
    updatedAt: now,
  };
  const producer: Artist = {
    ...base,
    id: `site-${slugifyName(site.artists.producerName)}`,
    slug: slugifyName(site.artists.producerName),
    name: site.artists.producerName,
    role: PRODUCER_ROLE,
    bio: site.artists.producerBio || null,
    shortBio: site.artists.producerBio || null,
    photoUrl: site.artists.producerImageUrl?.trim() || null,
    genres: site.artists.producerGenres,
    featured: true,
    sortOrder: 0,
  };
  const members = site.artists.members.map<Artist>((m, i) => ({
    ...base,
    id: `site-${slugifyName(m.name)}`,
    slug: slugifyName(m.name),
    name: m.name,
    role: m.role?.trim() || "Crew",
    shortBio: m.bio || null,
    bio: m.bio || null,
    photoUrl: m.imageUrl?.trim() || null,
    genres: m.genre.split("·").map((g) => g.trim()).filter(Boolean),
    instagramUrl: m.instagramUrl?.trim() || null,
    youtubeUrl: m.youtubeUrl?.trim() || null,
    spotifyUrl: m.spotifyUrl?.trim() || null,
    tiktokUrl: m.tiktokUrl?.trim() || null,
    featured: false,
    sortOrder: i + 1,
  }));
  return [producer, ...members];
}
