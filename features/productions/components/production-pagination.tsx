"use client";

import { Pagination } from "@/components/ds/pagination";

interface ProductionPaginationProps {
  page: number;
  pageCount: number;
  /** Filtros activos (`genre`, `year`, `country`) que cada enlace conserva. */
  filters: Record<string, string | undefined>;
  className?: string;
}

/** `Pagination` con los hrefs de /productions construidos en cliente (las funciones no cruzan el límite RSC). */
export function ProductionPagination({ page, pageCount, filters, className }: ProductionPaginationProps) {
  const hrefFor = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v && k !== "page") {
        next.set(k, v);
      }
    }
    if (p > 1) {
      next.set("page", String(p));
    }
    const qs = next.toString();
    return qs ? `/productions?${qs}` : "/productions";
  };
  return <Pagination page={page} pageCount={pageCount} hrefFor={hrefFor} summary={pageCount > 1 ? `Página ${page} de ${pageCount}` : undefined} className={className} />;
}
