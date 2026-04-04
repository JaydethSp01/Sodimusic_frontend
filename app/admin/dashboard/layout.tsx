import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminLogoutButton } from "@/features/admin/components/admin-logout-button";
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
      <aside className="sticky top-0 z-[1] border-b border-border bg-background-secondary/60 backdrop-blur supports-[backdrop-filter]:bg-background-secondary/40 md:h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-14 items-center border-b border-border px-5 font-display text-lg tracking-wide">
          Panel Admin
        </div>
        <nav aria-label="Panel admin" className="flex flex-col gap-1 p-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch={true}
              className="rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-background-elevated hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4">
          <AdminLogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8">
        <AdminRouteHeader />
        <div>{children}</div>
      </main>
    </div>
  );
}
