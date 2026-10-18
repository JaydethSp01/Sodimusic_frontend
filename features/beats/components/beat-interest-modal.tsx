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
import { FormField } from "@/components/ds/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
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

  const chip =
    "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-label transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-2";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-line-1 bg-ink-2 p-6 sm:p-8">
        <DialogHeader className="text-left">
          <DialogTitle asChild>
            <Heading as="h2" size="display-sm">
              Me interesa: {beat.title}
            </Heading>
          </DialogTitle>
          <DialogDescription asChild>
            <Text size="body-sm" tone="2" className="mt-2">
              Déjanos tus datos y te escribimos para cerrar la licencia.
            </Text>
          </DialogDescription>
        </DialogHeader>
        <form className="mt-2 space-y-5" noValidate onSubmit={form.handleSubmit((v) => void onSubmit(v))}>
          <input type="hidden" {...form.register("beatId")} />
          <input type="hidden" {...form.register("policyVersion")} />

          {licenses.length ? (
            <fieldset>
              <legend className="text-body-sm font-medium text-text-1">Licencia</legend>
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
                      className={cn(chip, on ? "border-fire-500 bg-fire-500/[0.12] text-fire-300" : "border-line-2 text-text-2 hover:border-fire-500/60 hover:text-text-1")}
                    >
                      {l.label}
                      <span className={cn("font-mono text-label-sm tabular-nums", on ? "text-fire-300" : "text-text-3")}>{formatCOP(l.priceCOP)}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <Text size="body-sm">Licencia: {licenseLabel(licenseType)}</Text>
          )}

          <FormField id="bi-artistName" label="Nombre artístico" error={errors.artistName?.message}>
            <Input autoComplete="nickname" {...form.register("artistName")} />
          </FormField>
          <FormField id="bi-email" label="Email" error={errors.email?.message}>
            <Input type="email" autoComplete="email" inputMode="email" {...form.register("email")} />
          </FormField>
          <FormField id="bi-phone" label="WhatsApp" error={errors.phone?.message}>
            <Input type="tel" autoComplete="tel" inputMode="tel" placeholder="+57 321 5368590" {...form.register("phone")} />
          </FormField>
          <FormField id="bi-instagram" label="Instagram (opcional)" error={errors.instagram?.message}>
            <Input placeholder="@tunombre" {...form.register("instagram")} />
          </FormField>
          <FormField id="bi-message" label="Mensaje (opcional)" error={errors.message?.message}>
            <Textarea maxLength={500} {...form.register("message")} />
          </FormField>

          <div className="space-y-3 border-t border-line-1 pt-5">
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

          <FieldError id="bi-server-error" className="rounded border border-danger/40 bg-danger/10 px-3 py-2">
            {serverError}
          </FieldError>

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            {isSubmitting ? "Enviando…" : "Enviar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
