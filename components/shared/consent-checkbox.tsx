"use client";

import Link from "next/link";
import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { cn } from "@/lib/utils";

interface ConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Nombre comercial del responsable del tratamiento */
  businessName: string;
  error?: string;
  className?: string;
  /** Variante opcional de marketing (no obligatoria) */
  variant?: "policy" | "marketing";
  name?: string;
}

/**
 * Checkbox de autorización de datos personales (Ley 1581/2012). Nunca premarcado.
 * variant="policy": obligatorio, enlaza a /legal/privacidad.
 * variant="marketing": opcional, para novedades por email/WhatsApp.
 */
export function ConsentCheckbox({
  checked,
  onCheckedChange,
  businessName,
  error,
  className,
  variant = "policy",
  name,
}: ConsentCheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const isPolicy = variant === "policy";
  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-body-sm text-text-2">
        <Checkbox
          id={id}
          name={name ?? (isPolicy ? "policyAccepted" : "marketingOptIn")}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          aria-required={isPolicy || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5"
        />
        {isPolicy ? (
          <span>
            Autorizo a <strong className="font-semibold text-text-1">{businessName}</strong> el tratamiento de mis datos personales según la{" "}
            <Link href="/legal/privacidad" target="_blank" className="link-sweep text-fire-400 hover:text-fire-300">
              Política de privacidad
            </Link>
            . <span className="text-text-3">(obligatorio)</span>
          </span>
        ) : (
          <span>
            Quiero recibir novedades, lanzamientos y promociones por email o WhatsApp.{" "}
            <span className="text-text-3">(opcional, máximo un mensaje por semana)</span>
          </span>
        )}
      </label>
      <FieldError id={errorId} className="pl-8">
        {error}
      </FieldError>
    </div>
  );
}
