import { z } from "zod";

export const beatLicenseTypeSchema = z.enum(["MP3", "WAV", "STEMS", "EXCLUSIVE"]);

export const beatInterestSchema = z.object({
  beatId: z.string().min(1),
  artistName: z.string().trim().min(1, "Escribe tu nombre artístico"),
  email: z.string().trim().email("Escribe un email válido"),
  phone: z
    .string()
    .trim()
    .min(10, "Escribe tu número de WhatsApp con indicativo")
    .refine(
      (v) => /^\+?57\d{10}$|^\+?\d{10,15}$/.test(v.replace(/[\s\-()]/g, "")),
      "Usa formato +57 300 000 0000 u otro internacional válido",
    ),
  licenseType: beatLicenseTypeSchema,
  /** Compatibilidad con el backend anterior: true si la licencia es exclusiva */
  exclusiveIntent: z.boolean(),
  instagram: z.string().trim().max(64, "Máximo 64 caracteres").optional(),
  message: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
  policyAccepted: z.boolean().refine((v) => v === true, {
    message: "Debes autorizar el tratamiento de tus datos para continuar",
  }),
  policyVersion: z.string().min(1),
  marketingOptIn: z.boolean(),
});

export type BeatInterestInput = z.infer<typeof beatInterestSchema>;
