"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollCompact } from "@/lib/hooks/use-scroll-compact";
import { CartButton } from "@/features/shop/components/cart-button";
import type { SiteContent } from "@/types/site-content";

/** Duración del fade del panel móvil (CSS, tailwindcss-animate); el desmontaje espera a que termine la salida. */
const MENU_MS = 280;
const menuEase = "fill-mode-both duration-[280ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]";

type PanelState = "closed" | "open" | "closing";

type NavbarSite = Pick<SiteContent, "brand" | "nav" | "hero" | "shop">;

function isShopHref(href: string): boolean {
  return href === "/tienda" || href.startsWith("/tienda/") || href.startsWith("/tienda?");
}

export function Navbar({ site }: { site: NavbarSite }) {
  const shopEnabled = site.shop?.enabled === true;
  const links =
    shopEnabled && !site.nav.links.some((l) => isShopHref(l.href))
      ? [...site.nav.links, { href: "/tienda", label: site.shop.navLabel || "Tienda" }]
      : site.nav.links;
  const [panel, setPanel] = useState<PanelState>("closed");
  const open = panel === "open";
  const [portalReady, setPortalReady] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const compact = useScrollCompact(32);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const openMenu = () => setPanel("open");
  const closeMenu = () => setPanel((p) => (p === "open" ? "closing" : p));

  // Mantiene el panel montado mientras corre la animación de salida (lo que antes hacía AnimatePresence).
  useEffect(() => {
    if (panel !== "closing") {
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setPanel("closed"), reduce ? 0 : MENU_MS);
    return () => window.clearTimeout(t);
  }, [panel]);

  const showSecondaryCta =
    site.hero.secondaryHref &&
    site.hero.secondaryHref !== site.nav.ctaHref &&
    site.hero.secondaryCta?.trim();

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
        return;
      }
      // Trampa de foco: Tab/Shift+Tab se quedan dentro del diálogo.
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        ).filter((el) => el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (!active || !dialogRef.current.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Foco inicial en el botón de cerrar al abrir; al cerrar, devolverlo al botón que abrió el menú.
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => {
        const first = dialogRef.current?.querySelector<HTMLElement>('button[aria-label="Cerrar menú"]');
        first?.focus();
      }, 0);
      return () => window.clearTimeout(t);
    }
    if (panel === "closing") {
      openerRef.current?.focus();
    }
    return undefined;
  }, [open, panel]);

  useEffect(() => {
    setPanel((p) => (p === "open" ? "closing" : p));
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-nav border-b border-line-1 bg-ink-0/75 backdrop-blur-md transition-[background-color,box-shadow] duration-300",
        compact ? "bg-ink-0/90 shadow-lg shadow-black/30" : "",
      )}
      style={{ "--nav-h": compact ? "56px" : "72px" } as React.CSSProperties}
    >
      <div
        className={cn(
          "container-page flex items-center justify-between transition-[height] duration-300",
          compact ? "h-14" : "h-[72px]",
        )}
      >
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-display text-xl font-black uppercase tracking-wordmark text-text-1 [font-stretch:125%] transition-colors duration-150 hover:text-fire-300"
          aria-label={`${site.brand.logoText} — inicio`}
        >
          {site.brand.logoText}
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-6 lg:flex xl:gap-8">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(`${l.href}/`));
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "nav-link-underline inline-flex min-h-11 items-center text-body font-medium transition-colors duration-150 hover:text-text-1",
                  active ? "is-active text-fire-400" : "text-text-2",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Button asChild pill size="sm" className="h-10 px-5 shadow-none hover:shadow-none">
            <Link href={site.nav.ctaHref}>{site.nav.ctaLabel}</Link>
          </Button>
          {shopEnabled ? <CartButton className="-mr-2" /> : null}
        </nav>

        <div className="flex items-center gap-1 lg:hidden">
          {shopEnabled ? <CartButton /> : null}
          <Button
            ref={openerRef}
            type="button"
            variant="ghost"
            size="icon"
            className="relative z-[101] min-h-12 min-w-12 touch-manipulation text-text-1"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => (open ? closeMenu() : openMenu())}
          >
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </Button>
        </div>
      </div>

      {portalReady && panel !== "closed"
        ? createPortal(
            <div
              ref={dialogRef}
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Navegación móvil"
              data-state={open ? "open" : "closed"}
              className={cn(
                "fixed inset-0 z-[300] flex flex-col lg:hidden",
                menuEase,
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
              )}
              style={{
                paddingTop: "env(safe-area-inset-top, 0px)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
              }}
            >
              {/* Portal en body: evita que backdrop-filter del header acote `fixed` al alto de la barra */}
              <div className="absolute inset-0 bg-ink-0/[0.97]" aria-hidden />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(217,166,42,0.14),transparent)]" aria-hidden />
              <div className="grain absolute inset-0" aria-hidden />

              <div className="relative flex min-h-0 flex-1 flex-col">
                <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-5">
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className="font-display text-lg font-black uppercase tracking-wordmark text-text-1 [font-stretch:125%]"
                  >
                    {site.brand.logoText}
                  </Link>
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/[0.06] text-text-1 ring-1 ring-line-2 transition-colors hover:bg-white/[0.1] hover:ring-fire-500/40"
                    aria-label="Cerrar menú"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>

                <div className="section-divider mx-4 shrink-0 sm:mx-5" />

                <nav
                  aria-label="Móvil"
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-5"
                >
                  <p className="mb-4 text-label text-text-3">Explorar</p>
                  <ul className="flex flex-col gap-0">
                    {links.map((l, i) => {
                      const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(`${l.href}/`));
                      return (
                        <li
                          key={l.href}
                          className={cn("animate-in fade-in-0 slide-in-from-bottom-2", menuEase)}
                          style={{ animationDelay: `${30 + i * 40}ms` }}
                        >
                          <Link
                            href={l.href}
                            onClick={closeMenu}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "group flex min-h-[3.5rem] items-center justify-between gap-4 border-b border-line-1 py-3 pr-1 transition-colors duration-150",
                              active ? "text-fire-400" : "text-text-1",
                            )}
                          >
                            <span className="font-display font-extrabold text-display-md">{l.label}</span>
                            <ChevronRight
                              className={cn(
                                "h-6 w-6 shrink-0 text-text-3 transition-transform duration-200 group-hover:translate-x-1",
                                active && "text-fire-400",
                              )}
                              strokeWidth={1.75}
                              aria-hidden
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="relative shrink-0 border-t border-line-1 bg-ink-0/60 px-4 py-5 backdrop-blur-md sm:px-5">
                  <div className="mx-auto flex w-full max-w-md flex-col gap-3">
                    <Button asChild size="lg" pill withArrow className="w-full touch-manipulation">
                      <Link href={site.nav.ctaHref} onClick={closeMenu}>
                        {site.nav.ctaLabel}
                      </Link>
                    </Button>
                    {showSecondaryCta ? (
                      <Button asChild variant="outline" size="md" pill className="w-full touch-manipulation">
                        <Link href={site.hero.secondaryHref} onClick={closeMenu}>
                          {site.hero.secondaryCta}
                        </Link>
                      </Button>
                    ) : null}
                    {site.nav.mobileFooterLine?.trim() ? (
                      <p className="pt-1 text-center text-label-sm leading-relaxed text-text-3">{site.nav.mobileFooterLine}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
