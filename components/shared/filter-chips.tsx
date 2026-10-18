"use client";

import { Chip } from "@/components/ui/chip";
import { FilterGroup } from "@/components/ds/filter-bar";
import { cn } from "@/lib/utils";

export type FilterChip = { value: string; label: string; count?: number };

interface FilterChipsProps {
  label: string;
  chips: FilterChip[];
  active?: string;
  /** Modo enlace: construye la URL para cada chip (server-friendly, sin JS). */
  hrefFor?: (value: string) => string;
  /** Modo controlado: callback al elegir. */
  onSelect?: (value: string) => void;
  className?: string;
}

/**
 * Wrapper de compatibilidad (fase A): `<nav aria-label>` + `Chip` por filtro. Los enlaces llevan
 * `aria-current="page"` y los botones `aria-pressed` cuando están activos (los e2e lo comprueban).
 */
export function FilterChips({ label, chips, active, hrefFor, onSelect, className }: FilterChipsProps) {
  if (!chips.length) {
    return null;
  }
  const current = active ?? "";
  return (
    <FilterGroup as="nav" label={label} className={cn(className)}>
      {chips.map((c) => {
        const isActive = current === c.value;
        return (
          <li key={c.value || "__all"}>
            <Chip href={hrefFor ? hrefFor(c.value) : undefined} selected={isActive} count={c.count} onClick={hrefFor ? undefined : () => onSelect?.(c.value)}>
              {c.label}
            </Chip>
          </li>
        );
      })}
    </FilterGroup>
  );
}
