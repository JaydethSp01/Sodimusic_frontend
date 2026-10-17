"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { publicTags } from "@/lib/api";
import { fetchAdmin } from "@/lib/api-admin";
import type { Beat } from "@/types/models";

type CreateBeatInput = {
  title: string;
  genre: string;
  bpm?: number | null;
  mood?: string | null;
  priceCOP: number;
  /** Precios por licencia (null = no se ofrece esa licencia) */
  priceMp3COP?: number | null;
  priceWavCOP?: number | null;
  priceStemsCOP?: number | null;
  priceExclusiveCOP?: number | null;
  status: "AVAILABLE" | "SOLD" | "EXCLUSIVE";
  /** Preview MP3 */
  audioUrl?: string | null;
  coverUrl?: string | null;
  exclusive?: boolean;
};

type PatchBeatInput = Partial<Omit<CreateBeatInput, "status">> & {
  status?: "AVAILABLE" | "SOLD" | "EXCLUSIVE";
};

export async function createBeatAction(input: CreateBeatInput): Promise<{ ok: boolean; error?: string; row?: Beat }> {
  const res = await fetchAdmin("/api/admin/beats", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: j.error ?? "Error al crear beat" };
  }
  const row = (await res.json()) as Beat;
  revalidateTag(publicTags.beats);
  revalidatePath("/admin/dashboard/beats");
  revalidatePath("/beats");
  return { ok: true, row };
}

export async function patchBeatAction(id: string, input: PatchBeatInput): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin(`/api/admin/beats/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: j.error ?? "Error al editar beat" };
  }
  revalidateTag(publicTags.beats);
  revalidatePath("/admin/dashboard/beats");
  revalidatePath("/beats");
  return { ok: true };
}

export async function deleteBeatAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin(`/api/admin/beats/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: j.error ?? "Error al borrar beat" };
  }
  revalidateTag(publicTags.beats);
  revalidatePath("/admin/dashboard/beats");
  revalidatePath("/beats");
  return { ok: true };
}

