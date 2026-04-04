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
    return <p className="text-red-500">No se pudo cargar el calendario.</p>;
  }
  const data = (await res.json()) as {
    sessions: {
      id: string;
      scheduledDate: string;
      timeSlot: string;
      artistName: string;
      status: string;
      serviceType: string;
    }[];
    blocked: { id: string; date: string; reason: string | null }[];
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
    />
  );
}
