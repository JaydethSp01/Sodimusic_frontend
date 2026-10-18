"use client";

import { Chip } from "@/components/ui/chip";
import { AdminModuleToolbar, AdminNativeSelect } from "@/features/admin/components/admin-primitives";
import { SessionCreateDialog } from "@/features/admin/components/session-create-dialog";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "all", label: "Todos los estados" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CONFIRMED", label: "Confirmadas" },
  { value: "COMPLETED", label: "Completadas" },
  { value: "CANCELLED", label: "Canceladas" },
] as const;

const SERVICES = [
  { value: "all", label: "Todos los servicios" },
  { value: "VOCAL_RECORDING", label: "Grabación vocal" },
  { value: "BEAT_PRODUCTION", label: "Beat" },
  { value: "AUDIOVISUAL_PRODUCTION", label: "Audiovisual / video" },
  { value: "COPRODUCTION", label: "Coproducción" },
  { value: "MIX_MASTER", label: "Mix / master" },
  { value: "CONSULTING", label: "Consultoría" },
] as const;

function buildHref(status: string, service: string): string {
  const p = new URLSearchParams();
  if (status !== "all") p.set("status", status);
  if (service !== "all") p.set("service", service);
  const qs = p.toString();
  return qs ? `/admin/dashboard/sessions?${qs}` : "/admin/dashboard/sessions";
}

export function SessionsFilterBar({
  currentStatus,
  currentService,
  summary,
}: {
  currentStatus: string;
  currentService: string;
  summary?: string;
}) {
  const router = useRouter();
  return (
    <AdminModuleToolbar
      filters={
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
            {STATUSES.map((s) => (
              <Chip key={s.value} href={buildHref(s.value, currentService)} selected={currentStatus === s.value}>
                {s.label}
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sessions-service" className="sr-only">
              Servicio
            </label>
            <AdminNativeSelect
              id="sessions-service"
              value={currentService}
              onChange={(e) => router.push(buildHref(currentStatus, e.target.value))}
              className="w-auto min-w-[200px]"
            >
              {SERVICES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </AdminNativeSelect>
          </div>
        </>
      }
      summary={summary}
      action={<SessionCreateDialog />}
    />
  );
}
