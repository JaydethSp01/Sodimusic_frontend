"use server";

import { revalidatePath } from "next/cache";
import { fetchAdmin } from "@/lib/api-admin";
import type { ContactMessage, ContactStatus } from "@/types/models";

async function readError(res: Response, fallback: string): Promise<string> {
  const j = (await res.json().catch(() => ({}))) as { error?: string };
  return j.error ?? fallback;
}

/** PATCH /api/admin/messages/:id { status } — marcar leído, archivar o reabrir. */
export async function patchMessageStatusAction(
  id: string,
  status: ContactStatus,
): Promise<{ ok: boolean; error?: string; row?: ContactMessage }> {
  const res = await fetchAdmin(`/api/admin/messages/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    return { ok: false, error: await readError(res, "No se pudo actualizar el mensaje") };
  }
  const row = (await res.json()) as ContactMessage;
  revalidatePath("/admin/dashboard/mensajes");
  revalidatePath("/admin/dashboard");
  return { ok: true, row };
}

/**
 * Proxy del CSV de suscriptores: GET /api/admin/subscribers/export con el token en cabecera
 * (nunca en la URL). Devuelve el texto CSV para que el cliente lo descargue como Blob.
 */
export async function exportSubscribersCsvAction(): Promise<
  { ok: true; csv: string; filename: string } | { ok: false; error: string }
> {
  const res = await fetchAdmin("/api/admin/subscribers/export", { method: "GET" });
  if (!res.ok) {
    return { ok: false, error: await readError(res, "No se pudo exportar el CSV") };
  }
  const csv = await res.text();
  const disposition = res.headers.get("content-disposition") ?? "";
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  const filename = match?.[1] ?? `suscriptores-${new Date().toISOString().slice(0, 10)}.csv`;
  return { ok: true, csv, filename };
}
