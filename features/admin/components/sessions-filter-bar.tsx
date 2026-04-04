"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SessionCreateDialog } from "@/features/admin/components/session-create-dialog";
import { cn } from "@/lib/utils";

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
}: {
  currentStatus: string;
  currentService: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Estado</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Button
              key={s.value}
              type="button"
              size="sm"
              variant={currentStatus === s.value ? "default" : "outline"}
              className={cn(
                currentStatus !== s.value && "border-white/10 bg-black/20 text-[var(--text-secondary)]",
              )}
              asChild
            >
              <Link href={buildHref(s.value, currentService)}>{s.label}</Link>
            </Button>
          ))}
        </div>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Servicio</p>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <Button
              key={s.value}
              type="button"
              size="sm"
              variant={currentService === s.value ? "secondary" : "outline"}
              className={cn(
                currentService !== s.value && "border-white/10 bg-black/20 text-[var(--text-secondary)]",
              )}
              asChild
            >
              <Link href={buildHref(currentStatus, s.value)}>{s.label}</Link>
            </Button>
          ))}
        </div>
      </div>
      <SessionCreateDialog />
    </div>
  );
}
