import { fetchPublic, PUBLIC_REVALIDATE_SLOW, publicTags } from "@/lib/api";
import { parseYoutubeChannelId, parseYoutubeVideoId, uploadsPlaylistEmbedUrl, videoEmbedUrl } from "@/lib/youtube";
import type { Paginated, YoutubeChannel } from "@/types/models";

export interface ChannelListResponse extends Paginated<YoutubeChannel> {
  categories: string[];
}

export interface ChannelListParams {
  q?: string;
  category?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

/** Tamaño de página de `/canales` (el backend acota a 48). */
export const CHANNELS_PAGE_SIZE = 24;

const EMPTY: ChannelListResponse = { items: [], total: 0, page: 1, pageSize: 0, categories: [] };

function normalize(data: Partial<ChannelListResponse>): ChannelListResponse {
  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: typeof data.total === "number" ? data.total : 0,
    page: typeof data.page === "number" ? data.page : 1,
    pageSize: typeof data.pageSize === "number" ? data.pageSize : 0,
    categories: Array.isArray(data.categories) ? data.categories.filter((c): c is string => typeof c === "string") : [],
  };
}

/**
 * Lista pública de canales (solo ACTIVE), paginada y buscable en servidor.
 * Degrada a lista vacía si la API no responde.
 */
export async function fetchChannels(
  params: ChannelListParams = {},
  revalidate = PUBLIC_REVALIDATE_SLOW,
): Promise<ChannelListResponse> {
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.category?.trim()) qs.set("category", params.category.trim());
  if (params.featured) qs.set("featured", "1");
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  const query = qs.toString();
  try {
    const res = await fetchPublic(`/api/channels${query ? `?${query}` : ""}`, {
      next: { tags: [publicTags.channels], revalidate },
    });
    if (!res.ok) return EMPTY;
    return normalize((await res.json()) as Partial<ChannelListResponse>);
  } catch {
    return EMPTY;
  }
}

/** `null` si no existe (404 / HIDDEN) o si la API no responde. */
export async function fetchChannel(id: string, revalidate = PUBLIC_REVALIDATE_SLOW): Promise<YoutubeChannel | null> {
  try {
    const res = await fetchPublic(`/api/channels/${encodeURIComponent(id)}`, {
      next: { tags: [publicTags.channels], revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as YoutubeChannel;
  } catch {
    return null;
  }
}

/**
 * URL de embed (nocookie) para la tarjeta: video destacado si lo hay; si no,
 * la lista de subidas del canal (requiere `channelId`). `null` si no se puede.
 */
export function channelEmbedSrc(
  ch: Pick<YoutubeChannel, "url" | "channelId" | "featuredVideoUrl">,
): string | null {
  const videoId = ch.featuredVideoUrl?.trim() ? parseYoutubeVideoId(ch.featuredVideoUrl) : null;
  if (videoId) return videoEmbedUrl(videoId);
  const channelId = ch.channelId?.trim() || parseYoutubeChannelId(ch.url);
  return channelId ? uploadsPlaylistEmbedUrl(channelId) : null;
}
