"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { eachDayOfInterval, endOfMonth, endOfWeek, startOfMonth, startOfWeek } from "date-fns";
import { CalendarClock, ChevronLeft, ChevronRight, Lock, LockOpen } from "lucide-react";
import { adminBlockDate, adminUnblockDate } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_TYPE_LABELS, TIME_SLOT_LABELS } from "@/lib/constants";
import {
  DEFAULT_CALENDAR_TIMEZONE,
  formatCalendarDayKey,
  instantToCalendarDateKey,
  shiftCalendarMonthYm,
} from "@/lib/calendar-date-key";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type SlotState = "FREE" | "PENDING" | "CONFIRMED" | "BLOCKED";

export type CalendarDayData = {
  date: string;
  blocked: boolean;
  slots: Record<"morning" | "afternoon" | "night", SlotState>;
};

type SessionBrief = {
  id: string;
  scheduledDate: string;
  calendarDayKey: string;
  timeSlot: string;
  artistName: string;
  status: string;
  serviceType: string;
};

type BlockedRow = { id: string; dateKey: string; scope: string; reason: string | null };

function blockScopeLabel(scope: string): string {
  if (scope === "DAY") return "Día completo";
  return TIME_SLOT_LABELS[scope] ?? scope;
}

const SLOTS: ("morning" | "afternoon" | "night")[] = ["morning", "afternoon", "night"];

function slotBarClass(s: SlotState): string {
  switch (s) {
    case "FREE":
      return "bg-emerald-500/70";
    case "PENDING":
      return "bg-amber-500/80";
    case "CONFIRMED":
      return "bg-primary";
    case "BLOCKED":
      return "bg-zinc-600";
    default:
      return "bg-zinc-700";
  }
}

function slotLabel(s: SlotState): string {
  switch (s) {
    case "FREE":
      return "Libre";
    case "BLOCKED":
      return "Bloqueado";
    case "PENDING":
      return "Agendada";
    case "CONFIRMED":
      return "Confirmada";
    default:
      return s;
  }
}

function slotDetailLabel(s: SlotState): string {
  switch (s) {
    case "PENDING":
      return "Sesión agendada · pendiente de confirmar";
    case "CONFIRMED":
      return "Sesión agendada · confirmada";
    case "BLOCKED":
      return "Franja bloqueada (no disponible para reservas)";
    case "FREE":
      return "Sin sesión en esta franja";
    default:
      return slotLabel(s);
  }
}

export function AdminCalendarView({
  month,
  days,
  sessions,
  blocked,
  calendarTimeZone = DEFAULT_CALENDAR_TIMEZONE,
}: {
  month: string;
  days: CalendarDayData[];
  sessions: SessionBrief[];
  blocked: BlockedRow[];
  /** Misma zona que CALENDAR_TZ en el backend (días del calendario del estudio). */
  calendarTimeZone?: string;
}) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [pending, setPending] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const tz = calendarTimeZone;
  const prevMonth = shiftCalendarMonthYm(month, -1);
  const nextMonth = shiftCalendarMonthYm(month, 1);
  const monthAnchorUtc = new Date(`${month}-01T12:00:00.000Z`);

  const dayMap = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthAnchorUtc), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthAnchorUtc), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [monthAnchorUtc]);

  const stats = useMemo(() => {
    let pendingSlots = 0;
    let confirmedSlots = 0;
    let blockedDays = 0;
    for (const d of days) {
      if (d.blocked) {
        blockedDays += 1;
        continue;
      }
      for (const sl of SLOTS) {
        if (d.slots[sl] === "PENDING") pendingSlots += 1;
        if (d.slots[sl] === "CONFIRMED") confirmedSlots += 1;
      }
    }
    return { pendingSlots, confirmedSlots, blockedDays, totalSessions: sessions.length };
  }, [days, sessions.length]);

  const selectedDay = selectedDate ? dayMap.get(selectedDate) : undefined;
  const selectedDayFullBlock = selectedDate
    ? blocked.find((b) => b.dateKey === selectedDate && b.scope === "DAY")
    : undefined;

  function blockRowForSlot(slot: string) {
    if (!selectedDate) return undefined;
    return blocked.find((b) => b.dateKey === selectedDate && b.scope === slot);
  }

  function sessionsForSlot(dateStr: string, slot: string) {
    return sessions.filter((s) => s.calendarDayKey === dateStr && s.timeSlot === slot);
  }

  function sessionsForDay(dateStr: string) {
    return sessions.filter((s) => s.calendarDayKey === dateStr);
  }

  async function onUnblockById(id: string, message: string) {
    setPendingId(id);
    try {
      const r = await adminUnblockDate(id);
      if (!r.ok) {
        toast.error(r.error ?? "Error");
        return;
      }
      toast.success(message);
      setDetailOpen(false);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function onUnblockDay() {
    if (!selectedDayFullBlock) return;
    await onUnblockById(selectedDayFullBlock.id, "Día desbloqueado");
  }

  async function onBlockDay() {
    if (!selectedDate) return;
    setPending(true);
    try {
      const r = await adminBlockDate(selectedDate, blockReason || undefined, "DAY");
      if (!r.ok) {
        toast.error(r.error ?? "Error");
        return;
      }
      toast.success("Día bloqueado (todas las franjas)");
      setBlockReason("");
      setDetailOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function onBlockSlot(sl: "morning" | "afternoon" | "night") {
    if (!selectedDate) return;
    setPending(true);
    try {
      const r = await adminBlockDate(selectedDate, blockReason || undefined, sl);
      if (!r.ok) {
        toast.error(r.error ?? "Error");
        return;
      }
      toast.success("Franja bloqueada");
      setBlockReason("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-foreground">Calendario del estudio</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
            Vista mensual: la barra indica mañana, tarde y noche. Naranja o naranja primario = sesión agendada en esa
            franja. Debajo verás quién reservó. Toca un día para el detalle completo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="shrink-0 border-white/10 bg-black/20">
            <Link href={`/admin/dashboard/calendar?month=${prevMonth}`} aria-label="Mes anterior">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="min-w-[10rem] text-center font-display text-lg capitalize text-foreground">
            {formatCalendarDayKey(`${month}-15`, tz, { month: "long", year: "numeric" }, "es")}
          </span>
          <Button variant="outline" size="icon" asChild className="shrink-0 border-white/10 bg-black/20">
            <Link href={`/admin/dashboard/calendar?month=${nextMonth}`} aria-label="Mes siguiente">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" asChild className="ml-2 hidden sm:inline-flex">
            <Link href={`/admin/dashboard/calendar?month=${instantToCalendarDateKey(new Date(), tz).slice(0, 7)}`}>
              Hoy
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Franjas pendientes", value: stats.pendingSlots, className: "border-amber-500/25 bg-amber-950/20" },
          { label: "Franjas confirmadas", value: stats.confirmedSlots, className: "border-primary/25 bg-primary/5" },
          { label: "Días bloqueados", value: stats.blockedDays, className: "border-zinc-500/30 bg-zinc-900/40" },
          { label: "Sesiones en el mes", value: stats.totalSessions, className: "border-white/10 bg-black/25" },
        ].map((s) => (
          <div
            key={s.label}
            className={cn("rounded-xl border px-4 py-3 backdrop-blur-sm", s.className)}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">{s.label}</p>
            <p className="mt-1 font-display text-2xl text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-6 rounded-full bg-emerald-500/70" /> Libre
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-6 rounded-full bg-amber-500/80" /> Agendada (pendiente de confirmar)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-6 rounded-full bg-primary" /> Agendada (confirmada)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-6 rounded-full bg-zinc-600" /> Bloqueado
        </span>
        <span className="text-[var(--text-muted)]">Orden en la barra: mañana · tarde · noche</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-md">
        <div className="grid min-w-[720px] grid-cols-7 gap-1">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((w) => (
            <div
              key={w}
              className="pb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]"
            >
              {w}
            </div>
          ))}
          {gridDays.map((cell) => {
            const key = instantToCalendarDateKey(cell, tz);
            const d = dayMap.get(key);
            const inMonth = key.startsWith(`${month}-`);
            const isToday = key === instantToCalendarDateKey(new Date(), tz);
            const daySessions = inMonth ? sessionsForDay(key) : [];
            const daySummaryTitle = daySessions
              .map((s) => `${s.artistName} · ${TIME_SLOT_LABELS[s.timeSlot] ?? s.timeSlot} · ${sessionStatusEs(s.status)}`)
              .join("\n");

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (!inMonth) return;
                  setSelectedDate(key);
                  setDetailOpen(true);
                }}
                disabled={!inMonth}
                className={cn(
                  "flex min-h-[96px] flex-col gap-1 rounded-xl border p-2 text-left transition-colors",
                  inMonth
                    ? "border-white/10 bg-background-card/80 hover:border-primary/35 hover:bg-background-elevated/90"
                    : "cursor-default border-transparent bg-transparent opacity-30",
                  isToday && inMonth && "ring-1 ring-primary/50",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "font-mono text-sm",
                      inMonth ? "text-foreground" : "text-[var(--text-muted)]",
                      isToday && "font-semibold text-primary",
                    )}
                  >
                    {Number(key.slice(8, 10))}
                  </span>
                  {d?.blocked ? <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden /> : null}
                </div>
                {d && inMonth ? (
                  <div
                    className="flex h-2 w-full gap-px overflow-hidden rounded-full bg-black/50"
                    title="Mañana | Tarde | Noche — colores: libre / agendada pendiente / confirmada / bloqueado"
                  >
                    {SLOTS.map((sl) => (
                      <div
                        key={sl}
                        className={cn("min-w-0 flex-1", slotBarClass(d.slots[sl]))}
                        title={`${TIME_SLOT_LABELS[sl]?.split(" ")[0] ?? sl}: ${slotDetailLabel(d.slots[sl])}`}
                      />
                    ))}
                  </div>
                ) : null}
                {daySessions.length > 0 ? (
                  <p
                    className="line-clamp-2 text-[10px] leading-snug text-[var(--text-muted)]"
                    title={daySummaryTitle || undefined}
                  >
                    <CalendarClock className="mr-0.5 inline-block h-3 w-3 shrink-0 align-[-2px] text-amber-500/90" aria-hidden />
                    {daySessions.length === 1 ? (
                      <>
                        <span className="text-foreground/90">{daySessions[0].artistName}</span>
                        <span className="text-[var(--text-muted)]"> · {sessionStatusEs(daySessions[0].status)}</span>
                      </>
                    ) : (
                      <span>{daySessions.length} sesiones agendadas</span>
                    )}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-background-card/50 p-5">
          <h2 className="font-body text-base font-semibold text-foreground">Sesiones del mes</h2>
          <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto text-sm">
            {sessions.length === 0 ? (
              <li className="text-[var(--text-muted)]">No hay sesiones este mes.</li>
            ) : (
              sessions.map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-border/60 bg-black/20 px-3 py-2.5"
                >
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                    {formatCalendarDayKey(s.calendarDayKey, tz, { weekday: "short", day: "numeric", month: "short" }, "es")}{" "}
                    ·{" "}
                    {TIME_SLOT_LABELS[s.timeSlot] ?? s.timeSlot}
                  </span>
                  <p className="mt-0.5 font-medium text-foreground">{s.artistName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {formatServiceTypes(s.serviceType)} · {sessionStatusEs(s.status)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-background-card/50 p-5">
          <h2 className="font-body text-base font-semibold text-foreground">Bloqueos del mes</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Día completo o franjas sueltas; se guardan en base de datos y afectan el booking público.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {blocked.length === 0 ? (
              <li className="text-[var(--text-muted)]">No hay bloqueos en este mes.</li>
            ) : (
              blocked.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-col gap-2 rounded-lg border border-zinc-600/30 bg-zinc-950/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {formatCalendarDayKey(b.dateKey, tz, { weekday: "long", day: "numeric", month: "long" }, "es")}
                    </span>
                    <span className="ml-2 rounded border border-zinc-500/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
                      {blockScopeLabel(b.scope)}
                    </span>
                    {b.reason ? <span className="mt-1 block text-xs text-[var(--text-muted)]">{b.reason}</span> : null}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-zinc-500/50"
                    disabled={pendingId === b.id}
                    onClick={() => void onUnblockById(b.id, "Bloqueo eliminado")}
                  >
                    <LockOpen className="mr-1 h-3.5 w-3.5" />
                    Desbloquear
                  </Button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-background-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedDate
                ? formatCalendarDayKey(selectedDate, tz, { weekday: "long", day: "numeric", month: "long" }, "es")
                : "Día"}
            </DialogTitle>
          </DialogHeader>

          {selectedDate && selectedDay ? (
            <div className="space-y-5 text-sm">
              {selectedDay.blocked && selectedDayFullBlock ? (
                <div className="space-y-3 rounded-lg border border-zinc-600/40 bg-zinc-950/50 p-4">
                  <p className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Lock className="h-4 w-4 text-zinc-400" />
                    Este día está bloqueado por completo para reservas públicas.
                  </p>
                  {selectedDayFullBlock.reason ? (
                    <p className="text-xs text-[var(--text-muted)]">Motivo: {selectedDayFullBlock.reason}</p>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending || pendingId !== null}
                    onClick={() => void onUnblockDay()}
                  >
                    <LockOpen className="h-4 w-4" />
                    Desbloquear día
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {SLOTS.map((sl) => {
                      const st = selectedDay.slots[sl];
                      const list = sessionsForSlot(selectedDate, sl);
                      const slotBlock = blockRowForSlot(sl);
                      return (
                        <div key={sl} className="rounded-lg border border-white/10 bg-black/30 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-medium text-foreground">{TIME_SLOT_LABELS[sl] ?? sl}</span>
                            <span
                              className={cn(
                                "rounded-md border px-2 py-0.5 text-[11px] font-medium",
                                st === "FREE" && "border-emerald-500/30 text-emerald-300",
                                st === "PENDING" && "border-amber-500/35 text-amber-300",
                                st === "CONFIRMED" && "border-primary/35 text-primary",
                                st === "BLOCKED" && "border-zinc-500/40 text-zinc-300",
                              )}
                            >
                              {slotLabel(st)}
                            </span>
                          </div>
                          {list.length > 0 ? (
                            <div className="mt-2 space-y-1.5">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-amber-400/90">
                                Sesión agendada
                              </p>
                              <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                                {list.map((s) => (
                                  <li key={s.id} className="rounded-md border border-white/5 bg-black/20 px-2 py-1.5">
                                    <strong className="text-foreground">{s.artistName}</strong>
                                    <span className="block text-[10px] text-[var(--text-muted)]">
                                      {formatServiceTypes(s.serviceType)} · {sessionStatusEs(s.status)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-[var(--text-muted)]">Sin sesión agendada en esta franja.</p>
                          )}
                          {st === "FREE" ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-3 w-full border-zinc-500/40 sm:w-auto"
                              disabled={pending}
                              onClick={() => void onBlockSlot(sl)}
                            >
                              <Lock className="mr-1 h-3.5 w-3.5" />
                              Bloquear esta franja
                            </Button>
                          ) : null}
                          {st === "BLOCKED" && slotBlock ? (
                            <div className="mt-3 space-y-1">
                              {slotBlock.reason ? (
                                <p className="text-xs text-[var(--text-muted)]">Motivo: {slotBlock.reason}</p>
                              ) : null}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={pending || pendingId !== null}
                                onClick={() => void onUnblockById(slotBlock.id, "Franja desbloqueada")}
                              >
                                <LockOpen className="mr-1 h-3.5 w-3.5" />
                                Desbloquear franja
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <Label htmlFor="block-reason">Motivo opcional (aplica a bloqueos que hagas abajo)</Label>
                    <Textarea
                      id="block-reason"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Ej. Mantenimiento, feriado, sesión externa…"
                      rows={2}
                      className="resize-none border-white/10 bg-black/30"
                    />
                    <Button type="button" variant="secondary" disabled={pending} onClick={() => void onBlockDay()}>
                      <Lock className="h-4 w-4" />
                      Bloquear día completo
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatServiceTypes(s: string): string {
  return s
    .split(",")
    .map((x) => SERVICE_TYPE_LABELS[x.trim()] ?? x.trim())
    .join(", ");
}

function sessionStatusEs(status: string): string {
  const m: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
  };
  return m[status] ?? status;
}
