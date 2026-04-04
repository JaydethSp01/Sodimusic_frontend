import { fetchAdmin } from "@/lib/api-admin";
import { SessionAdminTable } from "@/features/admin/components/session-admin-table";
import type { BookingSessionRow } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionCallout } from "@/components/shared/section-callout";

export default async function AdminSessionsPage() {
  const res = await fetchAdmin("/api/admin/sessions");
  if (!res.ok) {
    return <p className="text-red-500">No se pudieron cargar las sesiones.</p>;
  }
  const data = (await res.json()) as { items: BookingSessionRow[] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Sesiones</h1>
        <div className="mt-2 max-w-3xl">
          <SectionCallout>
          Gestiona estados y guarda briefing/fechas internas. Cambios se reflejan en tiempo real.
          </SectionCallout>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Lista de sesiones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <SessionAdminTable sessions={data.items} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
