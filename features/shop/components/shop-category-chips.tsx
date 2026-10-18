"use client";

import { Chip } from "@/components/ui/chip";
import { FilterGroup } from "@/components/ds/filter-bar";

interface ShopCategoryChipsProps {
  categories: string[];
  active?: string;
}

/**
 * Chips de categoría de la tienda: `<nav aria-label="Categorías">` + `Chip` en modo enlace
 * (`aria-current="page"` en la activa, sin JS). La URL se construye aquí.
 */
export function ShopCategoryChips({ categories, active }: ShopCategoryChipsProps) {
  const current = active ?? "";
  const chips = [{ value: "", label: "Todos" }, ...categories.map((c) => ({ value: c, label: c }))];
  return (
    <FilterGroup as="nav" label="Categorías">
      {chips.map((c) => (
        <li key={c.value || "__all"}>
          <Chip href={c.value ? `/tienda?category=${encodeURIComponent(c.value)}` : "/tienda"} selected={current === c.value}>
            {c.label}
          </Chip>
        </li>
      ))}
    </FilterGroup>
  );
}
