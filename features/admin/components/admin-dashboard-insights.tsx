"use client";

import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  CalendarPlus,
  CalendarRange,
  ClipboardList,
  Eye,
  LayoutGrid,
  Music2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export type DashboardStatsPayload = {
  pendingSessions: number;
  sessionsWeek: number;
  beatsAvailable: number;
  productionsTotal: number;
  pageViewsTotal: number;
  pageViewsLast7Days: number;
  pageViewsByDay: { date: string; count: number }[];
  sessionsCreatedByDay: { date: string; count: number }[];
  sessionsByStatus: { status: string; count: number }[];
};

const CHART_BAR_MAX_PX = 100;

function MiniBarChart({
  data,
  accentBar,
  accentGlow,
  zeroBar,
}: {
  data: { date: string; count: number }[];
  accentBar: string;
  accentGlow: string;
  zeroBar: string;
}) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-[var(--text-muted)]">
        Sin serie diaria. Despliega el backend actualizado y recarga.
      </p>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.count));
  const cols = data.length;

  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-b from-black/50 via-black/35 to-black/20 p-3 sm:p-4",
        "ring-1 ring-inset ring-white/[0.06]",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
      )}
    >
      <div
        className="grid h-[132px] w-full gap-x-0.5 sm:gap-x-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        role="img"
        aria-label="Gráfico de barras por día"
      >
        {data.map((d) => {
          const barPx =
            d.count === 0 ? 4 : Math.max(8, Math.round((d.count / max) * CHART_BAR_MAX_PX));
          return (
            <div
              key={d.date}
              className="flex min-h-0 min-w-0 flex-col items-stretch justify-end gap-1"
              title={`${d.date}: ${d.count}`}
            >
              <div className="flex min-h-[72px] flex-col items-center justify-end">
                {d.count > 0 ? (
                  <span
                    className={cn(
                      "mb-0.5 font-mono text-[9px] font-semibold tabular-nums sm:text-[10px]",
                      accentGlow,
                    )}
                  >
                    {d.count}
                  </span>
                ) : (
                  <span className="mb-0.5 h-3 shrink-0" aria-hidden />
                )}
                <div
                  className={cn(
                    "w-[70%] max-w-[32px] rounded-t-sm transition-[height,filter] duration-300 hover:brightness-110 sm:w-[75%]",
                    d.count > 0 ? accentBar : zeroBar,
                  )}
                  style={{ height: `${barPx}px`, minHeight: d.count > 0 ? 8 : 4 }}
                />
              </div>
              <span className="truncate text-center font-mono text-[7px] uppercase tracking-tighter text-[var(--text-muted)] sm:text-[8px]">
                {d.date.slice(8)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusDistribution({ rows }: { rows: { status: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">Sin datos de sesiones.</p>;
  }
  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r.status}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
            <span className="font-medium text-[var(--text-secondary)]">{STATUS_LABEL[r.status] ?? r.status}</span>
            <span className="font-mono tabular-nums text-primary">{r.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/[0.04]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/50 via-primary to-primary/90 shadow-[0_0_12px_rgba(255,107,0,0.15)] transition-all duration-500"
              style={{ width: `${(r.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

const panelCard =
  "border border-white/[0.08] bg-gradient-to-br from-[#181818]/95 to-[#101010]/98 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-sm";

export function AdminDashboardInsights({ data }: { data: DashboardStatsPayload }) {
  const kpiRef = useRef(null);
  const kpiInView = useInView(kpiRef, { once: true, margin: "-40px" });
  const [kpiStart, setKpiStart] = useState(false);

  useEffect(() => {
    if (kpiInView) setKpiStart(true);
  }, [kpiInView]);

  const kpiItems = [
    {
      title: "Sesiones pendientes",
      value: data.pendingSessions,
      icon: ClipboardList,
      hint: "Por confirmar",
    },
    {
      title: "Sesiones esta semana",
      value: data.sessionsWeek,
      icon: CalendarRange,
      hint: "Próximos 7 días",
    },
    {
      title: "Beats disponibles",
      value: data.beatsAvailable,
      icon: Music2,
      hint: "En catálogo",
    },
    {
      title: "Producciones en portafolio",
      value: data.productionsTotal,
      icon: LayoutGrid,
      hint: "Total publicadas",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        ref={kpiRef}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial="hidden"
        animate={kpiStart ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
      >
        {kpiItems.map((item) => (
          <motion.div key={item.title} variants={fadeIn}>
            <div
              className={cn(
                "group relative h-full overflow-hidden rounded-2xl p-5",
                panelCard,
                "transition-shadow duration-300 hover:border-primary/20 hover:shadow-[0_0_0_1px_rgba(255,107,0,0.12),0_16px_48px_-16px_rgba(255,107,0,0.12)]",
              )}
            >
              <div
                className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/[0.07] blur-2xl transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-primary/90">
                  <item.icon className="h-4 w-4" aria-hidden />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  {item.hint}
                </span>
              </div>
              <p className="relative mt-4 text-sm font-medium text-[var(--text-secondary)]">{item.title}</p>
              <p className="relative mt-2 font-display text-4xl tabular-nums tracking-tight text-primary">
                {kpiStart ? <CountUp end={item.value} duration={1.2} /> : "0"}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-24px" }}>
          <div className={cn("flex h-full flex-col rounded-2xl p-5", panelCard)}>
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-4">
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary">
                <Eye className="h-4 w-4" aria-hidden />
              </div>
              <div>
                <h3 className="font-display text-lg tracking-wide text-foreground">Visitas al sitio</h3>
                <p className="text-xs text-[var(--text-muted)]">Tráfico páginas públicas</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-black/30 p-4 ring-1 ring-inset ring-white/[0.05]">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  Total registradas
                </p>
                <p className="mt-2 font-display text-3xl tabular-nums text-foreground">
                  {data.pageViewsTotal.toLocaleString("es-CO")}
                </p>
              </div>
              <div className="rounded-xl bg-primary/[0.06] p-4 ring-1 ring-inset ring-primary/15">
                <p className="font-mono text-[10px] uppercase tracking-wider text-primary/80">Últimos 7 días</p>
                <p className="mt-2 font-display text-3xl tabular-nums text-primary">
                  {data.pageViewsLast7Days.toLocaleString("es-CO")}
                </p>
              </div>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-[var(--text-muted)]">
              Cada visita cuenta una navegación (sin datos personales). Sirve para ver tendencias frente a campañas o
              lanzamientos.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-24px" }}
          className="lg:col-span-2"
        >
          <Card className={cn("h-full rounded-2xl border-0 shadow-none", panelCard)}>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-white/[0.06] pb-4">
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary">
                <BarChart3 className="h-4 w-4" aria-hidden />
              </div>
              <div>
                <CardTitle className="font-display text-lg font-normal tracking-wide">Vistas por día</CardTitle>
                <p className="text-xs text-[var(--text-muted)]">Últimos 14 días · zona UTC del servidor</p>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <MiniBarChart
                data={data.pageViewsByDay}
                accentBar="bg-gradient-to-t from-primary/90 to-primary shadow-[0_0_16px_rgba(255,107,0,0.2)]"
                accentGlow="text-primary"
                zeroBar="bg-zinc-600/30"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-24px" }}>
          <Card className={cn("h-full rounded-2xl border-0 shadow-none", panelCard)}>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-white/[0.06] pb-4">
              <div className="rounded-lg border border-[#d4a017]/25 bg-[#d4a017]/10 p-2 text-[#d4a017]">
                <CalendarPlus className="h-4 w-4" aria-hidden />
              </div>
              <div>
                <CardTitle className="font-display text-lg font-normal tracking-wide">Sesiones nuevas</CardTitle>
                <p className="text-xs text-[var(--text-muted)]">Alta en el sistema por día (14 días)</p>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <MiniBarChart
                data={data.sessionsCreatedByDay}
                accentBar="bg-gradient-to-t from-[#b8890f] to-[#d4a017] shadow-[0_0_14px_rgba(212,160,23,0.18)]"
                accentGlow="text-[#e8c547]"
                zeroBar="bg-zinc-600/35"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-24px" }}>
          <Card className={cn("h-full rounded-2xl border-0 shadow-none", panelCard)}>
            <CardHeader className="border-b border-white/[0.06] pb-4">
              <CardTitle className="font-display text-lg font-normal tracking-wide">Sesiones por estado</CardTitle>
              <p className="text-xs text-[var(--text-muted)]">Distribución en el histórico actual</p>
            </CardHeader>
            <CardContent className="pt-5">
              <StatusDistribution rows={data.sessionsByStatus} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
