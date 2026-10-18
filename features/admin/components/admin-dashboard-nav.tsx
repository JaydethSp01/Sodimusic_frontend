"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Disc3,
  ExternalLink,
  Globe,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  Menu,
  MicVocal,
  Music2,
  Newspaper,
  QrCode,
  ShoppingBag,
  Users,
  Youtube,
  X,
  type LucideIcon,
} from "lucide-react";
import { AdminLogoutButton } from "@/features/admin/components/admin-logout-button";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

export type AdminNavIcon =
  | "home"
  | "globe"
  | "sessions"
  | "artists"
  | "productions"
  | "beats"
  | "releases"
  | "shop"
  | "channels"
  | "news"
  | "calendar"
  | "qr"
  | "inbox"
  | "mail";

export type AdminNavLink = { href: string; label: string; icon?: AdminNavIcon; badge?: number };
/** Grupo de enlaces (Contenido / Ventas / Comunidad / Sitio). Sin `label` se pinta sin cabecera. */
export type AdminNavGroup = { label?: string; links: AdminNavLink[] };

const NAV_ICONS: Record<AdminNavIcon, LucideIcon> = {
  home: LayoutDashboard,
  globe: Globe,
  sessions: Users,
  artists: MicVocal,
  productions: LayoutGrid,
  beats: Music2,
  releases: Disc3,
  shop: ShoppingBag,
  channels: Youtube,
  news: Newspaper,
  calendar: CalendarDays,
  qr: QrCode,
  inbox: Inbox,
  mail: Mail,
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/admin/dashboard") {
    return pathname === "/admin/dashboard";
  }
  return pathname.startsWith(href);
}

function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/admin/dashboard"
      className={cn(
        "inline-flex min-h-11 flex-col justify-center rounded transition-colors duration-150 hover:text-fire-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-1",
        className,
      )}
    >
      <span className="font-display text-title font-black uppercase leading-none tracking-wordmark text-text-1 [font-stretch:125%]">
        Sodimusic
      </span>
      <span className="mt-1 text-label-sm text-fire-500">Panel admin</span>
    </Link>
  );
}

function AdminNavLinks({
  groups,
  pathname,
  onItemClick,
  className,
}: {
  groups: AdminNavGroup[];
  pathname: string;
  onItemClick?: () => void;
  className?: string;
}) {
  return (
    <nav aria-label="Panel admin" className={cn("flex flex-col gap-4", className)}>
      {groups.map((g, gi) => (
        <div key={g.label ?? `g${gi}`}>
          {g.label ? <p className="mb-1 px-3 text-label-sm text-text-3">{g.label}</p> : null}
          <ul className="flex flex-col gap-0.5">
            {g.links.map((l) => {
              const Icon = l.icon ? NAV_ICONS[l.icon] : null;
              const active = isActiveRoute(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    prefetch={true}
                    onClick={onItemClick}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-11 cursor-pointer items-center gap-3 rounded px-3 text-body-sm font-medium md:h-10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-1",
                      active
                        ? "bg-fire-500/[0.10] text-text-1 before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-0.5 before:rounded-full before:bg-fire-500 before:content-['']"
                        : "text-text-2 hover:bg-ink-3 hover:text-text-1",
                    )}
                  >
                    {Icon ? (
                      <Icon className={cn("h-5 w-5 shrink-0", active ? "text-fire-400" : "text-text-3")} strokeWidth={1.75} aria-hidden />
                    ) : null}
                    <span className="truncate">{l.label}</span>
                    {typeof l.badge === "number" && l.badge > 0 ? (
                      <Badge tone="fire" variant="solid" className="ml-auto" aria-label={`${l.badge} nuevos`}>
                        {l.badge > 99 ? "99+" : l.badge}
                      </Badge>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function NavFooter() {
  return (
    <div className="flex items-center gap-2">
      <IconButton asChild variant="outline" aria-label="Ver el sitio público">
        <Link href="/" title="Ver el sitio público">
          <ExternalLink />
        </Link>
      </IconButton>
      <AdminLogoutButton />
    </div>
  );
}

export function AdminDashboardNav({ groups }: { groups: AdminNavGroup[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function onClose() {
    closeMobile();
    openButtonRef.current?.focus();
  }

  return (
    <>
      <header className="sticky top-0 z-nav flex h-14 shrink-0 items-center justify-between border-b border-line-1 bg-ink-1/90 px-4 backdrop-blur-md md:hidden">
        <Wordmark />
        <IconButton
          ref={openButtonRef}
          variant="ghost"
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-drawer"
          onClick={() => setMobileOpen(true)}
        >
          <Menu />
        </IconButton>
      </header>

      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-line-1 bg-ink-1 md:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-line-1 px-5">
          <Wordmark />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <AdminNavLinks groups={groups} pathname={pathname} />
        </div>
        <div className="shrink-0 border-t border-line-1 p-3">
          <NavFooter />
        </div>
      </aside>

      {mobileOpen ? (
        <>
          <button type="button" className="fixed inset-0 z-overlay bg-ink-0/70 backdrop-blur-sm md:hidden" aria-label="Cerrar menú" onClick={onClose} />
          <div
            id="admin-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación del panel"
            className="fixed inset-y-0 right-0 z-modal flex w-[min(288px,100vw-1.5rem)] flex-col border-l border-line-1 bg-ink-1 shadow-pop md:hidden"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line-1 px-4">
              <Wordmark />
              <IconButton ref={closeButtonRef} variant="ghost" aria-label="Cerrar menú" onClick={onClose}>
                <X />
              </IconButton>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
              <AdminNavLinks groups={groups} pathname={pathname} onItemClick={closeMobile} />
            </div>
            <div className="shrink-0 border-t border-line-1 p-3">
              <NavFooter />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
