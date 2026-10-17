import { z } from "zod";

export const musicReferenceSchema = z
  .string()
  .trim()
  .min(1, "Pega un enlace de Spotify, YouTube o SoundCloud")
  .url("Debe ser un enlace válido (empieza por https://)")
  .refine(
    (url) => {
      const u = url.toLowerCase();
      return u.includes("spotify.com") || u.includes("youtu") || u.includes("soundcloud.com");
    },
    { message: "Usa un enlace de Spotify, YouTube o SoundCloud" },
  );

export const bookingStep2Schema = z.object({
  artisticName: z.string().trim().min(1, "Escribe tu nombre artístico"),
  genres: z.array(z.string()).min(1, "Elige al menos un género"),
  musicReference: musicReferenceSchema,
  vision: z.string().max(500, "Máximo 500 caracteres").optional(),
  isFirstTime: z.boolean(),
});

export const phoneSchema = z
  .string()
  .trim()
  .min(8, "Escribe tu número de WhatsApp")
  .regex(/^\+?[\d\s\-()]+$/, "Solo números, espacios y el prefijo +");

export const bookingStep4Schema = z.object({
  fullName: z.string().trim().min(2, "Escribe tu nombre completo"),
  phone: phoneSchema,
  email: z.string().trim().email("Escribe un email válido"),
  instagram: z.string().trim().max(64, "Máximo 64 caracteres").optional(),
});

export const bookingStep5Schema = z.object({
  isAdult: z.boolean({ message: "Indícanos si eres mayor de 18 años" }),
  policyAccepted: z.boolean().refine((v) => v === true, {
    message: "Debes autorizar el tratamiento de tus datos para confirmar",
  }),
  cancellationAccepted: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar la política de anticipo y cancelación",
  }),
});

export const timeSlotSchema = z.enum(["morning", "afternoon", "night"]);

export const bookingFullSchema = z.object({
  serviceTypes: z
    .array(
      z.enum([
        "VOCAL_RECORDING",
        "BEAT_PRODUCTION",
        "COPRODUCTION",
        "MIX_MASTER",
        "AUDIOVISUAL_PRODUCTION",
        "CONSULTING",
      ]),
    )
    .min(1, "Selecciona al menos un servicio"),
  artisticName: z.string().trim().min(1, "Nombre artístico obligatorio"),
  fullName: z.string().trim().min(2, "Nombre completo obligatorio"),
  genres: z.array(z.string()).min(1, "Elige al menos un género"),
  musicReference: musicReferenceSchema,
  vision: z.string().max(500).optional().nullable(),
  isFirstTime: z.boolean(),
  scheduledDate: z.coerce.date(),
  timeSlot: timeSlotSchema,
  phone: phoneSchema,
  email: z.string().trim().email("Email inválido"),
  instagram: z.string().optional(),
  /** Compatibilidad con el backend anterior (política de cancelación) */
  acceptPolicy: z.boolean().refine((v) => v === true, { message: "Debes aceptar la política" }),
  /** Contrato v3 (§2): consentimiento de datos personales */
  policyAccepted: z.literal(true, { message: "Debes autorizar el tratamiento de tus datos" }),
  policyVersion: z.string().min(1),
  marketingOptIn: z.boolean().default(false),
  isAdult: z.boolean(),
});

export type BookingFullInput = z.infer<typeof bookingFullSchema>;

/** Convierte los issues de zod en un mapa campo → primer mensaje. */
export function issuesToFieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) {
      out[key] = issue.message;
    }
  }
  return out;
}
