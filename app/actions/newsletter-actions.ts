"use server";

import { z } from "zod";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

const subscribeSchema = z.object({
  email: z.string().trim().email("Escribe un correo válido"),
  name: z.string().trim().max(120).optional(),
  source: z.string().trim().max(40).default("footer"),
  policyAccepted: z.literal(true, { message: "Debes autorizar el tratamiento de tus datos" }),
  policyVersion: z.string().trim().min(1),
});

export type SubscribeNewsletterResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Suscribe un correo al boletín: POST {BACKEND_URL}/api/newsletter/subscribe
 * (201 siempre; 400 si no acepta la política; 429 si hay demasiadas solicitudes).
 */
export async function subscribeNewsletterAction(raw: unknown): Promise<SubscribeNewsletterResult> {
  const parsed = subscribeSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "No pudimos conectar con el servidor. Inténtalo de nuevo en un momento." };
  }
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || data.ok === false) {
    return {
      ok: false,
      error:
        res.status === 429
          ? "Demasiadas solicitudes. Inténtalo de nuevo en unos minutos."
          : (data.error ?? "No se pudo completar la suscripción"),
    };
  }
  return { ok: true };
}
