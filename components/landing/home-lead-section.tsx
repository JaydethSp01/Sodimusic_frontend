"use client";

import { useId, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { Check, CheckCircle2, Send } from "lucide-react";
import { z } from "zod";
import { sendContactMessageAction } from "@/app/actions/contact-actions";
import { LEAD_SUBJECT } from "@/features/contact/contact-schema";
import { ConsentCheckbox } from "@/components/shared/consent-checkbox";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { FormField } from "@/components/ds/form-field";
import { HomeFadeSection } from "@/components/landing/home-page-motion";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FieldError } from "@/components/ui/field-error";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { SiteHomeLead } from "@/types/site-content";

const leadSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(120, "Máximo 120 caracteres"),
  phone: z
    .string()
    .trim()
    .min(7, "Escribe tu WhatsApp (solo números)")
    .max(30, "Máximo 30 caracteres")
    .refine((v) => /^[+\d][\d\s().-]{6,}$/.test(v), "Escribe un WhatsApp válido (solo números)"),
  email: z.string().trim().email("Escribe un correo válido").max(160),
  service: z.string().trim().min(1, "Elige un servicio"),
  message: z.string().trim().max(500, "Máximo 500 caracteres"),
  policyAccepted: z.literal(true, { message: "Necesitamos tu autorización para responderte" }),
});

type LeadField = "name" | "phone" | "email" | "service" | "message" | "policyAccepted";
type LeadErrors = Partial<Record<LeadField, string>>;
type Status = { kind: "idle" } | { kind: "error"; message: string; rateLimited?: boolean } | { kind: "success" };

const FIELDS: readonly string[] = ["name", "phone", "email", "service", "message", "policyAccepted"];

function collectErrors(error: z.ZodError): LeadErrors {
  const out: LeadErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && FIELDS.includes(key)) {
      const k = key as LeadField;
      if (!out[k]) out[k] = issue.message;
    }
  }
  return out;
}

/** Texto del mensaje que se guarda en el CRM (el backend exige ≥ 10 caracteres). */
export function composeLeadMessage(input: { service: string; phone: string; message: string }): string {
  const lines = [`Servicio: ${input.service}`, `WhatsApp: ${input.phone}`];
  if (input.message.trim()) lines.push(`Mensaje: ${input.message.trim()}`);
  lines.push("Origen: formulario de cotización (portada)");
  return lines.join("\n");
}

/** Enlace wa.me con el mensaje prellenado para seguir la conversación tras enviar el formulario. */
export function buildLeadWhatsAppUrl(phone: string, input: { businessName: string; name: string; service: string; message: string }): string {
  const text = [
    `Hola ${input.businessName}, soy ${input.name.trim()}.`,
    `Acabo de pedir una cotización en la web: ${input.service}.`,
    input.message.trim() ? input.message.trim() : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

interface HomeLeadSectionProps {
  lead: SiteHomeLead;
  /** Títulos de `site.booking.services[]` (chips de servicio). */
  services: string[];
  businessName: string;
  policyVersion: string;
  /** WhatsApp E.164 sin «+» (site.contact.whatsapp). */
  whatsapp: string;
  id?: string;
  className?: string;
}

/**
 * Captación de cotizaciones (leads): dos columnas sobre ink-1 con línea fire. Izquierda: eyebrow, título
 * (acento «tema»), subtítulo, beneficios y enlace directo a WhatsApp. Derecha: formulario corto (nombre,
 * WhatsApp, correo, servicio como chips radio, mensaje opcional, consentimiento) que envía por la server
 * action de contacto con `subject: "COTIZACION"`. Éxito: `successMessage` + botón de WhatsApp prellenado.
 */
export function HomeLeadSection({ lead, services, businessName, policyVersion, whatsapp, id = "lead-title", className }: HomeLeadSectionProps) {
  const uid = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, start] = useTransition();

  const fieldId = (f: string) => `${uid}-${f}`;
  const errorId = (f: string) => `${uid}-${f}-error`;
  const waPhone = whatsapp.replace(/\D/g, "");
  const directWa = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`Hola ${businessName}, quiero una cotización para grabar un tema.`)}`
    : null;

  function clearError(field: LeadField) {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function onServiceKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
    const radios = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("[role='radio']:not(:disabled)"));
    const i = radios.findIndex((r) => r === document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = radios[(i + dir + radios.length) % radios.length];
    next.focus();
    next.click();
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = leadSchema.safeParse({ name, phone, email, service, message, policyAccepted: accepted as true });
    if (!parsed.success) {
      const fe = collectErrors(parsed.error);
      setErrors(fe);
      setStatus({ kind: "error", message: "Revisa los campos marcados." });
      const first = (Object.keys(fe) as LeadField[])[0];
      if (first && first !== "policyAccepted") document.getElementById(fieldId(first))?.focus();
      return;
    }
    setErrors({});
    setStatus({ kind: "idle" });
    const data = parsed.data;
    start(async () => {
      const r = await sendContactMessageAction({
        subject: LEAD_SUBJECT,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: composeLeadMessage({ service: data.service, phone: data.phone, message: data.message }),
        policyAccepted: true,
        policyVersion,
      });
      if (!r.ok) {
        if (r.fieldErrors) {
          setErrors({
            name: r.fieldErrors.name,
            phone: r.fieldErrors.phone,
            email: r.fieldErrors.email,
            message: r.fieldErrors.message,
            policyAccepted: r.fieldErrors.policyAccepted,
          });
        }
        setStatus({ kind: "error", message: r.error, rateLimited: r.status === 429 });
        return;
      }
      setStatus({ kind: "success" });
    });
  }

  const successWa = waPhone ? buildLeadWhatsAppUrl(waPhone, { businessName, name, service, message }) : null;

  return (
    <HomeFadeSection className={cn("border-t border-line-fire bg-ink-1 py-section", className)} aria-labelledby={id}>
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Izquierda: propuesta */}
        <div className="lg:col-span-5">
          {lead.eyebrow ? <Eyebrow tone="fire">{lead.eyebrow}</Eyebrow> : null}
          <Heading as="h2" id={id} size="display-md" accent="tema" className="mt-4 text-text-1">
            {lead.title}
          </Heading>
          {lead.subtitle ? (
            <Text size="body-lg" tone="2" className="mt-4 max-w-prose">
              {lead.subtitle}
            </Text>
          ) : null}
          {lead.bullets.length ? (
            <ul className="mt-8 space-y-4" aria-label="Beneficios">
              {lead.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-body text-text-1">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-fire-500/40 bg-fire-500/[0.12] text-fire-400">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {directWa ? (
            <Button asChild variant="outline" className="mt-8 w-full sm:w-auto">
              <a href={directWa} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="h-5 w-5" />
                {lead.whatsappLabel}
              </a>
            </Button>
          ) : null}
        </div>

        {/* Derecha: formulario */}
        <div className="lg:col-span-7">
          {status.kind === "success" ? (
            <div
              role="status"
              aria-live="polite"
              data-testid="lead-success"
              className="flex flex-col items-start gap-5 rounded-lg border border-line-1 bg-ink-2 p-6 shadow-card sm:p-8"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-success/40 bg-success/[0.12] text-success">
                <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <Heading as="h3" size="display-sm">
                  {lead.successMessage}
                </Heading>
                <Text as="p" size="body" tone="2" prose className="mt-3">
                  Gracias, <span className="font-semibold text-text-1">{name.trim()}</span>. Si quieres adelantar, sigue la conversación por WhatsApp.
                </Text>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {successWa ? (
                  <Button asChild size="lg" variant="whatsapp">
                    <a href={successWa} target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon className="h-5 w-5" />
                      {lead.whatsappLabel}
                    </a>
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setName("");
                    setPhone("");
                    setEmail("");
                    setService("");
                    setMessage("");
                    setAccepted(false);
                    setStatus({ kind: "idle" });
                  }}
                >
                  Enviar otra cotización
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              noValidate
              aria-label="Cotización"
              aria-describedby={`${uid}-form-status`}
              className="space-y-5 rounded-lg border border-line-1 bg-ink-2 p-5 shadow-card sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField id={fieldId("name")} label="Nombre" required error={errors.name}>
                  <Input
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError("name");
                    }}
                    disabled={pending}
                  />
                </FormField>
                <FormField id={fieldId("phone")} label="WhatsApp" required error={errors.phone}>
                  <Input
                    type="tel"
                    name="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+57 300 000 0000"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearError("phone");
                    }}
                    disabled={pending}
                  />
                </FormField>
              </div>
              <FormField id={fieldId("email")} label="Correo" required error={errors.email}>
                <Input
                  type="email"
                  name="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                  disabled={pending}
                />
              </FormField>

              <div className="flex flex-col gap-2">
                <Label id={fieldId("service-label")} required>
                  Servicio
                </Label>
                <div
                  id={fieldId("service")}
                  role="radiogroup"
                  aria-labelledby={fieldId("service-label")}
                  aria-required="true"
                  aria-invalid={errors.service ? true : undefined}
                  aria-describedby={errors.service ? errorId("service") : undefined}
                  tabIndex={-1}
                  onKeyDown={onServiceKeyDown}
                  className={cn(
                    "flex flex-wrap gap-2 rounded focus-visible:outline-none",
                    errors.service && "rounded-lg ring-1 ring-danger/60 ring-offset-4 ring-offset-ink-2",
                  )}
                >
                  {services.map((s) => (
                    <Chip
                      key={s}
                      radio
                      selected={service === s}
                      disabled={pending}
                      onClick={() => {
                        setService(s);
                        clearError("service");
                      }}
                    >
                      {s}
                    </Chip>
                  ))}
                </div>
                <input type="hidden" name="service" value={service} />
                <FieldError id={errorId("service")} className="mt-0">
                  {errors.service}
                </FieldError>
              </div>

              <FormField
                id={fieldId("message")}
                label={
                  <>
                    Mensaje <span className="font-normal text-text-3">(opcional)</span>
                  </>
                }
                error={errors.message}
              >
                <Input
                  name="message"
                  placeholder="Ej: tengo la letra lista, quiero grabar en noviembre"
                  maxLength={500}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    clearError("message");
                  }}
                  disabled={pending}
                />
              </FormField>

              <ConsentCheckbox
                checked={accepted}
                onCheckedChange={(v) => {
                  setAccepted(v);
                  if (v) clearError("policyAccepted");
                }}
                businessName={businessName}
                error={errors.policyAccepted}
              />

              <div className="flex flex-col gap-3 border-t border-line-1 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div id={`${uid}-form-status`} aria-live="polite" role={status.kind === "error" ? "alert" : undefined} className="min-h-5 text-body-sm text-danger">
                  {status.kind === "error" ? (
                    <>
                      {status.message}
                      {status.rateLimited && directWa ? (
                        <>
                          {" "}
                          <a href={directWa} target="_blank" rel="noopener noreferrer" className="font-semibold text-whatsapp underline underline-offset-4">
                            Escríbenos por WhatsApp
                          </a>
                          .
                        </>
                      ) : null}
                    </>
                  ) : null}
                </div>
                <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
                  {pending ? null : <Send aria-hidden />}
                  {pending ? "Enviando…" : lead.ctaLabel}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </HomeFadeSection>
  );
}
