/** Construye `/canales?q=&category=&page=` omitiendo valores vacíos o por defecto. */
export function buildChannelsHref(params: { q?: string; category?: string; page?: number }): string {
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.category?.trim()) qs.set("category", params.category.trim());
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  const s = qs.toString();
  return s ? `/canales?${s}` : "/canales";
}
