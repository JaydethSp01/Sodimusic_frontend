"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { subscribeNewsletterAction } from "@/app/actions/newsletter-actions";
import { ConsentCheckbox } from "@/components/shared/consent-checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  businessName: string;
  policyVersion: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  source?: string;
};

type Status = { kind: "idle" } | { kind: "success"; message: string } | { kind: "error"; message: string };

/** Formulario de boletín del footer: email + autorización obligatoria de datos (Ley 1581/2012). */
export function NewsletterForm({ businessName, policyVersion, title, subtitle, ctaLabel, source = "footer" }: Props) {
  const id = useId();
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
      <div role="status" aria-live="polite" className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="text-sm font-medium text-foreground">{status.message}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Puedes darte de baja en cualquier momento desde cada correo.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3" aria-labelledby={`${id}-title`}>
      <div>
        <p id={`${id}-title`} className="font-display text-xl tracking-wide text-foreground">
          {title}
        </p>
        {subtitle ? <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{subtitle}</p> : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={`${id}-email`} className="sr-only">
            Correo electrónico
          </label>
          <Input
            id={`${id}-email`}
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
            aria-describedby={emailError ? `${id}-email-error` : undefined}
            className="h-11 bg-background"
            disabled={pending}
          />
          {emailError ? (
            <p id={`${id}-email-error`} className="mt-1 text-xs text-red-400">
              {emailError}
            </p>
          ) : null}
        </div>
        <Button type="submit" disabled={pending} className="h-11 shrink-0 sm:w-auto">
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
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
      />
      <p aria-live="polite" role={status.kind === "error" ? "alert" : undefined} className="min-h-[1rem] text-xs text-red-400">
        {status.kind === "error" ? status.message : ""}
      </p>
    </form>
  );
}
