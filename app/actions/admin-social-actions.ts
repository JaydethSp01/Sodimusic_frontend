"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { publicTags } from "@/lib/api";
import { fetchAdmin } from "@/lib/api-admin";
import type { SocialPost, SocialSource, SocialSourceKind, SocialSyncSummary } from "@/types/models";

export type CreateSocialSourceInput = {
  kind: SocialSourceKind;
  label?: string;
  externalId?: string;
  url?: string;
};

export type PatchSocialSourceInput = { label?: string; enabled?: boolean };

export type CreateSocialPostInput = {
  url: string;
  title?: string;
  text?: string;
  imageUrl?: string;
  /** ISO date */
  publishedAt?: string;
  author?: string;
};

export type PatchSocialPostInput = {
  status?: "VISIBLE" | "HIDDEN";
  pinned?: boolean;
  title?: string;
  text?: string;
  imageUrl?: string;
};

type Result<T = undefined> = { ok: true; row?: T } | { ok: false; error: string };

function revalidateSocial() {
  revalidateTag(publicTags.social);
  revalidatePath("/admin/dashboard/novedades");
  revalidatePath("/novedades");
  revalidatePath("/");
}

async function readError(res: Response, fallback: string): Promise<string> {
  const j = (await res.json().catch(() => ({}))) as { error?: string };
  return j.error ?? fallback;
}

/* ---------------------------------- sync --------------------------------- */

/** POST /api/admin/social/sync → sincroniza todas las fuentes activas (forzado). */
export async function syncSocialAction(): Promise<Result<SocialSyncSummary>> {
  const res = await fetchAdmin("/api/admin/social/sync", { method: "POST", body: "{}" });
  if (!res.ok) return { ok: false, error: await readError(res, "No se pudo sincronizar") };
  const row = (await res.json()) as SocialSyncSummary;
  revalidateSocial();
  return { ok: true, row };
}

/* --------------------------------- sources -------------------------------- */

export async function createSocialSourceAction(input: CreateSocialSourceInput): Promise<Result<SocialSource>> {
  const res = await fetchAdmin("/api/admin/social/sources", { method: "POST", body: JSON.stringify(input) });
  if (!res.ok) return { ok: false, error: await readError(res, "No se pudo añadir la fuente") };
  const row = (await res.json()) as SocialSource;
  revalidateSocial();
  return { ok: true, row };
}

export async function patchSocialSourceAction(id: string, input: PatchSocialSourceInput): Promise<Result<SocialSource>> {
  const res = await fetchAdmin(`/api/admin/social/sources/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.ok) return { ok: false, error: await readError(res, "No se pudo actualizar la fuente") };
  const row = (await res.json()) as SocialSource;
  revalidateSocial();
  return { ok: true, row };
}

export async function deleteSocialSourceAction(id: string): Promise<Result> {
  const res = await fetchAdmin(`/api/admin/social/sources/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) return { ok: false, error: await readError(res, "No se pudo borrar la fuente") };
  revalidateSocial();
  return { ok: true };
}

/* ---------------------------------- posts --------------------------------- */

/** POST /api/admin/social/posts: carga manual por URL (idempotente por `externalId`). */
export async function createSocialPostAction(input: CreateSocialPostInput): Promise<Result<SocialPost>> {
  const res = await fetchAdmin("/api/admin/social/posts", { method: "POST", body: JSON.stringify(input) });
  if (!res.ok) return { ok: false, error: await readError(res, "No se pudo añadir el enlace") };
  const row = (await res.json()) as SocialPost;
  revalidateSocial();
  return { ok: true, row };
}

export async function patchSocialPostAction(id: string, input: PatchSocialPostInput): Promise<Result<SocialPost>> {
  const res = await fetchAdmin(`/api/admin/social/posts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.ok) return { ok: false, error: await readError(res, "No se pudo actualizar la publicación") };
  const row = (await res.json()) as SocialPost;
  revalidateSocial();
  return { ok: true, row };
}

export async function deleteSocialPostAction(id: string): Promise<Result> {
  const res = await fetchAdmin(`/api/admin/social/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) return { ok: false, error: await readError(res, "No se pudo borrar la publicación") };
  revalidateSocial();
  return { ok: true };
}
