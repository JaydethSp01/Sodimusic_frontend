import { fetchAdmin } from "@/lib/api-admin";
import { SessionAdminTable } from "@/features/admin/components/session-admin-table";
import { SessionsFilterBar } from "@/features/admin/components/sessions-filter-bar";
import type { BookingSessionRow } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionCallout } from "@/components/shared/section-callout";

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
    return <p className="text-red-500">No se pudieron cargar las sesiones.</p>;
  }
  const data = (await res.json()) as { items: BookingSessionRow[] };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Sesiones</h1>
        <div className="mt-2 max-w-3xl">
          <SectionCallout>
            Alta manual, cambio de estado, notas internas y eliminación. Las confirmaciones pueden enviar correo al
            artista según la lógica del servidor.
          </SectionCallout>
        </div>
      </div>

      <SessionsFilterBar currentStatus={status} currentService={service} />

      <Card className="border-white/10 bg-black/20">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <CardTitle className="text-base font-semibold">Lista de sesiones ({data.items.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <SessionAdminTable sessions={data.items} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
