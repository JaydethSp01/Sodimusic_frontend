"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { AdminToolbar, type AdminToolbarProps } from "@/components/ds/admin-toolbar";
import { FieldHint } from "@/components/ui/field-hint";
import { IconButton, type IconButtonProps } from "@/components/ui/icon-button";
import { inputClass } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Campos de formulario                                                */
/* ------------------------------------------------------------------ */

/**
 * Label + control + ayuda, con la estructura que esperan los e2e (`label` seguido del control como
 * hermano directo). Para un control único con `id` usa `FormField` de `components/ds`; este wrapper
 * admite varios hijos (previsualización + input + file) y controles sin `id`.
 */
export function AdminField({
  label,
  hint,
  htmlFor,
  className,
  children,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <FieldHint className="mt-0">{hint}</FieldHint> : null}
    </div>
  );
}

const CHEVRON =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238f8a82' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")";

/** Clase del `<select>` nativo (mismos tokens que `Input`, con chevron). */
export const nativeSelectClass = cn(inputClass, "cursor-pointer appearance-none bg-no-repeat pr-10 [background-position:right_12px_center]");

/** `<select>` nativo con los tokens del sistema. Se mantiene nativo porque los e2e usan `selectOption`. */
export const AdminNativeSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function AdminNativeSelect({ className, style, ...props }, ref) {
    return <select ref={ref} className={cn(nativeSelectClass, className)} style={{ backgroundImage: CHEVRON, ...style }} {...props} />;
  },
);

/** Pie de diálogo: acciones a la derecha sobre una línea. */
export function AdminDialogFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex flex-wrap justify-end gap-2 border-t border-line-1 pt-4", className)}>{children}</div>;
}

/** Clase para `DialogContent`/`AlertDialogContent` del admin (scroll interno en pantallas bajas). */
export const adminDialogClass = "max-h-[92vh] overflow-y-auto border-line-1 bg-ink-2 shadow-pop";

/* ------------------------------------------------------------------ */
/* Secciones                                                            */
/* ------------------------------------------------------------------ */

/** Cabecera de bloque (título + descripción + acción) sin tarjeta: va sobre una `AdminTable` o lista. */
export function AdminSectionHeading({
  id,
  title,
  titleAs: Tag = "h2",
  description,
  action,
  className,
}: {
  id?: string;
  title: React.ReactNode;
  titleAs?: "h2" | "h3";
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <Tag id={id} className="text-title text-text-1">
          {title}
        </Tag>
        {description ? (
          <Text size="body-sm" tone="3" className="mt-1 container-prose">
            {description}
          </Text>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

/** Tarjeta de sección (ink-2) con cabecera clara. Para tablas usa `AdminSectionHeading` + `AdminTable`. */
export function AdminSection({
  id,
  title,
  titleAs = "h2",
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  id?: string;
  title: React.ReactNode;
  titleAs?: "h2" | "h3";
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn("rounded-lg border border-line-1 bg-ink-2 shadow-card", className)}>
      <AdminSectionHeading
        id={id ? `${id}-title` : undefined}
        title={title}
        titleAs={titleAs}
        description={description}
        action={action}
        className="border-b border-line-1 px-5 py-4"
      />
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Barra de módulo, acciones de fila, avisos                            */
/* ------------------------------------------------------------------ */

/** `AdminToolbar` pegada bajo la cabecera móvil (56 px) y al borde superior en escritorio. */
export function AdminModuleToolbar({ className, ...props }: AdminToolbarProps) {
  return <AdminToolbar {...props} className={cn("top-14 md:top-0", className)} />;
}

export interface RowActionProps extends Omit<IconButtonProps, "aria-label"> {
  /** Nombre accesible y texto del tooltip (los e2e buscan el botón por este nombre). */
  label: string;
}

/** Acción de fila: `IconButton` sm + tooltip. Con `asChild` envuelve un enlace. */
export const RowAction = React.forwardRef<HTMLButtonElement, RowActionProps>(function RowAction(
  { label, variant = "ghost", size = "sm", children, ...props },
  ref,
) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton ref={ref} aria-label={label} variant={variant} size={size} {...props}>
          {children}
        </IconButton>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
});

/** Aviso de error de carga (sustituye a `<p className="text-red-500">`). */
export function AdminErrorNotice({ title, children, icon: IconComp = AlertCircle }: { title?: React.ReactNode; children: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg border border-danger/40 bg-danger/[0.08] px-4 py-3 text-body-sm text-text-1">
      <IconComp className="mt-0.5 h-5 w-5 shrink-0 text-danger" strokeWidth={1.75} aria-hidden />
      <div className="min-w-0">
        {title ? <p className="font-semibold text-danger">{title}</p> : null}
        <div className={cn(title && "mt-1 text-text-2")}>{children}</div>
      </div>
    </div>
  );
}

/** Franja de resultados bajo una tabla (contador mono + paginación). */
export function AdminResultsBar({ summary, children, className }: { summary?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  if (!summary && !children) return null;
  return (
    <div className={cn("flex flex-col items-center justify-between gap-3 sm:flex-row", className)}>
      {summary ? <p className="font-mono text-body-sm tabular-nums text-text-3">{summary}</p> : <span />}
      {children}
    </div>
  );
}
