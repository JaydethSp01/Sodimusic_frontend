import { fetchAdmin } from "@/lib/api-admin";
import { SessionAdminTable } from "@/features/admin/components/session-admin-table";
import { SessionsFilterBar } from "@/features/admin/components/sessions-filter-bar";
import { AdminErrorNotice } from "@/features/admin/components/admin-primitives";
import type { BookingSessionRow } from "@/types/models";

type Search = { status?: string; service?: string };

export default async function AdminSessionsPage({ searchParams }: { searchParams: Search }) {
  const status = searchParams.status ?? "all";
  const service = searchParams.service ?? "all";

  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (service !== "all") params.set("serviceType", service);
  const qs = params.toString();

  const res = await fetchAdmin(`/api/admin/sessions${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    return <AdminErrorNotice>No se pudieron cargar las sesiones.</AdminErrorNotice>;
  }
  const data = (await res.json()) as { items: BookingSessionRow[] };
  const n = data.items.length;

  return (
    <div className="space-y-4">
      <SessionsFilterBar currentStatus={status} currentService={service} summary={`${n} ${n === 1 ? "sesión" : "sesiones"}`} />
      <SessionAdminTable sessions={data.items} />
    </div>
  );
}
