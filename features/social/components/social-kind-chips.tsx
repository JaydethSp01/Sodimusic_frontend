"use client";

import { FilterChips, type FilterChip } from "@/components/shared/filter-chips";
import { SOCIAL_POST_KINDS } from "@/features/social/api";
import { SOCIAL_COPY, SOCIAL_KIND_LABEL } from "@/features/social/copy";
import { buildNovedadesHref } from "@/features/social/hrefs";
import type { SocialPostKind } from "@/types/models";

interface SocialKindChipsProps {
  active?: SocialPostKind;
  /** Total sin filtrar (chip «Todas»). */
  totalAll?: number;
}

/** Chips de tipo de /novedades (modo enlace de FilterChips: `?kind=`). */
export function SocialKindChips({ active, totalAll }: SocialKindChipsProps) {
  const chips: FilterChip[] = [
    { value: "", label: SOCIAL_COPY.chipAll, count: totalAll },
    ...SOCIAL_POST_KINDS.map((k) => ({ value: k, label: SOCIAL_KIND_LABEL[k] })),
  ];
  return <FilterChips label={SOCIAL_COPY.chipsLabel} chips={chips} active={active ?? ""} hrefFor={(v) => buildNovedadesHref(v || undefined)} />;
}
