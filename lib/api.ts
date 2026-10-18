const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

export function getPublicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? backendUrl;
}

/**
 * Tags de caché por recurso público. Úsalos en `fetchPublic` (se infieren por
 * ruta) y en las server actions del admin con `revalidateTag(publicTags.x)`.
 */
export const publicTags = {
  siteConfig: "site-config",
  channels: "channels",
  beats: "beats",
  products: "products",
  releases: "releases",
  productions: "productions",
  social: "social",
} as const;

export type PublicTag = (typeof publicTags)[keyof typeof publicTags];

/** Revalidación por defecto (segundos). Site-config y canales cambian poco. */
export const PUBLIC_REVALIDATE_DEFAULT = 60;
export const PUBLIC_REVALIDATE_SLOW = 300;

type ResourceCachePolicy = { tag: PublicTag; revalidate: number };

const RESOURCE_POLICIES: Array<{ prefix: string; policy: ResourceCachePolicy }> = [
  { prefix: "/api/site-config", policy: { tag: publicTags.siteConfig, revalidate: PUBLIC_REVALIDATE_SLOW } },
  { prefix: "/api/channels", policy: { tag: publicTags.channels, revalidate: PUBLIC_REVALIDATE_SLOW } },
  { prefix: "/api/youtube-channels", policy: { tag: publicTags.channels, revalidate: PUBLIC_REVALIDATE_SLOW } },
  { prefix: "/api/beats", policy: { tag: publicTags.beats, revalidate: PUBLIC_REVALIDATE_DEFAULT } },
  { prefix: "/api/products", policy: { tag: publicTags.products, revalidate: PUBLIC_REVALIDATE_DEFAULT } },
  { prefix: "/api/releases", policy: { tag: publicTags.releases, revalidate: PUBLIC_REVALIDATE_DEFAULT } },
  { prefix: "/api/productions", policy: { tag: publicTags.productions, revalidate: PUBLIC_REVALIDATE_DEFAULT } },
  { prefix: "/api/social", policy: { tag: publicTags.social, revalidate: PUBLIC_REVALIDATE_DEFAULT } },
];

/** Política de caché inferida por la ruta (`/api/beats?x=1` → beats). */
export function resolvePublicCachePolicy(path: string): ResourceCachePolicy | null {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const pathname = clean.split("?")[0];
  for (const { prefix, policy } of RESOURCE_POLICIES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return policy;
  }
  return null;
}

/**
 * Fetch al backend público con caché de Next (ISR) por recurso:
 * - `revalidate`: 60 s por defecto, 300 s para site-config y canales; el
 *   `init.next.revalidate` explícito del llamador siempre gana.
 * - `tags`: tag del recurso (inferido por ruta) + los que pase el llamador,
 *   para que las acciones del admin invaliden con `revalidateTag`.
 *
 * Si la API no responde (red caída, ECONNREFUSED) devuelve una `Response` 503
 * en lugar de lanzar, para que las páginas degraden a listas vacías con `res.ok`.
 */
export async function fetchPublic(path: string, init?: RequestInit): Promise<Response> {
  const url = `${getPublicApiUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const policy = resolvePublicCachePolicy(path);
  const callerNext = init?.next ?? {};
  const tags = Array.from(new Set([...(policy ? [policy.tag] : []), ...(callerNext.tags ?? [])]));
  const next: NonNullable<RequestInit["next"]> = {
    ...callerNext,
    revalidate: callerNext.revalidate ?? policy?.revalidate ?? PUBLIC_REVALIDATE_DEFAULT,
    ...(tags.length ? { tags } : {}),
  };
  try {
    return await fetch(url, { ...init, next });
  } catch {
    return new Response(null, { status: 503, statusText: "Backend unavailable" });
  }
}
