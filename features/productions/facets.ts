import { fetchPublic } from "@/lib/api";
import type { Production } from "@/types/models";

export interface ProductionFacets {
  /** Años con al menos una producción, de más reciente a más antiguo. */
  years: number[];
  /** Países tal como los entiende el filtro del backend (Colombia, México, Otro). */
  countries: string[];
}

/** El backend limita `pageSize` a 48; con 5 páginas cubrimos hasta 240 producciones (ordenadas por año desc). */
const PAGE_SIZE = 48;
const MAX_PAGES = 5;
/** Países con filtro propio en `/api/productions`; el resto se agrupa en «Otro». */
const KNOWN_COUNTRIES = ["Colombia", "México"] as const;

type ListResponse = { items: Pick<Production, "year" | "artistCountry">[]; total: number };

/**
 * Deriva las opciones de año y país del catálogo real (no hay endpoint de facets):
 * recorre `/api/productions` por páginas y acumula los valores presentes.
 */
export async function fetchProductionFacets(): Promise<ProductionFacets> {
  const years = new Set<number>();
  const countries = new Set<string>();
  let hasOther = false;

  for (let page = 1; page <= MAX_PAGES; page++) {
    let data: ListResponse;
    try {
      const res = await fetchPublic(`/api/productions?page=${page}&pageSize=${PAGE_SIZE}`, { next: { revalidate: 60 } });
      if (!res.ok) {
        break;
      }
      data = (await res.json()) as ListResponse;
    } catch {
      break;
    }
    for (const item of data.items) {
      if (Number.isFinite(item.year)) {
        years.add(item.year);
      }
      const country = item.artistCountry?.trim();
      if (!country) {
        continue;
      }
      if ((KNOWN_COUNTRIES as readonly string[]).includes(country)) {
        countries.add(country);
      } else {
        hasOther = true;
      }
    }
    if (data.items.length < PAGE_SIZE || page * PAGE_SIZE >= data.total) {
      break;
    }
  }

  return {
    years: Array.from(years).sort((a, b) => b - a),
    countries: [...KNOWN_COUNTRIES.filter((c) => countries.has(c)), ...(hasOther ? ["Otro"] : [])],
  };
}
