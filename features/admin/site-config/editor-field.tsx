"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminSection } from "@/features/admin/components/admin-primitives";
import { cn } from "@/lib/utils";

/** Margen de scroll para que el ancla no quede bajo la barra de secciones. */
export const SECTION_CARD = "scroll-mt-36 md:scroll-mt-28";

/**
 * Campo del editor: `<label>` que envuelve el control (los e2e usan `getByLabel`), con los tokens del
 * sistema. `hint` va debajo en texto 3.
 */
export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-body-sm font-medium leading-none text-text-1">{label}</span>
      {children}
      {hint ? <span className="block text-body-sm text-text-3">{hint}</span> : null}
    </label>
  );
}

/** Título de subsección dentro de una tarjeta (mono, texto 3). */
export function SubsectionTitle({ children }: { children: ReactNode }) {
  return <p className="text-label text-text-3">{children}</p>;
}

/** Tarjeta de sección del editor: `AdminSection` con `id` ancla y margen de scroll. */
export function EditorSection({
  id,
  title,
  description,
  children,
  contentClassName,
}: {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <AdminSection id={id} title={title} description={description} className={SECTION_CARD} contentClassName={cn("space-y-4", contentClassName)}>
      {children}
    </AdminSection>
  );
}

/** Nota informativa (fire suave) con enlaces. */
export function EditorNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 rounded border border-line-fire bg-fire-500/[0.06] px-4 py-3 text-body-sm text-text-2", className)}>
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-fire-400" strokeWidth={1.75} aria-hidden />
      <div className="min-w-0 leading-relaxed">{children}</div>
    </div>
  );
}

/** Enlace dentro de una nota (interno o externo). */
export function EditorLink({ href, children, external = false }: { href: string; children: ReactNode; external?: boolean }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-1 rounded text-fire-400 underline underline-offset-4 transition-colors duration-150 hover:text-fire-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500"
    >
      {children}
      <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden />
    </Link>
  );
}

/** Casilla con etiqueta (área táctil 44 px). */
export function EditorToggle({
  checked,
  onChange,
  children,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-body-sm text-text-1">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <span>
        {children}
        {hint ? <span className="mt-1 block text-body-sm text-text-3">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Bloque repetible (hito, servicio, miembro…): superficie ink-1 dentro de la tarjeta. */
export function EditorGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-3 rounded border border-line-1 bg-ink-1/60 p-4", className)}>{children}</div>;
}

/** Texto de ayuda de una subsección o lista. */
export function EditorHint({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-body-sm text-text-3", className)}>{children}</p>;
}
