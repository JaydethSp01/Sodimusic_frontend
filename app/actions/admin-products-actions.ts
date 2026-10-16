"use server";

import { revalidatePath } from "next/cache";
import { fetchAdmin } from "@/lib/api-admin";
import type { Product, ProductStatus } from "@/types/models";

export type CreateProductInput = {
  name: string;
  slug?: string;
  description?: string | null;
  priceCOP: number;
  compareAtCOP?: number | null;
  category: string;
  images: string[];
  sizes: string[];
  stock?: number | null;
  status: ProductStatus;
  featured: boolean;
  sortOrder: number;
};

export type PatchProductInput = Partial<CreateProductInput>;

function revalidateShop() {
  revalidatePath("/admin/dashboard/tienda");
  revalidatePath("/tienda");
  revalidatePath("/");
}

async function readError(res: Response, fallback: string): Promise<string> {
  const j = (await res.json().catch(() => ({}))) as { error?: string };
  return j.error ?? fallback;
}

export async function createProductAction(
  input: CreateProductInput,
): Promise<{ ok: boolean; error?: string; row?: Product }> {
  const res = await fetchAdmin("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    return { ok: false, error: await readError(res, "Error al crear producto") };
  }
  const row = (await res.json()) as Product;
  revalidateShop();
  return { ok: true, row };
}

export async function patchProductAction(
  id: string,
  input: PatchProductInput,
): Promise<{ ok: boolean; error?: string; row?: Product }> {
  const res = await fetchAdmin(`/api/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    return { ok: false, error: await readError(res, "Error al editar producto") };
  }
  const row = (await res.json()) as Product;
  revalidateShop();
  return { ok: true, row };
}

export async function deleteProductAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin(`/api/admin/products/${id}`, { method: "DELETE" });
  if (!res.ok) {
    return { ok: false, error: await readError(res, "Error al borrar producto") };
  }
  revalidateShop();
  return { ok: true };
}
