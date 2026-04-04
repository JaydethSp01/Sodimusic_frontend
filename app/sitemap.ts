import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const root = base.replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/productions", "/beats", "/releases", "/booking", "/artists"];
  return paths.map((p) => ({
    url: `${root}${p || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.8,
  }));
}
