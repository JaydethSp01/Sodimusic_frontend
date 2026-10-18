import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { SOCIAL_COPY } from "@/features/social/copy";

/** Esqueleto de /novedades (sin H1 para no duplicar el del hero durante el streaming). */
export default function NovedadesLoading() {
  return (
    <div>
      <section className="bg-ink-1 pb-12 pt-24 lg:pt-28" aria-hidden>
        <div className="container-page space-y-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-14 w-72 sm:h-16 md:h-20" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
      </section>
      <section className="container-page py-12 lg:py-16" aria-label={`${SOCIAL_COPY.listLabel} (cargando)`}>
        <LoadingSkeleton count={6} aspect="16/9" />
      </section>
    </div>
  );
}
