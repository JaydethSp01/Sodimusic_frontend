import { fetchPublic, PUBLIC_REVALIDATE_DEFAULT, publicTags } from "@/lib/api";
import type { SocialPost, SocialPostKind } from "@/types/models";

export interface SocialFeedResponse {
  items: SocialPost[];
  /** Última sincronización (ISO) o `null` si nunca se ha sincronizado. */
  updatedAt: string | null;
}

/** Tope del backend para `limit`. */
export const SOCIAL_FEED_MAX = 48;

export const SOCIAL_POST_KINDS: SocialPostKind[] = ["YOUTUBE_VIDEO", "FACEBOOK_POST", "LINK"];

export function isSocialPostKind(value: unknown): value is SocialPostKind {
  return typeof value === "string" && (SOCIAL_POST_KINDS as string[]).includes(value);
}

const EMPTY: SocialFeedResponse = { items: [], updatedAt: null };

function normalize(data: Partial<SocialFeedResponse>): SocialFeedResponse {
  return {
    items: Array.isArray(data.items) ? data.items.filter((p): p is SocialPost => !!p && typeof p.id === "string") : [],
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
  };
}

/**
 * Feed público de novedades (`GET /api/social/feed`): solo VISIBLE, fijados
 * primero y luego por fecha. Degrada a lista vacía si la API no responde o
 * aún no existe la ruta (404).
 */
export async function fetchSocialFeed(
  limit = 12,
  kind?: SocialPostKind,
  revalidate = PUBLIC_REVALIDATE_DEFAULT,
): Promise<SocialFeedResponse> {
  const qs = new URLSearchParams({ limit: String(Math.min(SOCIAL_FEED_MAX, Math.max(1, Math.trunc(limit)))) });
  if (kind) qs.set("kind", kind);
  try {
    const res = await fetchPublic(`/api/social/feed?${qs.toString()}`, { next: { tags: [publicTags.social], revalidate } });
    if (!res.ok) return EMPTY;
    return normalize((await res.json()) as Partial<SocialFeedResponse>);
  } catch {
    return EMPTY;
  }
}
