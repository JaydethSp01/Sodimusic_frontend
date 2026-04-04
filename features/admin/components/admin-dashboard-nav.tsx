"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminLogoutButton } from "@/features/admin/components/admin-logout-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminNavLink = { href: string; label: string };

function isActiveRoute(pathname: string, href: string) {
  if (href === "/admin/dashboard") {
    return pathname === "/admin/dashboard";
  }
  return pathname.startsWith(href);
}

function linkClass(pathname: string, href: string) {
  return cn(
    "rounded-md px-3 py-2 text-sm transition-colors",
    isActiveRoute(pathname, href)
      ? "bg-background-elevated text-foreground"
      : "text-[var(--text-secondary)] hover:bg-background-elevated hover:text-foreground",
  );
}

function AdminNavLinks({
  links,
  pathname,
  onItemClick,
  className,
}: {
  links: AdminNavLink[];
  pathname: string;
  onItemClick?: () => void;
  className?: string;
}) {
  return (
    <nav aria-label="Panel admin" className={cn("flex flex-col gap-1", className)}>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          prefetch={true}
          onClick={onItemClick}
          className={linkClass(pathname, l.href)}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminDashboardNav({ links }: { links: AdminNavLink[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background-secondary/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background-secondary/50 md:hidden">
        <span className="font-display text-lg tracking-wide">Panel Admin</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-drawer"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      <aside className="hidden h-screen w-64 shrink-0 flex-col border-border bg-background-secondary/60 backdrop-blur supports-[backdrop-filter]:bg-background-secondary/40 md:flex md:border-b-0 md:border-r">
        <div className="flex h-14 items-center border-b border-border px-5 font-display text-lg tracking-wide">
          Panel Admin
        </div>
        <AdminNavLinks links={links} pathname={pathname} className="p-4" />
        <div className="mt-auto p-4">
          <AdminLogoutButton />
        </div>
      </aside>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            aria-label="Cerrar menú"
            onClick={closeMobile}
          />
          <div
            id="admin-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación del panel"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(288px,100vw-1.5rem)] flex-col border-l border-border bg-background-secondary shadow-2xl md:hidden"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
              <span className="font-display text-lg tracking-wide">Panel Admin</span>
              <Button type="button" variant="ghost" size="icon" aria-label="Cerrar menú" onClick={closeMobile}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <AdminNavLinks links={links} pathname={pathname} onItemClick={closeMobile} />
            </div>
            <div className="shrink-0 border-t border-border p-4">
              <AdminLogoutButton />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
