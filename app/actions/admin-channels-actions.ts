"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { publicTags } from "@/lib/api";
import { fetchAdmin } from "@/lib/api-admin";
import type { ChannelStatus, Paginated, YoutubeChannel } from "@/types/models";

export type CreateChannelInput = {
  name: string;
  url: string;
  channelId?: string | null;
  handle?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  featuredVideoUrl?: string | null;
  category: string;
  featured: boolean;
  status: ChannelStatus;
  sortOrder?: number;
};

export type PatchChannelInput = Partial<CreateChannelInput>;

type Result<T = undefined> = { ok: true; row?: T } | { ok: false; error: string };

function revalidateChannels() {
  revalidateTag(publicTags.channels);
  revalidatePath("/admin/dashboard/canales");
  revalidatePath("/canales");
  revalidatePath("/artists");
  revalidatePath("/");
}

async function readError(res: Response, fallback: string): Promise<string> {
  const j = (await res.json().catch(() => ({}))) as { error?: string };
  return j.error ?? fallback;
}

export async function createChannelAction(input: CreateChannelInput): Promise<Result<YoutubeChannel>> {
  const res = await fetchAdmin("/api/admin/channels", { method: "POST", body: JSON.stringify(input) });
  if (!res.ok) return { ok: false, error: await readError(res, "Error al crear el canal") };
  const row = (await res.json()) as YoutubeChannel;
  revalidateChannels();
  return { ok: true, row };
}

export async function patchChannelAction(id: string, input: PatchChannelInput): Promise<Result<YoutubeChannel>> {
  const res = await fetchAdmin(`/api/admin/channels/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.ok) return { ok: false, error: await readError(res, "Error al editar el canal") };
  const row = (await res.json()) as YoutubeChannel;
  revalidateChannels();
  return { ok: true, row };
}

export async function deleteChannelAction(id: string): Promise<Result> {
  const res = await fetchAdmin(`/api/admin/channels/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) return { ok: false, error: await readError(res, "Error al borrar el canal") };
  revalidateChannels();
  return { ok: true };
}

/** Reordena explícitamente: `sortOrder = índice` para cada id (el backend ignora los que no existan). */
export async function reorderChannelsAction(ids: string[]): Promise<Result> {
  const res = await fetchAdmin("/api/admin/channels/reorder", { method: "POST", body: JSON.stringify({ ids }) });
  if (!res.ok) return { ok: false, error: await readError(res, "Error al reordenar") };
  revalidateChannels();
  return { ok: true };
}

/** Lee TODOS los ids en orden global (sortOrder asc, createdAt desc), paginando de 200 en 200. */
async function fetchAllChannelIds(): Promise<string[] | null> {
  const ids: string[] = [];
  let page = 1;
  // Tope de seguridad: 25 páginas × 200 = 5000 canales.
  for (let i = 0; i < 25; i++) {
    const res = await fetchAdmin(`/api/admin/channels?page=${page}&pageSize=200`);
    if (!res.ok) return null;
    const data = (await res.json()) as Paginated<YoutubeChannel>;
    for (const row of data.items) ids.push(row.id);
    if (ids.length >= data.total || data.items.length === 0) break;
    page++;
  }
  return ids;
}

/**
 * Mueve `id` justo antes (`up`) o después (`down`) de `neighborId` (la fila
 * vecina visible en la tabla) dentro del orden GLOBAL y persiste con reorder.
 * Así funciona con paginación y filtros sin pisar el orden de otras páginas.
 */
export async function moveChannelAction(id: string, neighborId: string, dir: "up" | "down"): Promise<Result> {
  if (id === neighborId) return { ok: true };
  const ids = await fetchAllChannelIds();
  if (!ids) return { ok: false, error: "No se pudo leer el orden actual" };
  const without = ids.filter((x) => x !== id);
  const at = without.indexOf(neighborId);
  if (at === -1) return { ok: false, error: "El canal vecino ya no existe; recarga la página" };
  without.splice(dir === "up" ? at : at + 1, 0, id);
  return reorderChannelsAction(without);
}
