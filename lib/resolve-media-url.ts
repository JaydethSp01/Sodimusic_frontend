import { getPublicApiUrl } from "@/lib/api";

/**
 * Convierte `/uploads/...` (servido por el backend) o una URL absoluta en URL absoluta para `<Image src>` o `<img>`.
 * Otras rutas raíz (`/logosodi.jpeg`, `/maria_la_bajafoto.jpg`) son assets del propio frontend y se devuelven tal cual.
 */
export function resolveMediaUrl(pathOrUrl: string): string {
  const v = pathOrUrl.trim();
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("data:")) {
    return v;
  }
  const base = getPublicApiUrl().replace(/\/$/, "");
  if (v.startsWith("/uploads/") || v.startsWith("uploads/")) {
    return `${base}${v.startsWith("/") ? v : `/${v}`}`;
  }
  return v.startsWith("/") ? v : `/${v}`;
}
