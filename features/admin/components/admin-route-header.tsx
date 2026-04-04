"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

const routes = [
  { match: "/admin/dashboard", title: "Panel" },
  { match: "/admin/dashboard/site", title: "Sitio web" },
  { match: "/admin/dashboard/sessions", title: "Sesiones" },
  { match: "/admin/dashboard/productions", title: "Producciones" },
  { match: "/admin/dashboard/beats", title: "Beats" },
  { match: "/admin/dashboard/releases", title: "Releases" },
  { match: "/admin/dashboard/calendar", title: "Calendario" },
];

export function AdminRouteHeader() {
  const pathname = usePathname();

  const current = useMemo(() => {
    const hit = [...routes].reverse().find((r) => pathname.startsWith(r.match));
    return hit?.title ?? "Panel";
  }, [pathname]);

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Dashboard</p>
          <h2 className="font-display text-2xl tracking-wide">{current}</h2>
        </div>
        <div className="text-sm text-[var(--text-secondary)]">
          {pathname.includes("/site") ? "Personaliza lo que ve el usuario" : "Gestión rápida en tiempo real"}
        </div>
      </div>
      <div className="mt-4 h-px w-full bg-primary/10" />
    </div>
  );
}

