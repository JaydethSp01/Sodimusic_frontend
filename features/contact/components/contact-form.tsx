"use client";

import { useId, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { sendContactMessageAction } from "@/app/actions/contact-actions";
import { collectContactFieldErrors, contactMessageSchema, type ContactFieldErrors } from "@/features/contact/contact-schema";
import { ConsentCheckbox } from "@/components/shared/consent-checkbox";
import { FormField } from "@/components/ds/form-field";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { FieldError } from "@/components/ui/field-error";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import type { SiteContactSubject } from "@/types/site-content";
import { cn } from "@/lib/utils";

type Props = {
  subjects: SiteContactSubject[];
  businessName: string;
  policyVersion: string;
  /** Asunto preseleccionado (p. ej. ?asunto=PRENSA) */
  initialSubject?: string;
};

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "success" };

/** Formulario de contacto/prensa con validación zod inline y envío por server action. */
export function ContactForm({ subjects, businessName, policyVersion, initialSubject }: Props) {
  const id = useId();
  const [subject, setSubject] = useState(() =>
    initialSubject && subjects.some((s) => s.value === initialSubject) ? initialSubject : "",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, start] = useTransition();

  const fieldId = (f: string) => `${id}-${f}`;
  const errorId = (f: string) => `${id}-${f}-error`;

  function clearError(field: keyof ContactFieldErrors) {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  /** Flechas entre los chips de asunto (patrón radiogroup). */
  function onSubjectKeyDown(e: KeyboardEvent<HTMLDivElement>) {
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
    const payload = {
      subject,
      name,
      email,
      phone,
      message,
      policyAccepted: accepted as true,
      policyVersion,
    };
    const parsed = contactMessageSchema.safeParse(payload);
    if (!parsed.success) {
      const fe = collectContactFieldErrors(parsed.error);
      setErrors(fe);
      setStatus({ kind: "error", message: "Revisa los campos marcados." });
      const first = (Object.keys(fe) as (keyof ContactFieldErrors)[])[0];
      if (first && first !== "policyAccepted") {
        document.getElementById(fieldId(first))?.focus();
      }
      return;
    }
    setErrors({});
    setStatus({ kind: "idle" });
    start(async () => {
      const r = await sendContactMessageAction(payload);
      if (!r.ok) {
        if (r.fieldErrors) setErrors(r.fieldErrors);
        setStatus({ kind: "error", message: r.error });
        return;
      }
      setStatus({ kind: "success" });
    });
  }

  if (status.kind === "success") {
    return (
      <div role="status" aria-live="polite" className="flex flex-col items-start gap-5 rounded-lg border border-line-1 bg-ink-2 p-6 shadow-card sm:p-8">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-success/40 bg-success/[0.12] text-success">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <Heading as="h2" size="display-sm">
            Mensaje enviado
          </Heading>
          <Text as="p" size="body" tone="2" prose className="mt-3">
            Gracias, <span className="font-semibold text-text-1">{name.trim()}</span>. Leemos cada mensaje y respondemos a{" "}
            <span className="font-semibold text-text-1">{email.trim()}</span> normalmente en menos de 48 horas hábiles.
          </Text>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSubject("");
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
            setAccepted(false);
            setStatus({ kind: "idle" });
          }}
        >
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-6 rounded-lg border border-line-1 bg-ink-2 p-5 shadow-card sm:p-8"
      aria-describedby={`${id}-form-status`}
    >
      <div className="flex flex-col gap-2">
        <Label id={fieldId("subject-label")} required>
          Asunto
        </Label>
        <div
          id={fieldId("subject")}
          role="radiogroup"
          aria-labelledby={fieldId("subject-label")}
          aria-required="true"
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={errors.subject ? errorId("subject") : undefined}
          tabIndex={-1}
          onKeyDown={onSubjectKeyDown}
          className={cn("flex flex-wrap gap-2 rounded focus-visible:outline-none", errors.subject && "rounded-lg ring-1 ring-danger/60 ring-offset-4 ring-offset-ink-2")}
        >
          {subjects.map((s) => (
            <Chip
              key={s.value}
              radio
              selected={subject === s.value}
              disabled={pending}
              onClick={() => {
                setSubject(s.value);
                clearError("subject");
              }}
            >
              {s.label}
            </Chip>
          ))}
        </div>
        <input type="hidden" name="subject" value={subject} />
        <FieldError id={errorId("subject")} className="mt-0">
          {errors.subject}
        </FieldError>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id={fieldId("name")} label="Nombre" error={errors.name}>
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
        <FormField id={fieldId("email")} label="Correo" error={errors.email}>
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
      </div>

      <FormField
        id={fieldId("phone")}
        label={
          <>
            Teléfono / WhatsApp <span className="font-normal text-text-3">(opcional)</span>
          </>
        }
        error={errors.phone}
      >
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

      <FormField
        id={fieldId("message")}
        label="Mensaje"
        hint={errors.message ? undefined : <span className="block text-right font-mono tabular-nums">{message.trim().length}/3000</span>}
        error={errors.message}
      >
        <Textarea
          name="message"
          rows={6}
          placeholder="Cuéntanos quién eres, qué buscas y enlaces a tu música o medio si aplica."
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

      <div className="flex flex-col gap-3 border-t border-line-1 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p
          id={`${id}-form-status`}
          aria-live="polite"
          role={status.kind === "error" ? "alert" : undefined}
          className="min-h-5 text-body-sm text-danger"
        >
          {status.kind === "error" ? status.message : ""}
        </p>
        <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
          {pending ? null : <Send aria-hidden />}
          {pending ? "Enviando…" : "Enviar mensaje"}
        </Button>
      </div>
    </form>
  );
}
