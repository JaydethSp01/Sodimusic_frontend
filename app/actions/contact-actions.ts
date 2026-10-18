"use server";

import { collectContactFieldErrors, contactMessageSchema, type ContactFieldErrors } from "@/features/contact/contact-schema";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

export type SendContactMessageResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: ContactFieldErrors;
      /** Código HTTP del backend cuando el error viene de él (p. ej. 429 = límite de envíos por IP). */
      status?: number;
    };

/**
 * Envía un mensaje de contacto/prensa: POST {BACKEND_URL}/api/contact/messages → 201.
 * Valida con zod y devuelve errores por campo para mostrarlos inline.
 */
export async function sendContactMessageAction(raw: unknown): Promise<SendContactMessageResult> {
  const parsed = contactMessageSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Revisa los campos marcados", fieldErrors: collectContactFieldErrors(parsed.error) };
  }
  const { phone, ...rest } = parsed.data;
  const body = { ...rest, ...(phone ? { phone } : {}) };

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/contact/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "No pudimos conectar con el servidor. Inténtalo de nuevo en un momento." };
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 429) {
      return {
        ok: false,
        status: 429,
        error: data.error ?? "Has enviado varios mensajes seguidos. Espera unos minutos o escríbenos por WhatsApp.",
      };
    }
    return { ok: false, status: res.status, error: data.error ?? "No se pudo enviar el mensaje. Inténtalo de nuevo." };
  }
  return { ok: true };
}
