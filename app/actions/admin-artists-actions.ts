"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { publicTags } from "@/lib/api";
import { fetchAdmin } from "@/lib/api-admin";
import type { Artist, ArtistStatus } from "@/types/models";

export type CreateArtistInput = {
  slug?: string;
  name: string;
  role: string;
  shortBio?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  coverUrl?: string | null;
  city?: string | null;
  genres: string[];
  spotifyUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  facebookUrl?: string | null;
  appleUrl?: string | null;
  youtubeChannelId?: string | null;
  aliases: string[];
  featured: boolean;
  status: ArtistStatus;
  sortOrder?: number;
};

export type PatchArtistInput = Partial<CreateArtistInput>;

type Result<T = undefined> = { ok: true; row?: T } | { ok: false; error: string };

function revalidateArtists(slugs: Array<string | null | undefined> = []) {
  revalidateTag(publicTags.artists);
  revalidatePath("/admin/dashboard/artistas");
  revalidatePath("/artists");
  for (const slug of slugs) if (slug) revalidatePath(`/artists/${slug}`);
  revalidatePath("/sitemap.xml");
}

async function readError(res: Response, fallback: string): Promise<string> {
  const j = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  return j.error ?? j.message ?? fallback;
}

export async function createArtistAction(input: CreateArtistInput): Promise<Result<Artist>> {
  const res = await fetchAdmin("/api/admin/artists", { method: "POST", body: JSON.stringify(input) });
  if (!res.ok) return { ok: false, error: await readError(res, "Error al crear el artista") };
  const row = (await res.json()) as Artist;
  revalidateArtists([row.slug]);
  return { ok: true, row };
}

export async function patchArtistAction(id: string, input: PatchArtistInput, previousSlug?: string): Promise<Result<Artist>> {
  const res = await fetchAdmin(`/api/admin/artists/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!res.ok) return { ok: false, error: await readError(res, "Error al editar el artista") };
  const row = (await res.json()) as Artist;
  revalidateArtists([row.slug, previousSlug]);
  return { ok: true, row };
}

export async function deleteArtistAction(id: string, slug?: string): Promise<Result> {
  const res = await fetchAdmin(`/api/admin/artists/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) return { ok: false, error: await readError(res, "Error al borrar el artista") };
  revalidateArtists([slug]);
  return { ok: true };
}

/** Reordena explícitamente: `sortOrder = índice` para cada id (el backend ignora los que no existan). */
export async function reorderArtistsAction(ids: string[]): Promise<Result> {
  const res = await fetchAdmin("/api/admin/artists/reorder", { method: "POST", body: JSON.stringify({ ids }) });
  if (!res.ok) return { ok: false, error: await readError(res, "Error al reordenar") };
  revalidateArtists();
  return { ok: true };
}

/** Lee TODOS los ids en el orden global del admin (sin filtros). Tolera `{ items }` y arrays planos. */
async function fetchAllArtistIds(): Promise<string[] | null> {
  const res = await fetchAdmin("/api/admin/artists");
  if (!res.ok) return null;
  const data = (await res.json()) as { items?: Artist[] } | Artist[];
  const items = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
  return items.map((a) => a.id);
}

/**
 * Mueve `id` justo antes (`up`) o después (`down`) de `neighborId` (la fila vecina visible) dentro del
 * orden GLOBAL y persiste con reorder, para que funcione con filtros sin pisar el orden del resto.
 */
export async function moveArtistAction(id: string, neighborId: string, dir: "up" | "down"): Promise<Result> {
  if (id === neighborId) return { ok: true };
  const ids = await fetchAllArtistIds();
  if (!ids) return { ok: false, error: "No se pudo leer el orden actual" };
  const without = ids.filter((x) => x !== id);
  const at = without.indexOf(neighborId);
  if (at === -1) return { ok: false, error: "El artista vecino ya no existe; recarga la página" };
  without.splice(dir === "up" ? at : at + 1, 0, id);
  return reorderArtistsAction(without);
}
