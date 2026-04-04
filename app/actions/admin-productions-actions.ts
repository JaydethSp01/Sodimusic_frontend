"use server";

import { revalidatePath } from "next/cache";
import { fetchAdmin } from "@/lib/api-admin";
import type { Production } from "@/types/models";

type CreateProductionInput = {
  title: string;
  artistName: string;
  artistCity: string;
  artistCountry: string;
  year: number;
  genre: string;
  coverUrl?: string | null;
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
  featured?: boolean;
};

type PatchProductionInput = Partial<CreateProductionInput>;

export async function createProductionAction(
  input: CreateProductionInput,
): Promise<{ ok: boolean; error?: string; row?: Production }> {
  const res = await fetchAdmin("/api/admin/productions", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: j.error ?? "Error al crear producción" };
  }
  const row = (await res.json()) as Production;
  revalidatePath("/admin/dashboard/productions");
  revalidatePath("/productions");
  revalidatePath("/");
  return { ok: true, row };
}

export async function patchProductionAction(id: string, input: PatchProductionInput): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin(`/api/admin/productions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: j.error ?? "Error al editar producción" };
  }
  revalidatePath("/admin/dashboard/productions");
  revalidatePath("/productions");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteProductionAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin(`/api/admin/productions/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: j.error ?? "Error al borrar producción" };
  }
  revalidatePath("/admin/dashboard/productions");
  revalidatePath("/productions");
  revalidatePath("/");
  return { ok: true };
}

