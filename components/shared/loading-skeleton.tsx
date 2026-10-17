import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  /** Número de tarjetas fantasma. */
  count?: number;
  /** Relación de aspecto de la portada; las tarjetas de catálogo usan 4:5. */
  aspect?: "4/5" | "1/1" | "16/9";
  className?: string;
}

const aspectClass = { "4/5": "aspect-[4/5]", "1/1": "aspect-square", "16/9": "aspect-video" } as const;

export function LoadingSkeleton({ count = 6, aspect = "4/5", className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}
      role="status"
      aria-busy="true"
      aria-label="Cargando"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-border bg-background-card">
          <Skeleton className={cn("w-full rounded-none", aspectClass[aspect])} />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
