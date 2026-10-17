import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildChannelsHref } from "@/features/channels/hrefs";
import { cn } from "@/lib/utils";

interface ChannelsPaginationProps {
  page: number;
  totalPages: number;
  q?: string;
  category?: string;
  className?: string;
}

const linkBase =
  "inline-flex min-h-11 items-center gap-1.5 rounded-md border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Paginación por enlaces (`?page=`): anterior / «Página X de Y» / siguiente. Sin JS. */
export function ChannelsPagination({ page, totalPages, q, category, className }: ChannelsPaginationProps) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? buildChannelsHref({ q, category, page: page - 1 }) : null;
  const next = page < totalPages ? buildChannelsHref({ q, category, page: page + 1 }) : null;

  return (
    <nav aria-label="Paginación de canales" className={cn("flex items-center justify-center gap-3", className)}>
      {prev ? (
        <Link href={prev} rel="prev" className={cn(linkBase, "border-border text-foreground hover:border-border-hover hover:bg-background-elevated")}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Anterior
        </Link>
      ) : (
        <span aria-disabled className={cn(linkBase, "cursor-not-allowed border-border/60 text-[var(--text-muted)] opacity-60")}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Anterior
        </span>
      )}
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)]" aria-current="page">
        Página {page} de {totalPages}
      </p>
      {next ? (
        <Link href={next} rel="next" className={cn(linkBase, "border-border text-foreground hover:border-border-hover hover:bg-background-elevated")}>
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span aria-disabled className={cn(linkBase, "cursor-not-allowed border-border/60 text-[var(--text-muted)] opacity-60")}>
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
