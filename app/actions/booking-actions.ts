"use server";

import { redirect } from "next/navigation";
import { bookingFullSchema } from "@/features/booking/schemas/booking-schema";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function createBookingSession(raw: unknown): Promise<{ ok: false; error: string } | void> {
  const parsedInput = bookingFullSchema.safeParse(raw);
  if (!parsedInput.success) {
    return { ok: false, error: parsedInput.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const res = await fetch(`${backendUrl}/api/booking/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsedInput.data),
  });
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { ok: false, error: "Respuesta inválida del servidor" };
  }
  const parsed = data as { ok?: boolean; error?: string; id?: string };
  if (!res.ok || parsed.ok === false) {
    return { ok: false, error: parsed.error ?? "No se pudo crear la sesión" };
  }
  if (parsed.id) {
    redirect(`/booking/success?id=${parsed.id}`);
  }
  return { ok: false, error: "Sin id de sesión" };
}
