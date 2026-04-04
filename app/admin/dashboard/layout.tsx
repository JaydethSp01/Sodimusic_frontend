import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminDashboardNav } from "@/features/admin/components/admin-dashboard-nav";
import { AdminRouteHeader } from "@/features/admin/components/admin-route-header";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/admin/login");
  }

  const links = [
    { href: "/admin/dashboard", label: "Resumen" },
    { href: "/admin/dashboard/site", label: "Sitio web" },
    { href: "/admin/dashboard/sessions", label: "Sesiones" },
    { href: "/admin/dashboard/productions", label: "Producciones" },
    { href: "/admin/dashboard/beats", label: "Beats" },
    { href: "/admin/dashboard/releases", label: "Releases" },
    { href: "/admin/dashboard/calendar", label: "Calendario" },
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
