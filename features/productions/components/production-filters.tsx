"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ChevronDown, X } from "lucide-react";
import { FilterBar, FilterGroup } from "@/components/ds/filter-bar";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

const ALL = "";

const GENRES = ["Champeta", "Trap", "Reggaeton", "Afrobeat", "Dancehall"];

/** Valores del catálogo; si el valor activo (URL) no está entre ellos se añade para que se vea aplicado. */
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
 * Filtros de /productions en una sola fila, arriba del listado (no fijos): chips de género en modo
 * enlace (`aria-current="page"` en el activo) y Año / País como desplegables compactos.
 */
export function ProductionFilters({ years = [], countries = [] }: ProductionFiltersProps) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const genre = sp.get("genre") ?? ALL;
  const year = sp.get("year") ?? ALL;
  const country = sp.get("country") ?? ALL;
  const hasFilters = !!(genre || year || country);
  const yearOptions = withActive(years, year);
  const countryOptions = withActive(countries, country);

  const hrefFor = useCallback(
    (key: "genre" | "year" | "country", value: string) => {
      const next = new URLSearchParams(sp.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete("page");
      const qs = next.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [sp, pathname],
  );

  return (
    <FilterBar
      label="Filtros de producciones"
      end={
        <div className="flex flex-wrap items-center gap-3">
          {yearOptions.length > 1 ? (
            <FilterSelect label="Filtrar por año" placeholder="Año" value={year} options={yearOptions} onChange={(v) => router.push(hrefFor("year", v), { scroll: false })} />
          ) : null}
          {countryOptions.length > 1 ? (
            <FilterSelect label="Filtrar por país" placeholder="País" value={country} options={countryOptions} onChange={(v) => router.push(hrefFor("country", v), { scroll: false })} />
          ) : null}
          {hasFilters ? (
            <Link href={pathname} scroll={false} className="inline-flex min-h-11 items-center gap-1.5 text-label text-text-2 transition-colors duration-150 hover:text-fire-400">
              <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Limpiar filtros
            </Link>
          ) : null}
        </div>
      }
    >
      <FilterGroup as="nav" label="Filtrar por género">
        <li>
          <Chip href={hrefFor("genre", ALL)} selected={genre === ALL}>
            Todos
          </Chip>
        </li>
        {GENRES.map((c) => (
          <li key={c}>
            <Chip href={hrefFor("genre", c)} selected={genre === c}>
              {c}
            </Chip>
          </li>
        ))}
      </FilterGroup>
    </FilterBar>
  );
}

function FilterSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const active = value !== ALL;
  return (
    <label className="relative inline-flex min-h-11 items-center">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 cursor-pointer appearance-none rounded-full border bg-ink-2 pl-4 pr-10 font-mono text-label uppercase text-text-2 transition-colors duration-150",
          "hover:border-line-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0",
          active ? "border-fire-500/60 bg-fire-500/10 text-fire-300" : "border-line-1",
        )}
      >
        <option value={ALL}>{placeholder}: todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-text-3" strokeWidth={1.75} aria-hidden />
    </label>
  );
}
