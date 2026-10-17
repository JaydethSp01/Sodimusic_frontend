"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { sendContactMessageAction } from "@/app/actions/contact-actions";
import { collectContactFieldErrors, contactMessageSchema, type ContactFieldErrors } from "@/features/contact/contact-schema";
import { ConsentCheckbox } from "@/components/shared/consent-checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const selectClass =
  "flex h-11 w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-500/70";

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
      <div
        role="status"
        aria-live="polite"
        className="card-surface flex flex-col items-start gap-4 p-6 sm:p-8"
      >
        <div className="rounded-full border border-primary/30 bg-primary/10 p-3 text-primary">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <div>
          <h2 className="font-display text-3xl uppercase tracking-wide text-foreground">Mensaje enviado</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
            Gracias, <span className="text-foreground">{name.trim()}</span>. Leímos cada mensaje y respondemos a{" "}
            <span className="text-foreground">{email.trim()}</span> normalmente en menos de 48 horas hábiles.
          </p>
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
    <form onSubmit={onSubmit} noValidate className="card-surface space-y-5 p-6 sm:p-8" aria-describedby={`${id}-form-status`}>
      <div className="space-y-2">
        <Label htmlFor={fieldId("subject")}>Asunto</Label>
        <select
          id={fieldId("subject")}
          name="subject"
          required
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            clearError("subject");
          }}
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={errors.subject ? errorId("subject") : undefined}
          className={selectClass}
          disabled={pending}
        >
          <option value="">Elige un asunto…</option>
          {subjects.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <FieldError id={errorId("subject")} message={errors.subject} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={fieldId("name")}>Nombre</Label>
          <Input
            id={fieldId("name")}
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError("name");
            }}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? errorId("name") : undefined}
            className={cn("h-11", errors.name && "border-red-500/70")}
            disabled={pending}
          />
          <FieldError id={errorId("name")} message={errors.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={fieldId("email")}>Correo</Label>
          <Input
            id={fieldId("email")}
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? errorId("email") : undefined}
            className={cn("h-11", errors.email && "border-red-500/70")}
            disabled={pending}
          />
          <FieldError id={errorId("email")} message={errors.email} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fieldId("phone")}>
          Teléfono / WhatsApp <span className="font-normal text-[var(--text-muted)]">(opcional)</span>
        </Label>
        <Input
          id={fieldId("phone")}
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
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? errorId("phone") : undefined}
          className={cn("h-11", errors.phone && "border-red-500/70")}
          disabled={pending}
        />
        <FieldError id={errorId("phone")} message={errors.phone} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={fieldId("message")}>Mensaje</Label>
        <Textarea
          id={fieldId("message")}
          name="message"
          required
          rows={6}
          placeholder="Cuéntanos quién eres, qué buscas y enlaces a tu música o medio si aplica."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            clearError("message");
          }}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? errorId("message") : `${id}-message-hint`}
          className={cn(errors.message && "border-red-500/70")}
          disabled={pending}
        />
        {errors.message ? (
          <FieldError id={errorId("message")} message={errors.message} />
        ) : (
          <p id={`${id}-message-hint`} className="text-xs text-[var(--text-muted)]">
            {message.trim().length}/3000
          </p>
        )}
      </div>

      <ConsentCheckbox
        checked={accepted}
        onCheckedChange={(v) => {
          setAccepted(v);
          if (v) clearError("policyAccepted");
        }}
        businessName={businessName}
        error={errors.policyAccepted}
      />

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p
          id={`${id}-form-status`}
          aria-live="polite"
          role={status.kind === "error" ? "alert" : undefined}
          className="min-h-[1rem] text-xs text-red-400"
        >
          {status.kind === "error" ? status.message : ""}
        </p>
        <Button type="submit" size="lg" disabled={pending} className="h-12 w-full sm:w-auto">
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
          {pending ? "Enviando…" : "Enviar mensaje"}
        </Button>
      </div>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-xs text-red-400">
      {message}
    </p>
  );
}
