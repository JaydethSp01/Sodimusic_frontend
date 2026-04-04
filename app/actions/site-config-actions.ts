"use server";

import { revalidateTag } from "next/cache";
import { fetchAdmin } from "@/lib/api-admin";
import type { SiteContent } from "@/types/site-content";

export async function saveSiteDraftAction(content: SiteContent): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin("/api/admin/site-config/draft", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: j.error ?? "Error al guardar borrador" };
  }
  return { ok: true };
}

export async function publishSiteAction(): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin("/api/admin/site-config/publish", { method: "POST" });
  if (!res.ok) {
    return { ok: false, error: "No se pudo publicar" };
  }
  revalidateTag("site-config");
  return { ok: true };
}
