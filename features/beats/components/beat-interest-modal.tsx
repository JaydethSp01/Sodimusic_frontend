"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Beat, BeatLicenseType } from "@/types/models";
import type { SiteLegal } from "@/types/site-content";
import { beatInterestSchema, type BeatInterestInput } from "@/features/beats/schemas/beat-interest-schema";
import { beatLicenses, licenseLabel } from "@/features/beats/licenses";
import { ConsentCheckbox } from "@/components/shared/consent-checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPublicApiUrl } from "@/lib/api";
import { formatCOP } from "@/lib/format-cop";
import { cn } from "@/lib/utils";

interface BeatInterestModalProps {
  beat: Beat;
  licenseType: BeatLicenseType;
  legal: Pick<SiteLegal, "businessName" | "policyVersion">;
  onClose: () => void;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-400">
      {message}
    </p>
  );
}

/** Formulario "Me interesa": envía licenseType, policyAccepted, policyVersion y marketingOptIn. */
export function BeatInterestModal({ beat, licenseType: initialLicense, legal, onClose }: BeatInterestModalProps) {
  const licenses = beatLicenses(beat);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<BeatInterestInput>({
    resolver: zodResolver(beatInterestSchema),
    mode: "onBlur",
    defaultValues: {
      beatId: beat.id,
      artistName: "",
      email: "",
      phone: "",
      licenseType: initialLicense,
      exclusiveIntent: initialLicense === "EXCLUSIVE",
      instagram: "",
      message: "",
      policyAccepted: false,
      policyVersion: legal.policyVersion,
      marketingOptIn: false,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const licenseType = form.watch("licenseType");

  async function onSubmit(values: BeatInterestInput) {
    setServerError(null);
    const payload = { ...values, exclusiveIntent: values.licenseType === "EXCLUSIVE" };
    try {
      const res = await fetch(`${getPublicApiUrl()}/api/contact/beat-interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; ok?: boolean; error?: string };
      if (!res.ok || data.success === false || data.ok === false) {
        setServerError(data.error ?? "No se pudo enviar. Inténtalo de nuevo o escríbenos por WhatsApp.");
        return;
      }
      toast.success("¡Listo! Te contactamos pronto para cerrar la licencia.");
      onClose();
    } catch {
      setServerError("Sin conexión con el servidor. Inténtalo de nuevo en un momento.");
    }
  }

  const ariaFor = (name: keyof BeatInterestInput) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `bi-${name}-error` : undefined,
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide">Me interesa: {beat.title}</DialogTitle>
          <DialogDescription>Déjanos tus datos y te escribimos para cerrar la licencia.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={form.handleSubmit((v) => void onSubmit(v))}>
          <input type="hidden" {...form.register("beatId")} />
          <input type="hidden" {...form.register("policyVersion")} />

          {licenses.length ? (
            <fieldset>
              <legend className="text-sm font-medium text-foreground">Licencia</legend>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Licencia">
                {licenses.map((l) => {
                  const on = licenseType === l.type;
                  return (
                    <button
                      key={l.type}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        form.setValue("licenseType", l.type, { shouldValidate: true });
                        form.setValue("exclusiveIntent", l.type === "EXCLUSIVE");
                      }}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-mono text-xs uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        on
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-[var(--text-secondary)] hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {l.label}
                      <span className={cn("text-[10px]", on ? "text-primary/80" : "text-[var(--text-muted)]")}>{formatCOP(l.priceCOP)}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">Licencia: {licenseLabel(licenseType)}</p>
          )}

          <div>
            <Label htmlFor="bi-artistName">Nombre artístico</Label>
            <Input id="bi-artistName" autoComplete="nickname" className="mt-1" {...ariaFor("artistName")} {...form.register("artistName")} />
            <FieldError id="bi-artistName-error" message={errors.artistName?.message} />
          </div>
          <div>
            <Label htmlFor="bi-email">Email</Label>
            <Input id="bi-email" type="email" autoComplete="email" inputMode="email" className="mt-1" {...ariaFor("email")} {...form.register("email")} />
            <FieldError id="bi-email-error" message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="bi-phone">WhatsApp</Label>
            <Input
              id="bi-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+57 321 5368590"
              className="mt-1"
              {...ariaFor("phone")}
              {...form.register("phone")}
            />
            <FieldError id="bi-phone-error" message={errors.phone?.message} />
          </div>
          <div>
            <Label htmlFor="bi-instagram">Instagram (opcional)</Label>
            <Input id="bi-instagram" placeholder="@tunombre" className="mt-1" {...ariaFor("instagram")} {...form.register("instagram")} />
            <FieldError id="bi-instagram-error" message={errors.instagram?.message} />
          </div>
          <div>
            <Label htmlFor="bi-message">Mensaje (opcional)</Label>
            <Textarea id="bi-message" maxLength={500} className="mt-1" {...ariaFor("message")} {...form.register("message")} />
            <FieldError id="bi-message-error" message={errors.message?.message} />
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <Controller
              control={form.control}
              name="policyAccepted"
              render={({ field }) => (
                <ConsentCheckbox
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v)}
                  businessName={legal.businessName}
                  error={errors.policyAccepted?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="marketingOptIn"
              render={({ field }) => (
                <ConsentCheckbox
                  variant="marketing"
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v)}
                  businessName={legal.businessName}
                />
              )}
            />
          </div>

          {serverError ? (
            <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {serverError}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="h-12 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando…" : "Enviar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
