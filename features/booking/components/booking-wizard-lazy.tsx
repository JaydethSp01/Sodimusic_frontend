"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookingConfig, BookingLegal } from "@/features/booking/components/booking-wizard";

const STEPS = 5;
const CARDS = 4;

/** Esqueleto con la silueta del paso 1 del wizard (indicador de pasos + tarjetas de servicio + botón). */
function BookingWizardSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12"
      role="status"
      aria-busy="true"
      aria-label="Cargando el formulario de reserva"
    >
      <div className="mb-8">
        <div className="flex items-baseline justify-between gap-3 md:hidden">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="hidden gap-4 md:flex md:justify-between">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-3 h-1.5 w-full rounded" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-72 max-w-full" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: CARDS }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Skeleton className="h-12 w-[120px] rounded-md" />
      </div>
    </div>
  );
}

const BookingWizard = dynamic(
  () => import("@/features/booking/components/booking-wizard").then((m) => m.BookingWizard),
  { ssr: false, loading: () => <BookingWizardSkeleton /> },
);

/**
 * Wizard de reserva cargado bajo demanda: zod, date-fns, react-day-picker y framer-motion salen del
 * First Load JS de /booking. Sin SSR; mientras llega el chunk se muestra el esqueleto.
 */
export function BookingWizardLazy({ booking, legal }: { booking: BookingConfig; legal: BookingLegal }) {
  return <BookingWizard booking={booking} legal={legal} />;
}
