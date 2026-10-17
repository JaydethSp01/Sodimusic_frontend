"use client";

import Link from "next/link";
import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
    <div className={cn("space-y-1", className)}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-[var(--text-secondary)]">
        <Checkbox
          id={id}
          name={name ?? (isPolicy ? "policyAccepted" : "marketingOptIn")}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          aria-required={isPolicy || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 h-5 w-5 shrink-0"
        />
        {isPolicy ? (
          <span>
            Autorizo a <strong className="text-foreground">{businessName}</strong> el tratamiento de mis datos personales según la{" "}
            <Link href="/legal/privacidad" target="_blank" className="text-primary underline underline-offset-2">
              Política de privacidad
            </Link>
            . <span className="text-[var(--text-muted)]">(obligatorio)</span>
          </span>
        ) : (
          <span>
            Quiero recibir novedades, lanzamientos y promociones por email o WhatsApp.{" "}
            <span className="text-[var(--text-muted)]">(opcional, máximo un mensaje por semana)</span>
          </span>
        )}
      </label>
      {error ? (
        <p id={errorId} role="alert" className="pl-8 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
