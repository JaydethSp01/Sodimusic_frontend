import { z } from "zod";

/** Asunto con el que se guardan las cotizaciones de la portada (badge «Cotización» y KPI de leads en el admin). */
export const LEAD_SUBJECT = "COTIZACION";

/** Esquema compartido (cliente + server action) del formulario de contacto/prensa. */
export const contactMessageSchema = z.object({
  subject: z.string().trim().min(1, "Elige un asunto").max(40),
  name: z.string().trim().min(2, "Escribe tu nombre").max(120, "Máximo 120 caracteres"),
  email: z.string().trim().email("Escribe un correo válido").max(160),
  phone: z
    .string()
    .trim()
    .max(30, "Máximo 30 caracteres")
    .refine((v) => v === "" || /^[+\d][\d\s().-]{6,}$/.test(v), "Escribe un teléfono válido (solo números)"),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(3000, "Máximo 3000 caracteres"),
  policyAccepted: z.literal(true, { message: "Necesitamos tu autorización para responderte" }),
  policyVersion: z.string().trim().min(1),
});

export type ContactMessageInput = z.input<typeof contactMessageSchema>;
export type ContactFieldName = "subject" | "name" | "email" | "phone" | "message" | "policyAccepted";
export type ContactFieldErrors = Partial<Record<ContactFieldName, string>>;

const FIELD_NAMES: readonly string[] = ["subject", "name", "email", "phone", "message", "policyAccepted"];

/** Primer mensaje de error por campo (para `aria-describedby`). */
export function collectContactFieldErrors(error: z.ZodError): ContactFieldErrors {
  const fieldErrors: ContactFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && FIELD_NAMES.includes(key)) {
      const k = key as ContactFieldName;
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
  }
  return fieldErrors;
}
