import { fetchAdmin } from "@/lib/api-admin";
import {
  AdminCalendarView,
  type CalendarDayData,
  type SlotState,
} from "@/features/admin/components/admin-calendar-view";
import { format } from "date-fns";

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const month = searchParams.month && /^\d{4}-\d{2}$/.test(searchParams.month)
    ? searchParams.month
    : format(new Date(), "yyyy-MM");

  const res = await fetchAdmin(`/api/admin/calendar?month=${month}`);
  if (!res.ok) {
    const errBody = await res.text();
    let hint = errBody.slice(0, 200);
    try {
      const j = JSON.parse(errBody) as { error?: string };
      if (j.error) hint = j.error;
    } catch {
      /* texto plano */
    }
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
        <p className="font-medium text-destructive">No se pudo cargar el calendario ({res.status})</p>
        <p className="mt-2 text-[var(--text-secondary)]">
          {res.status === 401
            ? "Sesión admin inválida o expirada. Cierra sesión y vuelve a entrar."
            : hint || "Revisa que el backend esté desplegado y la base tenga el esquema actual (migraciones Prisma)."}
        </p>
      </div>
    );
  }
  const data = (await res.json()) as {
    calendarTimeZone?: string;
    sessions: {
      id: string;
      scheduledDate: string;
      calendarDayKey: string;
      timeSlot: string;
      artistName: string;
      status: string;
      serviceType: string;
    }[];
    blocked: { id: string; dateKey: string; scope: string; reason: string | null }[];
    days?: {
      date: string;
      blocked: boolean;
      slots: Record<"morning" | "afternoon" | "night", SlotState>;
    }[];
  };

  const days = (data.days ?? []) as CalendarDayData[];

  return (
    <AdminCalendarView
      month={month}
      days={days}
      sessions={data.sessions}
      blocked={data.blocked}
      calendarTimeZone={data.calendarTimeZone ?? "America/Bogota"}
    />
  );
}
