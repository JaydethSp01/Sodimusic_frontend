"use client";

import { FilterBar, FilterGroup } from "@/components/ds/filter-bar";
import { Chip } from "@/components/ui/chip";
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
  /** Slot derecho de la barra (contador, acciones). */
  end?: React.ReactNode;
}

/** `FilterBar` de categorías de /canales (chips en modo enlace; la URL conserva `q` y reinicia la página). */
export function ChannelCategoryChips({ categories, active, q, totalAll, totalActive, end }: ChannelCategoryChipsProps) {
  const current = active ?? "";
  return (
    <FilterBar sticky label="Filtros de canales" end={end}>
      <FilterGroup as="nav" label="Categorías de canales" showLabel>
        <li>
          <Chip href={buildChannelsHref({ q })} selected={current === ""} count={totalAll}>
            Todos
          </Chip>
        </li>
        {categories.map((c) => (
          <li key={c}>
            <Chip href={buildChannelsHref({ q, category: c })} selected={current === c} count={c === current ? totalActive : undefined}>
              {c}
            </Chip>
          </li>
        ))}
      </FilterGroup>
    </FilterBar>
  );
}
