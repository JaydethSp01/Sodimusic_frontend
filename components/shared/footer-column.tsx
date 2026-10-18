"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterColumnProps {
  /** Título visible de la columna (y nombre accesible del `<nav>` padre vía `aria-labelledby`). */
  title: string;
  /** id del título; el `<nav>` que envuelve la columna debe usar `aria-labelledby={id}`. */
  id: string;
  children: ReactNode;
  className?: string;
}

const headingClass = "text-label text-text-3";

/**
 * Columna de navegación del pie: en móvil (< md) es un acordeón (botón con
 * `aria-expanded`/`aria-controls` y la lista oculta hasta abrir); en ≥ md el
 * botón desaparece y se muestra el título estático con la lista siempre visible.
 */
export function FooterColumn({ title, id, children, className }: FooterColumnProps) {
  const [open, setOpen] = useState(false);
  const panelId = `${useId()}-panel`;

  return (
    <div className={className}>
      <button
        type="button"
        id={`${id}-toggle`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          headingClass,
          "-mx-1 flex min-h-11 w-full items-center justify-between rounded px-1 text-left transition-colors duration-150 hover:text-text-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 md:hidden",
        )}
      >
        {title}
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")}
          aria-hidden
        />
      </button>
      <p id={id} className={cn(headingClass, "hidden md:block")}>
        {title}
      </p>
      <div id={panelId} className={cn("pb-2 md:block md:pb-0", open ? "block" : "hidden")}>
        {children}
      </div>
    </div>
  );
}
