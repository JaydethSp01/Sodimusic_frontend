import { fetchAdmin } from "@/lib/api-admin";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { SectionCallout } from "@/components/shared/section-callout";

type SlotState = "FREE" | "PENDING" | "CONFIRMED" | "BLOCKED";

function slotLabel(s: SlotState): string {
  switch (s) {
    case "FREE":
      return "Libre";
    case "BLOCKED":
      return "Bloqueado";
    case "PENDING":
      return "Pendiente";
    case "CONFIRMED":
      return "Confirmada";
    default:
      return s;
  }
}

function slotClass(s: SlotState): string {
  switch (s) {
    case "FREE":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "BLOCKED":
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/35";
    case "PENDING":
      return "bg-amber-500/15 text-amber-300 border-amber-500/35";
    case "CONFIRMED":
      return "bg-primary/20 text-primary border-primary/35";
    default:
      return "bg-background-card text-[var(--text-secondary)]";
  }
}

export default async function AdminCalendarPage() {
  const month = format(new Date(), "yyyy-MM");
  const res = await fetchAdmin(`/api/admin/calendar?month=${month}`);
  if (!res.ok) {
    return <p className="text-red-500">No se pudo cargar el calendario.</p>;
  }
  const data = (await res.json()) as {
    sessions: { id: string; scheduledDate: string; timeSlot: string; artistName: string; status: string }[];
    blocked: { id: string; date: string; reason: string | null }[];
    days?: {
      date: string;
      blocked: boolean;
      slots: Record<"morning" | "afternoon" | "night", SlotState>;
    }[];
  };

  const days = data.days ?? [];

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">Calendario y disponibilidad</h1>
      <div className="mt-2 max-w-4xl">
        <SectionCallout>
          Mes {month}. Cada día tiene tres franjas (mañana, tarde, noche). Verde = libre; naranja = pendiente; naranja intenso =
          confirmada; gris = día bloqueado.
        </SectionCallout>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-background-secondary">
              <th className="p-3 font-medium">Día</th>
              <th className="p-3 font-medium">Mañana</th>
              <th className="p-3 font-medium">Tarde</th>
              <th className="p-3 font-medium">Noche</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date} className="border-b border-border/80">
                <td className="p-3 font-mono text-xs text-[var(--text-muted)]">
                  {format(parseISO(d.date), "EEE d MMM", { locale: es })}
                </td>
                {(["morning", "afternoon", "night"] as const).map((slot) => {
                  const st = d.slots[slot];
                  return (
                    <td key={slot} className="p-2">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${slotClass(st)}`}
                      >
                        {slotLabel(st)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-body text-lg font-semibold">Sesiones del mes</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {data.sessions.map((s) => (
              <li key={s.id} className="rounded border border-border bg-background-card p-3">
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  {format(parseISO(s.scheduledDate), "d MMM", { locale: es })} · {s.timeSlot}
                </span>
                <br />
                {s.artistName} — {s.status}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-body text-lg font-semibold">Días bloqueados</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {data.blocked.map((b) => (
              <li key={b.id} className="rounded border border-border bg-background-card p-3">
                {format(parseISO(b.date), "EEEE d MMM yyyy", { locale: es })}
                {b.reason ? ` — ${b.reason}` : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
