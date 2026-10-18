"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarPlus,
  CalendarRange,
  ClipboardList,
  Eye,
  Heart,
  Inbox,
  LayoutGrid,
  Mail,
  Music2,
  ShoppingBag,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { AdminKpi } from "@/components/ds/admin-kpi";
import { EmptyState } from "@/components/ds/empty-state";
import { ListRow } from "@/components/ds/list-row";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { AdminSection } from "@/features/admin/components/admin-primitives";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/types/models";

/** Contador con rAF y ease-out (sustituye a react-countup; mismo formato con separador de miles). */
function CountUpNumber({ end, durationMs = 1200 }: { end: number; durationMs?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(end);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, durationMs]);
  return <>{n.toLocaleString("en-US")}</>;
}

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
  /** Opcional: solo si el backend lo devuelve */
  productsActive?: number;
  /** v3: canales de YouTube activos */
  channelsActive?: number;
  /** v3: mensajes de contacto en estado NEW */
  messagesNew?: number;
  /** v3: suscriptores sin baja */
  subscribersActive?: number;
  /** v3: intereses en beats en los últimos 30 días */
  beatInterests30d?: number;
  pageViewsTotal: number;
  pageViewsLast7Days: number;
  pageViewsByDay: { date: string; count: number }[];
  sessionsCreatedByDay: { date: string; count: number }[];
  sessionsByStatus: { status: string; count: number }[];
};

const CHART_BAR_MAX_PX = 100;

function MiniBarChart({ data, tone }: { data: { date: string; count: number }[]; tone: "fire" | "gold" }) {
  if (data.length === 0) {
    return (
      <Text size="body-sm" tone="3" className="py-10 text-center">
        Sin serie diaria. Despliega el backend actualizado y recarga.
      </Text>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.count));
  const cols = data.length;

  return (
    <div className="rounded border border-line-1 bg-ink-1 p-3 sm:p-4">
      <div
        className="grid h-[132px] w-full gap-x-0.5 sm:gap-x-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        role="img"
        aria-label="Gráfico de barras por día"
      >
        {data.map((d) => {
          const barPx = d.count === 0 ? 4 : Math.max(8, Math.round((d.count / max) * CHART_BAR_MAX_PX));
          return (
            <div key={d.date} className="flex min-h-0 min-w-0 flex-col items-stretch justify-end gap-1" title={`${d.date}: ${d.count}`}>
              <div className="flex min-h-[72px] flex-col items-center justify-end">
                {d.count > 0 ? (
                  <span className={cn("mb-0.5 font-mono text-label-sm tabular-nums", tone === "fire" ? "text-fire-400" : "text-gold-400")}>{d.count}</span>
                ) : (
                  <span className="mb-0.5 h-3 shrink-0" aria-hidden />
                )}
                <div
                  className={cn(
                    "w-[70%] max-w-[32px] rounded-t-sm transition-[height,filter] duration-200 hover:brightness-110 sm:w-[75%]",
                    d.count > 0 ? (tone === "fire" ? "bg-fire-500" : "bg-gold-500") : "bg-ink-4",
                  )}
                  style={{ height: `${barPx}px`, minHeight: d.count > 0 ? 8 : 4 }}
                />
              </div>
              <span className="truncate text-center font-mono text-label-sm text-text-3 max-sm:[&:nth-child(odd)]:invisible">{d.date.slice(8)}</span>
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
    return (
      <Text size="body-sm" tone="3">
        Sin datos de sesiones.
      </Text>
    );
  }
  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r.status}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="text-body-sm font-medium text-text-2">{STATUS_LABEL[r.status] ?? r.status}</span>
            <span className="font-mono text-body-sm tabular-nums text-fire-400">{r.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink-4">
            <div className="h-full rounded-full bg-fire-500 transition-[width] duration-500 ease-out" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const SUBJECT_LABEL: Record<string, string> = {
  PRENSA: "Prensa",
  DEMO: "Demo",
  BOOKING_ARTISTA: "Booking",
  COLABORACION: "Colaboración",
  OTRO: "Otro",
};

const recentDateFmt = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export type RecentMessage = Pick<ContactMessage, "id" | "name" | "email" | "subject" | "message" | "createdAt">;

function RecentMessagesList({ rows }: { rows: RecentMessage[] }) {
  if (rows.length === 0) {
    return <EmptyState icon={Inbox} title="Bandeja al día" description="No hay mensajes nuevos." className="py-10" />;
  }
  return (
    <ul className="-mx-2">
      {rows.map((m) => (
        <ListRow
          key={m.id}
          as="li"
          media={<Avatar name={m.name} size={40} />}
          title={m.name}
          titleAs="p"
          meta={
            <>
              <Badge tone="fire">{SUBJECT_LABEL[m.subject] ?? m.subject}</Badge>
              <span className="truncate">{m.email}</span>
            </>
          }
          data={
            <time suppressHydrationWarning dateTime={m.createdAt}>
              {recentDateFmt.format(new Date(m.createdAt))}
            </time>
          }
          className="last:border-0"
        />
      ))}
    </ul>
  );
}

type KpiItem = { title: string; value: number; icon: LucideIcon; hint: string; href?: string };

export function AdminDashboardInsights({
  data,
  recentMessages = [],
}: {
  data: DashboardStatsPayload;
  /** Últimos mensajes de contacto en estado NEW (máx. 5) */
  recentMessages?: RecentMessage[];
}) {
  const kpiItems: KpiItem[] = [
    { title: "Sesiones pendientes", value: data.pendingSessions, icon: ClipboardList, hint: "Por confirmar", href: "/admin/dashboard/sessions?status=PENDING" },
    { title: "Sesiones esta semana", value: data.sessionsWeek, icon: CalendarRange, hint: "Próximos 7 días", href: "/admin/dashboard/calendar" },
    { title: "Beats disponibles", value: data.beatsAvailable, icon: Music2, hint: "En catálogo", href: "/admin/dashboard/beats" },
    { title: "Producciones en portafolio", value: data.productionsTotal, icon: LayoutGrid, hint: "Total publicadas", href: "/admin/dashboard/productions" },
    ...(typeof data.productsActive === "number"
      ? [{ title: "Productos activos", value: data.productsActive, icon: ShoppingBag, hint: "Visibles en la tienda", href: "/admin/dashboard/tienda" }]
      : []),
    ...(typeof data.channelsActive === "number"
      ? [{ title: "Canales activos", value: data.channelsActive, icon: Tv, hint: "YouTube visibles", href: "/admin/dashboard/canales" }]
      : []),
    ...(typeof data.messagesNew === "number"
      ? [{ title: "Mensajes nuevos", value: data.messagesNew, icon: Inbox, hint: "Sin leer", href: "/admin/dashboard/mensajes" }]
      : []),
    ...(typeof data.subscribersActive === "number"
      ? [{ title: "Suscriptores", value: data.subscribersActive, icon: Mail, hint: "Boletín activo", href: "/admin/dashboard/suscriptores" }]
      : []),
    ...(typeof data.beatInterests30d === "number"
      ? [{ title: "Intereses en beats", value: data.beatInterests30d, icon: Heart, hint: "Últimos 30 días", href: "/admin/dashboard/mensajes?tab=beats" }]
      : []),
  ];

  return (
    <div className="space-y-8">
      <section aria-label="Cifras clave">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kpiItems.map((item) => (
            <li key={item.title}>
              <AdminKpi
                className="group relative h-full transition-[border-color,box-shadow] duration-150 hover:border-line-fire focus-within:border-line-fire"
                icon={item.icon}
                hint={item.hint}
                label={
                  item.href ? (
                    <Link href={item.href} className="after:absolute after:inset-0 after:rounded-lg after:content-[''] hover:text-text-1 focus-visible:outline-none">
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )
                }
                value={<CountUpNumber end={item.value} durationMs={1200} />}
              />
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {typeof data.messagesNew === "number" ? (
          <AdminSection
            id="recent-messages"
            title="Mensajes nuevos"
            description={`${data.messagesNew} sin leer · últimos ${Math.min(5, recentMessages.length)}`}
            action={
              <Button asChild variant="link" size="sm" withArrow>
                <Link href="/admin/dashboard/mensajes">Ver todos</Link>
              </Button>
            }
            className="lg:col-span-2"
            contentClassName="px-5 py-3"
          >
            <RecentMessagesList rows={recentMessages.slice(0, 5)} />
          </AdminSection>
        ) : null}

        <AdminSection id="site-visits" title={<span className="inline-flex items-center gap-2"><Eye className="h-5 w-5 text-fire-400" strokeWidth={1.75} aria-hidden />Visitas al sitio</span>} description="Tráfico de las páginas públicas">
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded border border-line-1 bg-ink-1 p-4">
              <dt className="text-label text-text-3">Total registradas</dt>
              <dd className="mt-2 font-display font-extrabold text-display-sm tabular-nums text-text-1">{data.pageViewsTotal.toLocaleString("es-CO")}</dd>
            </div>
            <div className="rounded border border-line-fire bg-fire-500/[0.06] p-4">
              <dt className="text-label text-fire-400">Últimos 7 días</dt>
              <dd className="mt-2 font-display font-extrabold text-display-sm tabular-nums text-fire-400">{data.pageViewsLast7Days.toLocaleString("es-CO")}</dd>
            </div>
          </dl>
          <Text size="body-sm" tone="3" className="mt-4">
            Cada visita cuenta una navegación (sin datos personales). Sirve para ver tendencias frente a campañas o lanzamientos.
          </Text>
        </AdminSection>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <AdminSection
          id="views-by-day"
          title={<span className="inline-flex items-center gap-2"><BarChart3 className="h-5 w-5 text-fire-400" strokeWidth={1.75} aria-hidden />Vistas por día</span>}
          description="Últimos 14 días · zona UTC del servidor"
          className="lg:col-span-2"
        >
          <MiniBarChart data={data.pageViewsByDay} tone="fire" />
        </AdminSection>

        <AdminSection id="sessions-by-status" title="Sesiones por estado" description="Distribución en el histórico actual">
          <StatusDistribution rows={data.sessionsByStatus} />
        </AdminSection>
      </div>

      <AdminSection
        id="sessions-by-day"
        title={<span className="inline-flex items-center gap-2"><CalendarPlus className="h-5 w-5 text-gold-400" strokeWidth={1.75} aria-hidden />Sesiones nuevas</span>}
        description="Alta en el sistema por día (14 días)"
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/dashboard/sessions">
              Ver sesiones <ArrowRight aria-hidden />
            </Link>
          </Button>
        }
      >
        <MiniBarChart data={data.sessionsCreatedByDay} tone="gold" />
      </AdminSection>
    </div>
  );
}
