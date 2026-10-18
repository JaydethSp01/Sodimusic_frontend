"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { subscribeNewsletterAction } from "@/app/actions/newsletter-actions";
import { ConsentCheckbox } from "@/components/shared/consent-checkbox";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type Props = {
  businessName: string;
  policyVersion: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  source?: string;
};

type Status = { kind: "idle" } | { kind: "success"; message: string } | { kind: "error"; message: string };

/**
 * Formulario de boletín del footer (compacto): título + subtítulo en una línea cada uno,
 * fila email + botón (apilados en < sm) y la autorización obligatoria de datos
 * (Ley 1581/2012) en una línea de 12 px. Conserva la validación inline con `role="alert"`.
 */
export function NewsletterForm({ businessName, policyVersion, title, subtitle, ctaLabel, source = "footer" }: Props) {
  const id = useId();
  const emailId = `${id}-email`;
  const emailErrorId = `${id}-email-error`;
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, start] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    setEmailError(emailOk ? null : "Escribe un correo válido");
    setConsentError(accepted ? null : "Necesitamos tu autorización para enviarte el boletín");
    if (!emailOk || !accepted) return;
    setStatus({ kind: "idle" });
    start(async () => {
      const r = await subscribeNewsletterAction({ email: trimmed, source, policyAccepted: true, policyVersion });
      if (!r.ok) {
        setStatus({ kind: "error", message: r.error });
        return;
      }
      setStatus({
        kind: "success",
        message: "Listo. Revisa tu correo: te avisaremos de lo nuevo.",
      });
      setEmail("");
      setAccepted(false);
    });
  }

  if (status.kind === "success") {
    return (
      <div role="status" aria-live="polite" className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/[0.08] p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
        <div>
          <Text as="p" size="body-sm" tone="1" className="font-medium">
            {status.message}
          </Text>
          <Text as="p" size="body-sm" tone="3" className="mt-1">
            Puedes darte de baja en cualquier momento desde cada correo.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3" aria-labelledby={`${id}-title`}>
      <div>
        <p id={`${id}-title`} className="text-body font-semibold text-text-1">
          {title}
        </p>
        {subtitle ? (
          <Text as="p" size="body-sm" tone="3" className="mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <label htmlFor={emailId} className="sr-only">
            Correo electrónico
          </label>
          <Input
            id={emailId}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? emailErrorId : undefined}
            disabled={pending}
          />
          <FieldError id={emailErrorId}>{emailError}</FieldError>
        </div>
        <Button type="submit" loading={pending} className="w-full shrink-0 sm:w-auto">
          {pending ? "Enviando…" : ctaLabel}
        </Button>
      </div>

      <ConsentCheckbox
        checked={accepted}
        onCheckedChange={(v) => {
          setAccepted(v);
          if (v && consentError) setConsentError(null);
        }}
        businessName={businessName}
        error={consentError ?? undefined}
        className="[&_label]:gap-2 [&_label]:text-xs [&_label]:leading-relaxed sm:[&_label]:min-h-0 sm:[&_label]:py-0"
      />
      <FieldError>{status.kind === "error" ? status.message : null}</FieldError>
    </form>
  );
}
