"use client";

import { FilterChips, type FilterChip } from "@/components/shared/filter-chips";
import { buildChannelsHref } from "@/features/channels/hrefs";

interface ChannelCategoryChipsProps {
  categories: string[];
  active?: string;
  /** Búsqueda actual; se conserva al cambiar de categoría. */
  q?: string;
  /** Total sin filtrar de categoría (chip «Todos»). */
  totalAll?: number;
  /** Total de la categoría activa (contador del chip activo). */
  totalActive?: number;
}

/** Chips de categoría de /canales (modo enlace; la URL conserva `q` y reinicia la página). */
export function ChannelCategoryChips({ categories, active, q, totalAll, totalActive }: ChannelCategoryChipsProps) {
  const current = active ?? "";
  const chips: FilterChip[] = [
    { value: "", label: "Todos", count: totalAll },
    ...categories.map((c) => ({ value: c, label: c, count: c === current ? totalActive : undefined })),
  ];
  return (
    <FilterChips
      label="Categorías de canales"
      chips={chips}
      active={current}
      hrefFor={(value) => buildChannelsHref({ q, category: value || undefined })}
    />
  );
}
