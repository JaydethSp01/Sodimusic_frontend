"use client";

import { FilterBar, FilterGroup } from "@/components/ds/filter-bar";
import { Chip } from "@/components/ui/chip";
import { SOCIAL_POST_KINDS } from "@/features/social/api";
import { SOCIAL_COPY, SOCIAL_KIND_LABEL } from "@/features/social/copy";
import { buildNovedadesHref } from "@/features/social/hrefs";
import type { SocialPostKind } from "@/types/models";

interface SocialKindChipsProps {
  active?: SocialPostKind;
  /** Total sin filtrar (chip «Todas»). */
  totalAll?: number;
  /** Slot derecho de la barra (contador, «Actualizado…»). */
  end?: React.ReactNode;
}

/** `FilterBar` sticky de /novedades: chips de red en modo enlace (`?kind=`). */
export function SocialKindChips({ active, totalAll, end }: SocialKindChipsProps) {
  const current = active ?? "";
  return (
    <FilterBar sticky label="Filtros de novedades" end={end}>
      <FilterGroup as="nav" label={SOCIAL_COPY.chipsLabel} showLabel>
        <li>
          <Chip href={buildNovedadesHref()} selected={current === ""} count={totalAll}>
            {SOCIAL_COPY.chipAll}
          </Chip>
        </li>
        {SOCIAL_POST_KINDS.map((k) => (
          <li key={k}>
            <Chip href={buildNovedadesHref(k)} selected={current === k}>
              {SOCIAL_KIND_LABEL[k]}
            </Chip>
          </li>
        ))}
      </FilterGroup>
    </FilterBar>
  );
}
