"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import { FilterChips, type FilterChip } from "@/components/shared/filter-chips";

const ALL = "";

const GENRES: FilterChip[] = [
  { value: ALL, label: "Todos" },
  { value: "Champeta", label: "Champeta" },
  { value: "Trap", label: "Trap" },
  { value: "Reggaeton", label: "Reggaeton" },
  { value: "Afrobeat", label: "Afrobeat" },
  { value: "Dancehall", label: "Dancehall" },
];

/**
 * Chips «Todos» + valores del catálogo. Si el valor activo (desde la URL) no está
 * entre las opciones se añade al final para que el filtro aplicado sea visible.
 */
function toChips(values: Array<string | number>, active: string): FilterChip[] {
  const list = values.map(String);
  if (active && !list.includes(active)) {
    list.push(active);
  }
  return [{ value: ALL, label: "Todos" }, ...list.map((v) => ({ value: v, label: v }))];
}

export interface ProductionFiltersProps {
  /** Años presentes en el catálogo (derivados en el servidor; ver `features/productions/facets.ts`). */
  years?: number[];
  /** Países presentes en el catálogo (Colombia, México, Otro). */
  countries?: string[];
}

/**
 * Filtros de /productions con chips unificados en modo enlace (`hrefFor`):
 * cada chip es un `<Link>` que conserva los demás filtros y reinicia la página.
 */
export function ProductionFilters({ years = [], countries = [] }: ProductionFiltersProps) {
  const sp = useSearchParams();
  const genre = sp.get("genre") ?? ALL;
  const year = sp.get("year") ?? ALL;
  const country = sp.get("country") ?? ALL;
  const hasFilters = !!(genre || year || country);
  // Una fila con una sola opción (además de «Todos») no filtra nada: se oculta entera.
  const yearChips = toChips(years, year);
  const countryChips = toChips(countries, country);
  const showYears = yearChips.length > 2;
  const showCountries = countryChips.length > 2;

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
    <div className="sticky top-[60px] z-30 border-b border-white/[0.06] bg-[#080808]/85 py-4 backdrop-blur-md md:top-[68px]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 lg:px-8">
        <FilterRow label="Género" chips={GENRES} active={genre} hrefFor={hrefFor("genre")} />
        {showYears ? <FilterRow label="Año" chips={yearChips} active={year} hrefFor={hrefFor("year")} /> : null}
        <div className="flex flex-wrap items-end justify-between gap-4">
          {showCountries ? (
            <FilterRow label="País" chips={countryChips} active={country} hrefFor={hrefFor("country")} className="min-w-0 flex-1" />
          ) : (
            <span aria-hidden className="min-w-0 flex-1" />
          )}
          {hasFilters ? (
            <Link
              href="/productions"
              scroll={false}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:text-primary"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Limpiar filtros
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FilterRow({
  label,
  chips,
  active,
  hrefFor,
  className,
}: {
  label: string;
  chips: FilterChip[];
  active: string;
  hrefFor: (value: string) => string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">{label}</p>
      <FilterChips label={`Filtrar por ${label.toLowerCase()}`} chips={chips} active={active} hrefFor={hrefFor} />
    </div>
  );
}
