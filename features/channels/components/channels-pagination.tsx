"use client";

import { Pagination } from "@/components/ds/pagination";
import { buildChannelsHref } from "@/features/channels/hrefs";

interface ChannelsPaginationProps {
  page: number;
  totalPages: number;
  q?: string;
  category?: string;
  className?: string;
}

/** `Pagination` del sistema con los enlaces de /canales (`?q=&category=&page=`) y resumen «Página X de Y». */
export function ChannelsPagination({ page, totalPages, q, category, className }: ChannelsPaginationProps) {
  return (
    <Pagination
      page={page}
      pageCount={totalPages}
      label="Paginación de canales"
      hrefFor={(p) => buildChannelsHref({ q, category, page: p })}
      summary={`Página ${page} de ${totalPages}`}
      className={className}
    />
  );
}
