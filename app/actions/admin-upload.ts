"use server";

import { getBackendAccessToken } from "@/lib/server-token";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function uploadAdminFile(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  const token = await getBackendAccessToken();
  if (!token) {
    return { ok: false, error: "No autorizado" };
  }
  const res = await fetch(`${backendUrl}/api/admin/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: j.error ?? "Error al subir" };
  }
  const data = (await res.json()) as { url: string };
  return { ok: true, url: data.url };
}
