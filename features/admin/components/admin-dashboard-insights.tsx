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

const CHART_BAR_MAX_PX = 104;

function MiniBarChart({
  data,
  accentClass,
}: {
  data: { date: string; count: number }[];
  accentClass: string;
}) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--text-muted)]">
        Sin serie diaria (actualiza el backend o recarga tras desplegar).
      </p>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="pt-2">
      <div className="flex h-[112px] items-end gap-1 border-b border-white/5 pb-0.5">
        {data.map((d) => {
          const barPx =
            d.count === 0 ? 3 : Math.max(6, Math.round((d.count / max) * CHART_BAR_MAX_PX));
          return (
            <div
              key={d.date}
              className="group relative flex min-w-0 flex-1 flex-col justify-end"
              title={`${d.date}: ${d.count}`}
            >
              <div
                className={`w-full rounded-t transition-all duration-300 group-hover:brightness-110 ${accentClass}`}
                style={{
                  height: barPx,
                  minHeight: 3,
                  opacity: d.count ? 0.9 : 0.25,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1">
        {data.map((d) => (
          <div key={`${d.date}-lbl`} className="min-w-0 flex-1 truncate text-center font-mono text-[9px] text-[var(--text-muted)]">
            {d.date.slice(8)}
          </div>
        ))}
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
              <MiniBarChart data={data.pageViewsByDay} accentClass="bg-primary/50" />
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
              <MiniBarChart data={data.sessionsCreatedByDay} accentClass="bg-[var(--gold)]/45" />
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
