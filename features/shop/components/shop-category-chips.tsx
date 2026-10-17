"use client";

import { FilterChips } from "@/components/shared/filter-chips";

interface ShopCategoryChipsProps {
  categories: string[];
  active?: string;
}

/** Chips de categoría de la tienda (modo enlace de FilterChips; la URL se construye en el cliente). */
export function ShopCategoryChips({ categories, active }: ShopCategoryChipsProps) {
  const chips = [{ value: "", label: "Todos" }, ...categories.map((c) => ({ value: c, label: c }))];
  return (
    <FilterChips
      label="Categorías"
      chips={chips}
      active={active ?? ""}
      hrefFor={(value) => (value ? `/tienda?category=${encodeURIComponent(value)}` : "/tienda")}
    />
  );
}
