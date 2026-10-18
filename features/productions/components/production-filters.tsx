"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import { FilterBar, FilterGroup } from "@/components/ds/filter-bar";
import { Chip } from "@/components/ui/chip";

const ALL = "";

const GENRES = ["Champeta", "Trap", "Reggaeton", "Afrobeat", "Dancehall"];

/**
 * «Todos» + valores del catálogo. Si el valor activo (desde la URL) no está entre las opciones se
 * añade al final para que el filtro aplicado sea visible.
 */
function withActive(values: Array<string | number>, active: string): string[] {
  const list = values.map(String);
  if (active && !list.includes(active)) {
    list.push(active);
  }
  return list;
}

export interface ProductionFiltersProps {
  /** Años presentes en el catálogo (derivados en el servidor; ver `features/productions/facets.ts`). */
  years?: number[];
  /** Países presentes en el catálogo (Colombia, México, Otro). */
  countries?: string[];
}

/**
 * `FilterBar` sticky de /productions: chips en modo enlace (cada `Chip` es un `<Link>` que conserva
 * los demás filtros y reinicia la página; `aria-current="page"` en el activo).
 */
export function ProductionFilters({ years = [], countries = [] }: ProductionFiltersProps) {
  const sp = useSearchParams();
  const genre = sp.get("genre") ?? ALL;
  const year = sp.get("year") ?? ALL;
  const country = sp.get("country") ?? ALL;
  const hasFilters = !!(genre || year || country);
  // Una fila con una sola opción (además de «Todos») no filtra nada: se oculta entera.
  const yearChips = withActive(years, year);
  const countryChips = withActive(countries, country);

  const hrefFor = useCallback(
    (key: "genre" | "year" | "country") => (value: string) => {
      const next = new URLSearchParams(sp.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete("page");
      const qs = next.toString();
      return qs ? `/productions?${qs}` : "/productions";
    },
    [sp],
  );

  return (
    <FilterBar
      sticky
      label="Filtros de producciones"
      end={
        hasFilters ? (
          <Link href="/productions" scroll={false} className="inline-flex min-h-11 items-center gap-1.5 text-label text-text-2 transition-colors duration-150 hover:text-fire-400">
            <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Limpiar filtros
          </Link>
        ) : undefined
      }
    >
      <FilterRow label="Género" chips={GENRES} active={genre} hrefFor={hrefFor("genre")} />
      {yearChips.length > 1 ? <FilterRow label="Año" chips={yearChips} active={year} hrefFor={hrefFor("year")} /> : null}
      {countryChips.length > 1 ? <FilterRow label="País" chips={countryChips} active={country} hrefFor={hrefFor("country")} /> : null}
    </FilterBar>
  );
}

function FilterRow({ label, chips, active, hrefFor }: { label: string; chips: string[]; active: string; hrefFor: (value: string) => string }) {
  return (
    <FilterGroup as="nav" label={`Filtrar por ${label.toLowerCase()}`} showLabel>
      <li>
        <Chip href={hrefFor(ALL)} selected={active === ALL}>
          Todos
        </Chip>
      </li>
      {chips.map((c) => (
        <li key={c}>
          <Chip href={hrefFor(c)} selected={active === c}>
            {c}
          </Chip>
        </li>
      ))}
    </FilterGroup>
  );
}
