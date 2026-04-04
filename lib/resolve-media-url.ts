import { getPublicApiUrl } from "@/lib/api";

/** Convierte `/uploads/...` o URL absoluta en URL absoluta para `<Image src>` o `<img>`. */
export function resolveMediaUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const base = getPublicApiUrl().replace(/\/$/, "");
  return `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}
