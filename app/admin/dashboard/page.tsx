import { fetchAdmin } from "@/lib/api-admin";
import { SectionCallout } from "@/components/shared/section-callout";
import {
  AdminDashboardInsights,
  type DashboardStatsPayload,
  type RecentMessage,
} from "@/features/admin/components/admin-dashboard-insights";
import type { Paginated } from "@/types/models";

export default async function AdminDashboardPage() {
  const [res, msgRes] = await Promise.all([
    fetchAdmin("/api/admin/dashboard/stats"),
    fetchAdmin("/api/admin/messages?status=NEW&page=1&pageSize=5"),
  ]);
  if (!res.ok) {
    return <p className="text-red-500">No se pudieron cargar las métricas.</p>;
  }
  const recentMessages: RecentMessage[] = msgRes.ok
    ? ((await msgRes.json()) as Paginated<RecentMessage>).items.slice(0, 5)
    : [];
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
    ...(typeof raw.productsActive === "number" ? { productsActive: raw.productsActive } : {}),
    ...(typeof raw.channelsActive === "number" ? { channelsActive: raw.channelsActive } : {}),
    ...(typeof raw.messagesNew === "number" ? { messagesNew: raw.messagesNew } : {}),
    ...(typeof raw.subscribersActive === "number" ? { subscribersActive: raw.subscribersActive } : {}),
    ...(typeof raw.beatInterests30d === "number" ? { beatInterests30d: raw.beatInterests30d } : {}),
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
            Resumen rápido para gestionar el día a día: sesiones, beats, mensajes, suscriptores, visitas al sitio,
            producciones y tienda.
          </SectionCallout>
        </div>
      </div>

      <AdminDashboardInsights data={data} recentMessages={recentMessages} />
    </div>
  );
}
