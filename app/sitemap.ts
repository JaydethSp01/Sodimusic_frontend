import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const root = base.replace(/\/$/, "");

const LEGAL_PATHS = [
  "/legal/privacidad",
  "/legal/terminos-tienda",
  "/legal/terminos-estudio",
  "/legal/licencia-beats",
  "/legal/aviso-legal",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const main = ["", "/productions", "/beats", "/releases", "/booking", "/artists", "/tienda", "/canales", "/novedades", "/contacto"];
  const now = new Date();
  return [
    ...main.map((p) => ({
      url: `${root}${p || "/"}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.8,
    })),
    ...LEGAL_PATHS.map((p) => ({
      url: `${root}${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ];
}
