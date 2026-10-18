import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { fetchAdmin } from "@/lib/api-admin";
import { AdminDashboardNav, type AdminNavLink } from "@/features/admin/components/admin-dashboard-nav";
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

  const links: AdminNavLink[] = [
    { href: "/admin/dashboard", label: "Resumen", icon: "home" },
    { href: "/admin/dashboard/site", label: "Sitio web", icon: "globe" },
    { href: "/admin/dashboard/sessions", label: "Sesiones", icon: "sessions" },
    { href: "/admin/dashboard/productions", label: "Producciones", icon: "productions" },
    { href: "/admin/dashboard/beats", label: "Beats", icon: "beats" },
    { href: "/admin/dashboard/releases", label: "Releases", icon: "releases" },
    { href: "/admin/dashboard/tienda", label: "Tienda", icon: "shop" },
    { href: "/admin/dashboard/mensajes", label: "Mensajes", icon: "inbox", badge: messagesNew },
    { href: "/admin/dashboard/suscriptores", label: "Suscriptores", icon: "mail" },
    { href: "/admin/dashboard/canales", label: "Canales", icon: "channels" },
    { href: "/admin/dashboard/novedades", label: "Novedades", icon: "news" },
    { href: "/admin/dashboard/calendar", label: "Calendario", icon: "calendar" },
    { href: "/admin/dashboard/qr", label: "Código QR", icon: "qr" },
  ];

  return (
    <AdminProviders>
      <div className="relative z-[2] flex min-h-screen flex-col md:flex-row">
        <AdminDashboardNav links={links} />
        <main className="min-w-0 flex-1 p-6 md:p-8">
          <AdminRouteHeader />
          <div>{children}</div>
        </main>
      </div>
    </AdminProviders>
  );
}
