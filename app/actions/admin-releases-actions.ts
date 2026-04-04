"use server";

import { revalidatePath } from "next/cache";
import { fetchAdmin } from "@/lib/api-admin";
import type { Release } from "@/types/models";

type CreateReleaseInput = {
  title: string;
  slug: string;
  artistName: string;
  genre: string;
  releaseYear: number;
  coverUrl?: string | null;
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
  description?: string | null;
  featured?: boolean;
  upcoming?: boolean;
};

type PatchReleaseInput = Partial<CreateReleaseInput> & {
  upcoming?: boolean;
};

export async function createReleaseAction(
  input: CreateReleaseInput,
): Promise<{ ok: boolean; error?: string; row?: Release }> {
  const res = await fetchAdmin("/api/admin/releases", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: j.error ?? "Error al crear release" };
  }
  const row = (await res.json()) as Release;
  revalidatePath("/admin/dashboard/releases");
  revalidatePath("/releases");
  revalidatePath(`/releases/${row.slug}`);
  return { ok: true, row };
}

export async function patchReleaseAction(
  id: string,
  input: PatchReleaseInput,
  previousSlug?: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin(`/api/admin/releases/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: j.error ?? "Error al editar release" };
  }
  const row = (await res.json()) as { slug: string };
  revalidatePath("/admin/dashboard/releases");
  revalidatePath("/releases");
  revalidatePath(`/releases/${row.slug}`);
  if (previousSlug && previousSlug !== row.slug) {
    revalidatePath(`/releases/${previousSlug}`);
  }
  return { ok: true };
}

export async function deleteReleaseAction(id: string, slug?: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin(`/api/admin/releases/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: j.error ?? "Error al borrar release" };
  }
  revalidatePath("/admin/dashboard/releases");
  revalidatePath("/releases");
  if (slug) {
    revalidatePath(`/releases/${slug}`);
  }
  return { ok: true };
}

