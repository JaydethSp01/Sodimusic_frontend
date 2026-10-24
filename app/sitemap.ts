import type { MetadataRoute } from "next";
import { fetchArtists } from "@/features/artists/api";
import { artistHref } from "@/features/artists/hrefs";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const root = base.replace(/\/$/, "");

const LEGAL_PATHS = [
  "/legal/privacidad",
  "/legal/terminos-tienda",
  "/legal/terminos-estudio",
  "/legal/licencia-beats",
  "/legal/aviso-legal",
];

/**
 * Fecha real del último cambio de contenido/estructura del sitio. Google ignora `lastmod` si
 * siempre es «ahora»; actualízala al publicar cambios relevantes en las páginas fijas.
 */
const SITE_UPDATED = new Date("2026-10-24T17:00:00Z");
const LEGAL_UPDATED = new Date("2026-10-17T00:00:00Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const main = ["", "/productions", "/beats", "/releases", "/booking", "/artists", "/tienda", "/canales", "/novedades", "/contacto"];
  // Fichas de artistas ACTIVE (lista vacía si la API no responde).
  const artists = await fetchArtists();
  return [
    ...main.map((p) => ({
      url: `${root}${p || "/"}`,
      lastModified: SITE_UPDATED,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : p === "/booking" ? 0.9 : 0.8,
    })),
    ...artists.map((a) => ({
      url: `${root}${artistHref(a.slug)}`,
      lastModified: a.updatedAt ? new Date(a.updatedAt) : SITE_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...LEGAL_PATHS.map((p) => ({
      url: `${root}${p}`,
      lastModified: LEGAL_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];
}
