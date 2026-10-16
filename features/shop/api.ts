import { fetchPublic } from "@/lib/api";
import type { Product } from "@/types/models";

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
}

const EMPTY: ProductListResponse = { items: [], total: 0, page: 1, pageSize: 0, categories: [] };

export async function fetchProducts(
  params: { category?: string; featured?: boolean; page?: number; pageSize?: number } = {},
  revalidate = 60,
): Promise<ProductListResponse> {
  const qs = new URLSearchParams();
  if (params.category) {
    qs.set("category", params.category);
  }
  if (params.featured) {
    qs.set("featured", "1");
  }
  if (params.page) {
    qs.set("page", String(params.page));
  }
  if (params.pageSize) {
    qs.set("pageSize", String(params.pageSize));
  }
  const query = qs.toString();
  try {
    const res = await fetchPublic(`/api/products${query ? `?${query}` : ""}`, { next: { revalidate } });
    if (!res.ok) {
      return EMPTY;
    }
    const data = (await res.json()) as Partial<ProductListResponse>;
    return {
      items: Array.isArray(data.items) ? data.items : [],
      total: typeof data.total === "number" ? data.total : 0,
      page: typeof data.page === "number" ? data.page : 1,
      pageSize: typeof data.pageSize === "number" ? data.pageSize : 0,
      categories: Array.isArray(data.categories) ? data.categories.filter((c): c is string => typeof c === "string") : [],
    };
  } catch {
    return EMPTY;
  }
}

/** `null` si no existe (404) o si la API no responde. */
export async function fetchProductBySlug(slug: string, revalidate = 60): Promise<Product | null> {
  try {
    const res = await fetchPublic(`/api/products/by-slug/${encodeURIComponent(slug)}`, { next: { revalidate } });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as Product;
  } catch {
    return null;
  }
}

export function isSoldOut(p: Pick<Product, "status" | "stock">): boolean {
  return p.status === "SOLD_OUT" || p.stock === 0;
}
