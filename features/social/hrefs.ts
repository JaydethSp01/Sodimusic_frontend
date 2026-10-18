/** URL de /novedades con el filtro de tipo (`?kind=`). Sin "use client": usable desde server components. */
export function buildNovedadesHref(kind?: string): string {
  return kind ? `/novedades?kind=${encodeURIComponent(kind)}` : "/novedades";
}
