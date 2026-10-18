import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { fetchAdmin } from "@/lib/api-admin";
import { AdminDashboardNav, type AdminNavGroup } from "@/features/admin/components/admin-dashboard-nav";
import { AdminRouteHeader } from "@/features/admin/components/admin-route-header";
import { AdminProviders } from "@/components/admin-providers";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/admin/login");
  }

  // Badge de mensajes nuevos (barato: pageSize=1, solo usamos `total`). Si falla, sin badge.
  const messagesNew = await fetchAdmin("/api/admin/messages?status=NEW&page=1&pageSize=1")
    .then(async (r) => (r.ok ? ((await r.json()) as { total?: number }).total ?? 0 : 0))
    .catch(() => 0);

  const groups: AdminNavGroup[] = [
    { links: [{ href: "/admin/dashboard", label: "Resumen", icon: "home" }] },
    {
      label: "Contenido",
      links: [
        { href: "/admin/dashboard/productions", label: "Producciones", icon: "productions" },
        { href: "/admin/dashboard/releases", label: "Releases", icon: "releases" },
        { href: "/admin/dashboard/beats", label: "Beats", icon: "beats" },
        { href: "/admin/dashboard/canales", label: "Canales", icon: "channels" },
        { href: "/admin/dashboard/novedades", label: "Novedades", icon: "news" },
      ],
    },
    {
      label: "Ventas",
      links: [
        { href: "/admin/dashboard/sessions", label: "Sesiones", icon: "sessions" },
        { href: "/admin/dashboard/calendar", label: "Calendario", icon: "calendar" },
        { href: "/admin/dashboard/tienda", label: "Tienda", icon: "shop" },
      ],
    },
    {
      label: "Comunidad",
      links: [
        { href: "/admin/dashboard/mensajes", label: "Mensajes", icon: "inbox", badge: messagesNew },
        { href: "/admin/dashboard/suscriptores", label: "Suscriptores", icon: "mail" },
      ],
    },
    {
      label: "Sitio",
      links: [
        { href: "/admin/dashboard/site", label: "Sitio web", icon: "globe" },
        { href: "/admin/dashboard/qr", label: "Código QR", icon: "qr" },
      ],
    },
  ];

  return (
    <AdminProviders>
      <div className="relative z-[2] flex min-h-screen flex-col bg-ink-0 md:flex-row">
        <AdminDashboardNav groups={groups} />
        <main id="contenido-principal" className="min-w-0 flex-1">
          <div className="container-page py-6 md:py-8">
            <AdminRouteHeader />
            {children}
          </div>
        </main>
      </div>
    </AdminProviders>
  );
}
