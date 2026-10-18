import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { SOCIAL_COPY } from "@/features/social/copy";

/** Esqueleto de /novedades (sin H1 para no duplicar el del hero durante el streaming). */
export default function NovedadesLoading() {
  return (
    <div>
      <section className="relative overflow-hidden bg-background-secondary/60 px-4 pb-14 pt-16 lg:px-8 lg:pb-20 lg:pt-24" aria-hidden>
        <div className="mx-auto max-w-7xl space-y-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-14 w-72 sm:h-16 md:h-20" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8" aria-label={`${SOCIAL_COPY.listLabel} (cargando)`}>
        <LoadingSkeleton count={6} aspect="16/9" />
      </section>
    </div>
  );
}
