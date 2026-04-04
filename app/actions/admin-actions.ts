"use server";

import { revalidatePath } from "next/cache";
import { fetchAdmin } from "@/lib/api-admin";

export type CreateSessionInput = {
  serviceType: string;
  artistName: string;
  artistEmail: string;
  artistPhone: string;
  artistInstagram?: string | null;
  musicReference: string;
  vision?: string | null;
  genres: string;
  scheduledDate: string;
  timeSlot: "morning" | "afternoon" | "night";
  internalNotes?: string | null;
  isFirstTime?: boolean;
};

export async function createBookingSessionAdmin(
  data: CreateSessionInput,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const res = await fetchAdmin("/api/admin/sessions", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: err.error ?? "No se pudo crear la sesión" };
  }
  const row = (await res.json()) as { id: string };
  revalidatePath("/admin/dashboard/sessions");
  revalidatePath("/admin/dashboard/calendar");
  revalidatePath("/admin/dashboard");
  return { ok: true, id: row.id };
}

export async function deleteBookingSession(id: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin(`/api/admin/sessions/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: err.error ?? "No se pudo eliminar" };
  }
  revalidatePath("/admin/dashboard/sessions");
  revalidatePath("/admin/dashboard/calendar");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function adminBlockDate(
  date: string,
  reason?: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin("/api/admin/blocked-dates", {
    method: "POST",
    body: JSON.stringify({ date, reason: reason?.trim() || undefined }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: err.error ?? "No se pudo bloquear el día" };
  }
  revalidatePath("/admin/dashboard/calendar");
  return { ok: true };
}

export async function adminUnblockDate(id: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetchAdmin(`/api/admin/blocked-dates/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: err.error ?? "No se pudo desbloquear" };
  }
  revalidatePath("/admin/dashboard/calendar");
  return { ok: true };
}

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
