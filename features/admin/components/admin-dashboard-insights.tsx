"use client";

import { useInView } from "framer-motion";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, BarChart3, CalendarPlus } from "lucide-react";

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

const CHART_BAR_MAX_PX = 108;
const CHART_COL_WIDTH_PX = 36;

function MiniBarChart({
  data,
  accentClass,
  zeroClass = "bg-zinc-500/35",
}: {
  data: { date: string; count: number }[];
  accentClass: string;
  /** Clase para días con count 0 (debe contrastar con el fondo). */
  zeroClass?: string;
}) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--text-muted)]">
        Sin serie diaria (actualiza el backend o recarga tras desplegar).
      </p>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.count));
  const minWidthPx = data.length * CHART_COL_WIDTH_PX + (data.length - 1) * 6;

  return (
    <div className="pt-2">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div
          className="flex h-[120px] items-end gap-1.5 border-b border-white/10 pb-1"
          style={{ minWidth: minWidthPx }}
        >
          {data.map((d) => {
            const barPx =
              d.count === 0 ? 5 : Math.max(10, Math.round((d.count / max) * CHART_BAR_MAX_PX));
            return (
              <div
                key={d.date}
                className="flex shrink-0 flex-col items-center justify-end"
                style={{ width: CHART_COL_WIDTH_PX }}
                title={`${d.date}: ${d.count}`}
              >
                {d.count > 0 ? (
                  <span className="mb-0.5 font-mono text-[10px] font-medium text-primary">{d.count}</span>
                ) : (
                  <span className="mb-0.5 h-3" aria-hidden />
                )}
                <div
                  className={`w-full rounded-t transition-all duration-300 ${d.count > 0 ? accentClass : zeroClass}`}
                  style={{ height: `${barPx}px`, minHeight: d.count > 0 ? 10 : 5 }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 overflow-x-auto">
        <div className="flex gap-1.5" style={{ minWidth: minWidthPx }}>
          {data.map((d) => (
            <div
              key={`${d.date}-lbl`}
              className="shrink-0 text-center font-mono text-[9px] text-[var(--text-muted)]"
              style={{ width: CHART_COL_WIDTH_PX }}
            >
              {d.date.slice(8)}
            </div>
          ))}
        </div>
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
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.status}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-[var(--text-secondary)]">{STATUS_LABEL[r.status] ?? r.status}</span>
            <span className="font-mono text-primary">{r.count}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/40 to-primary/80 transition-all duration-500"
              style={{ width: `${(r.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminDashboardInsights({ data }: { data: DashboardStatsPayload }) {
  const kpiRef = useRef(null);
  const kpiInView = useInView(kpiRef, { once: true, margin: "-40px" });
  const [kpiStart, setKpiStart] = useState(false);

  useEffect(() => {
    if (kpiInView) setKpiStart(true);
  }, [kpiInView]);

  const kpiItems = [
    { title: "Sesiones pendientes", value: data.pendingSessions },
    { title: "Sesiones esta semana", value: data.sessionsWeek },
    { title: "Beats disponibles", value: data.beatsAvailable },
    { title: "Producciones en portafolio", value: data.productionsTotal },
  ];

  return (
    <div className="space-y-6">
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
            <Card className="h-full border-white/[0.06] bg-background-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-[var(--text-secondary)]">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-4xl text-primary">
                  {kpiStart ? <CountUp end={item.value} duration={1.2} /> : "0"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-24px" }}>
          <Card className="h-full border-white/[0.06] bg-background-card/80">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <Eye className="h-4 w-4 text-primary/80" aria-hidden />
              <CardTitle className="text-base font-normal">Visitas al sitio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Total registradas</p>
                <p className="mt-1 font-display text-3xl text-foreground">{data.pageViewsTotal.toLocaleString("es-CO")}</p>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Últimos 7 días</p>
                <p className="mt-1 font-display text-2xl text-primary">{data.pageViewsLast7Days.toLocaleString("es-CO")}</p>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                Cada navegación en páginas públicas suma una vista (sin datos personales). Útil para ver tendencias.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-24px" }}>
          <Card className="h-full border-white/[0.06] bg-background-card/80 lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <BarChart3 className="h-4 w-4 text-primary/80" aria-hidden />
              <CardTitle className="text-base font-normal">Vistas por día (14 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <MiniBarChart data={data.pageViewsByDay} accentClass="bg-primary shadow-[0_0_12px_rgba(255,107,0,0.25)]" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-24px" }}>
          <Card className="h-full border-white/[0.06] bg-background-card/80">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <CalendarPlus className="h-4 w-4 text-[var(--gold)]" aria-hidden />
              <CardTitle className="text-base font-normal">Sesiones nuevas por día</CardTitle>
            </CardHeader>
            <CardContent>
              <MiniBarChart
                data={data.sessionsCreatedByDay}
                accentClass="bg-[#d4a017] shadow-[0_0_10px_rgba(212,160,23,0.2)]"
                zeroClass="bg-zinc-500/40"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-24px" }}>
          <Card className="h-full border-white/[0.06] bg-background-card/80">
            <CardHeader>
              <CardTitle className="text-base font-normal">Sesiones por estado</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusDistribution rows={data.sessionsByStatus} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
