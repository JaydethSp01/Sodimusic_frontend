"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollCompact } from "@/lib/hooks/use-scroll-compact";
import type { SiteContent } from "@/types/site-content";

const menuTransition = { type: "tween" as const, duration: 0.28, ease: [0.25, 0.1, 0.25, 1] as const };

type NavbarSite = Pick<SiteContent, "brand" | "nav" | "hero">;

export function Navbar({ site }: { site: NavbarSite }) {
  const links = site.nav.links;
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const pathname = usePathname();
  const compact = useScrollCompact(32);

  useEffect(() => {
    setPortalReady(true);
  }, []);

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
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-md transition-all duration-300",
        compact ? "shadow-lg shadow-black/20" : "",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 lg:px-8",
          compact ? "py-2" : "py-4",
        )}
      >
        <Link
          href="/"
          className="font-display text-3xl tracking-[0.2em] text-foreground md:text-4xl"
          aria-label={`${site.brand.logoText} — inicio`}
        >
          {site.brand.logoText}
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "nav-link-underline text-sm transition-colors hover:text-primary",
                pathname === l.href ? "text-primary" : "text-[var(--text-secondary)]",
              )}
            >
              {l.label}
            </Link>
          ))}
          <Button
            asChild
            size="sm"
            className="transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(255,107,0,0.4)]"
          >
            <Link href={site.nav.ctaHref}>{site.nav.ctaLabel}</Link>
          </Button>
        </nav>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative z-[101] min-h-12 min-w-12 touch-manipulation md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </Button>
      </div>

      {portalReady
        ? createPortal(
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div
                  id="mobile-navigation"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Navegación móvil"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={menuTransition}
                  className="fixed inset-0 z-[300] flex flex-col md:hidden"
                  style={{
                    paddingTop: "env(safe-area-inset-top, 0px)",
                    paddingBottom: "env(safe-area-inset-bottom, 0px)",
                  }}
                >
                  {/* Portal en body: evita que backdrop-filter del header acote `fixed` al alto de la barra */}
                  <div className="absolute inset-0 bg-[#030303]/[0.97]" aria-hidden />
                  <div
                    className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-[#0a0806]"
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,107,0,0.12),transparent)]" aria-hidden />

                  <div className="relative flex min-h-0 flex-1 flex-col">
                    <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-5">
                      <Link
                        href="/"
                        onClick={() => setOpen(false)}
                        className="font-display text-lg tracking-[0.2em] text-foreground sm:text-xl"
                      >
                        {site.brand.logoText}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/[0.06] text-foreground ring-1 ring-white/10 transition-colors hover:bg-white/[0.1] hover:ring-primary/30"
                        aria-label="Cerrar menú"
                      >
                        <X className="h-5 w-5" aria-hidden />
                      </button>
                    </div>

                    <div className="mx-4 h-px shrink-0 bg-gradient-to-r from-transparent via-white/15 to-transparent sm:mx-5" />

                    <nav
                      aria-label="Móvil"
                      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-5"
                    >
                      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
                        Explorar
                      </p>
                      <ul className="flex flex-col gap-0">
                        {links.map((l, i) => {
                          const active = pathname === l.href;
                          return (
                            <motion.li
                              key={l.href}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ ...menuTransition, delay: 0.03 + i * 0.04 }}
                            >
                              <Link
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  "group flex min-h-[3.5rem] items-center justify-between border-b border-white/[0.06] py-1 pr-1 transition-colors",
                                  active ? "text-primary" : "text-foreground",
                                )}
                              >
                                <span className="text-[1.05rem] font-medium tracking-wide">{l.label}</span>
                                <ChevronRight
                                  className={cn(
                                    "h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform duration-200 group-hover:translate-x-0.5",
                                    active && "text-primary/80",
                                  )}
                                  aria-hidden
                                />
                              </Link>
                            </motion.li>
                          );
                        })}
                      </ul>
                    </nav>

                    <div className="relative shrink-0 border-t border-white/[0.08] bg-black/50 px-4 py-5 backdrop-blur-md sm:px-5">
                      <div className="mx-auto flex w-full max-w-md flex-col gap-3">
                        <Button
                          asChild
                          size="lg"
                          className="h-12 w-full touch-manipulation rounded-xl text-[0.95rem] font-semibold shadow-[0_4px_24px_rgba(255,107,0,0.22)] transition-shadow hover:shadow-[0_6px_28px_rgba(255,107,0,0.3)]"
                        >
                          <Link href={site.nav.ctaHref} onClick={() => setOpen(false)}>
                            {site.nav.ctaLabel}
                          </Link>
                        </Button>
                        {showSecondaryCta ? (
                          <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-11 w-full touch-manipulation rounded-xl border-white/15 bg-transparent text-[0.9rem] font-medium text-foreground hover:border-primary/40 hover:bg-primary/5"
                          >
                            <Link href={site.hero.secondaryHref} onClick={() => setOpen(false)}>
                              {site.hero.secondaryCta}
                            </Link>
                          </Button>
                        ) : null}
                        {site.nav.mobileFooterLine?.trim() ? (
                          <p className="pt-1 text-center font-mono text-[10px] leading-relaxed tracking-wider text-[var(--text-muted)]">
                            {site.nav.mobileFooterLine}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </header>
  );
}
