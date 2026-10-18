/** Ruta pública de la ficha de un artista. */
export function artistHref(slug: string): string {
  return `/artists/${encodeURIComponent(slug)}`;
}

/** `/admin/dashboard/artistas?q=&status=` omitiendo valores vacíos. */
export function buildAdminArtistsHref(params: { q?: string; status?: string }): string {
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.status) qs.set("status", params.status);
  const s = qs.toString();
  return s ? `/admin/dashboard/artistas?${s}` : "/admin/dashboard/artistas";
}
