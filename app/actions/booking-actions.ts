"use server";

import { redirect } from "next/navigation";
import { bookingFullSchema } from "@/features/booking/schemas/booking-schema";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

export type CreateBookingResult = { ok: false; error: string; fieldErrors?: Record<string, string> } | void;

/**
 * Valida y envía la sesión al backend (`POST /api/booking/sessions`).
 * Envía el contrato v3 (`policyAccepted`, `policyVersion`, `marketingOptIn`, `isAdult`)
 * junto con `acceptPolicy` para compatibilidad con el backend anterior.
 */
export async function createBookingSession(raw: unknown): Promise<CreateBookingResult> {
  const parsedInput = bookingFullSchema.safeParse(raw);
  if (!parsedInput.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsedInput.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!(key in fieldErrors)) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, error: parsedInput.error.issues[0]?.message ?? "Datos inválidos", fieldErrors };
  }
  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/booking/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedInput.data),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "No pudimos conectar con el servidor. Inténtalo de nuevo en un momento." };
  }
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
