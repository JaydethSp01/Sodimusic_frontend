import { fetchAdmin } from "@/lib/api-admin";
import { SectionCallout } from "@/components/shared/section-callout";
import {
  AdminDashboardInsights,
  type DashboardStatsPayload,
} from "@/features/admin/components/admin-dashboard-insights";

export default async function AdminDashboardPage() {
  const res = await fetchAdmin("/api/admin/dashboard/stats");
  if (!res.ok) {
    return <p className="text-red-500">No se pudieron cargar las métricas.</p>;
  }
  const raw = (await res.json()) as Partial<DashboardStatsPayload> & {
    pendingSessions: number;
    sessionsWeek: number;
    beatsAvailable: number;
    productionsTotal: number;
  };

  const emptyDays = (): { date: string; count: number }[] => [];

  const data: DashboardStatsPayload = {
    pendingSessions: raw.pendingSessions,
    sessionsWeek: raw.sessionsWeek,
    beatsAvailable: raw.beatsAvailable,
    productionsTotal: raw.productionsTotal,
    pageViewsTotal: raw.pageViewsTotal ?? 0,
    pageViewsLast7Days: raw.pageViewsLast7Days ?? 0,
    pageViewsByDay: raw.pageViewsByDay ?? emptyDays(),
    sessionsCreatedByDay: raw.sessionsCreatedByDay ?? emptyDays(),
    sessionsByStatus: raw.sessionsByStatus ?? [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Panel</h1>
        <div className="mt-2 max-w-2xl">
          <SectionCallout>
            Resumen rápido para gestionar el día a día: sesiones, beats, visitas al sitio y producciones.
          </SectionCallout>
        </div>
      </div>

      <AdminDashboardInsights data={data} />
    </div>
  );
}
