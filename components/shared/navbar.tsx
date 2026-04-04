"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollCompact } from "@/lib/hooks/use-scroll-compact";
import type { SiteContent } from "@/types/site-content";

const menuTransition = { type: "tween" as const, duration: 0.32, ease: [0.25, 0.1, 0.25, 1] as const };

export function Navbar({ site }: { site: Pick<SiteContent, "brand" | "nav"> }) {
  const links = site.nav.links;
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const compact = useScrollCompact(32);

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
            className="fixed inset-0 z-[100] flex flex-col bg-[#060606]/98 backdrop-blur-xl md:hidden"
            style={{
              paddingTop: "env(safe-area-inset-top, 0px)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="font-display text-xl tracking-[0.18em] text-foreground"
              >
                {site.brand.logoText}
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex min-h-12 min-w-12 touch-manipulation items-center justify-center rounded-lg border border-white/10 bg-white/5 text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10"
                aria-label="Cerrar menú"
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>

            <nav aria-label="Móvil" className="flex flex-1 flex-col justify-center gap-2 px-4 py-6">
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...menuTransition, delay: 0.04 + i * 0.05 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-[3.25rem] items-center rounded-xl border px-5 text-lg font-medium tracking-wide transition-colors active:scale-[0.99]",
                      pathname === l.href
                        ? "border-primary bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(255,107,0,0.25)]"
                        : "border-white/10 bg-white/[0.04] text-foreground hover:border-primary/35 hover:bg-primary/5",
                    )}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="shrink-0 border-t border-white/10 bg-black/40 px-4 py-6">
              <Button
                asChild
                size="lg"
                className="h-14 w-full touch-manipulation text-base font-semibold shadow-[0_0_24px_rgba(255,107,0,0.2)] transition-shadow hover:shadow-[0_0_28px_rgba(255,107,0,0.35)]"
              >
                <Link href={site.nav.ctaHref} onClick={() => setOpen(false)}>
                  {site.nav.ctaLabel}
                </Link>
              </Button>
              <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                {site.nav.mobileFooterLine}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
