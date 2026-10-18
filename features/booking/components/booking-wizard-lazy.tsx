"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookingConfig, BookingLegal } from "@/features/booking/components/booking-wizard";

const STEPS = 5;
const ROWS = 4;

/** Esqueleto con la silueta del wizard v5 (stepper + resumen a la izquierda, paso 1 a la derecha). */
function BookingWizardSkeleton() {
  return (
    <div className="container-page py-10 lg:py-16" role="status" aria-busy="true" aria-label="Cargando el formulario de reserva">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="flex items-baseline justify-between gap-3 lg:hidden">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="mt-3 h-1 w-full rounded-full lg:mt-0" />
          <div className="mt-6 hidden space-y-6 lg:block">
            {Array.from({ length: STEPS }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton shape="circle" className="h-9 w-9" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-4 h-11 w-full rounded-lg lg:mt-8 lg:h-48" />
        </div>
        <div className="lg:col-span-8">
          <Skeleton className="h-10 w-3/4 max-w-md" />
          <Skeleton className="mt-4 h-3 w-full max-w-lg" />
          <div className="mt-8 space-y-px border-t border-line-1">
            {Array.from({ length: ROWS }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-none border-b border-line-1 bg-transparent" />
            ))}
          </div>
          <div className="mt-10 flex justify-end border-t border-line-1 pt-6">
            <Skeleton className="h-[52px] w-36 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

const BookingWizard = dynamic(
  () => import("@/features/booking/components/booking-wizard").then((m) => m.BookingWizard),
  { ssr: false, loading: () => <BookingWizardSkeleton /> },
);

/**
 * Wizard de reserva cargado bajo demanda: zod, date-fns y react-day-picker salen del
 * First Load JS de /booking. Sin SSR; mientras llega el chunk se muestra el esqueleto.
 */
export function BookingWizardLazy({ booking, legal }: { booking: BookingConfig; legal: BookingLegal }) {
  return <BookingWizard booking={booking} legal={legal} />;
}
