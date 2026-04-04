"use server";

import { revalidatePath } from "next/cache";
import { fetchAdmin } from "@/lib/api-admin";

export async function patchBookingSession(
  id: string,
  data: { status?: string; internalNotes?: string | null },
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin(`/api/admin/sessions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: err.error ?? "Error al actualizar" };
  }
  revalidatePath("/admin/dashboard/sessions");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}
