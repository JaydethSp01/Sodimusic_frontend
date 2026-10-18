import * as React from "react";
import { FieldError } from "@/components/ui/field-error";
import { FieldHint } from "@/components/ui/field-hint";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Label + control + hint/error. Clona el control con `id`, `aria-describedby` y `aria-invalid`.
 * El control es el único hijo (Input, Textarea, SelectTrigger…). Para checkboxes usa `inline`.
 */
export interface FormFieldProps {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  /** Label a la derecha del control (checkbox/switch). */
  inline?: boolean;
  className?: string;
  children: React.ReactElement;
}

export function FormField({ id, label, hint, error, required, inline = false, className, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  const control = React.cloneElement(children, {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    required: required || undefined,
  } as Record<string, unknown>);

  if (inline) {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="flex min-h-11 items-center gap-3">
          {control}
          <Label htmlFor={id} required={required} className="cursor-pointer leading-snug">
            {label}
          </Label>
        </div>
        <FieldHint id={hintId}>{hint}</FieldHint>
        <FieldError id={errorId}>{error}</FieldError>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {control}
      <FieldHint id={hintId} className="mt-0">
        {hint}
      </FieldHint>
      <FieldError id={errorId} className="mt-0">
        {error}
      </FieldError>
    </div>
  );
}
