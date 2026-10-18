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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const main = ["", "/productions", "/beats", "/releases", "/booking", "/artists", "/tienda", "/canales", "/novedades", "/contacto"];
  const now = new Date();
  // Fichas de artistas ACTIVE (lista vacía si la API no responde).
  const artists = await fetchArtists();
  return [
    ...main.map((p) => ({
      url: `${root}${p || "/"}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.8,
    })),
    ...artists.map((a) => ({
      url: `${root}${artistHref(a.slug)}`,
      lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...LEGAL_PATHS.map((p) => ({
      url: `${root}${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];
}
