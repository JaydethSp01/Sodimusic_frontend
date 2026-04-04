import { fetchAdmin } from "@/lib/api-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionCallout } from "@/components/shared/section-callout";

export default async function AdminDashboardPage() {
  const res = await fetchAdmin("/api/admin/dashboard/stats");
  if (!res.ok) {
    return <p className="text-red-500">No se pudieron cargar las métricas.</p>;
  }
  const data = (await res.json()) as {
    pendingSessions: number;
    sessionsWeek: number;
    beatsAvailable: number;
    productionsTotal: number;
  };

  const items = [
    { title: "Sesiones pendientes", value: data.pendingSessions },
    { title: "Sesiones esta semana", value: data.sessionsWeek },
    { title: "Beats disponibles", value: data.beatsAvailable },
    { title: "Producciones en portafolio", value: data.productionsTotal },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Panel</h1>
        <div className="mt-2 max-w-2xl">
          <SectionCallout>
          Resumen rápido para gestionar el día a día: sesiones, beats y producciones.
          </SectionCallout>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-[var(--text-secondary)]">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-4xl text-primary">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
