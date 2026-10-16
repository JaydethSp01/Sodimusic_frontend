import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminDashboardNav, type AdminNavLink } from "@/features/admin/components/admin-dashboard-nav";
import { AdminRouteHeader } from "@/features/admin/components/admin-route-header";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/admin/login");
  }

  const links: AdminNavLink[] = [
    { href: "/admin/dashboard", label: "Resumen", icon: "home" },
    { href: "/admin/dashboard/site", label: "Sitio web", icon: "globe" },
    { href: "/admin/dashboard/sessions", label: "Sesiones", icon: "sessions" },
    { href: "/admin/dashboard/productions", label: "Producciones", icon: "productions" },
    { href: "/admin/dashboard/beats", label: "Beats", icon: "beats" },
    { href: "/admin/dashboard/releases", label: "Releases", icon: "releases" },
    { href: "/admin/dashboard/tienda", label: "Tienda", icon: "shop" },
    { href: "/admin/dashboard/calendar", label: "Calendario", icon: "calendar" },
    { href: "/admin/dashboard/qr", label: "Código QR", icon: "qr" },
  ];

  return (
    <div className="relative z-[2] flex min-h-screen flex-col md:flex-row">
      <AdminDashboardNav links={links} />
      <main className="min-w-0 flex-1 p-6 md:p-8">
        <AdminRouteHeader />
        <div>{children}</div>
      </main>
    </div>
  );
}
