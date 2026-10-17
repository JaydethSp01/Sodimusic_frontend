"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Scale } from "lucide-react";
import { LEGAL_ROUTES } from "@/content/legal/routes";
import { cn } from "@/lib/utils";

/** Índice lateral de los documentos legales: lista sticky en desktop, selector en móvil. */
export function LegalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const current = LEGAL_ROUTES.find((r) => pathname === r.href || pathname.startsWith(`${r.href}/`))?.href ?? LEGAL_ROUTES[0].href;

  return (
    <>
      <div className="lg:hidden">
        <label htmlFor="legal-doc-select" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
          Documento
        </label>
        <select
          id="legal-doc-select"
          value={current}
          onChange={(e) => router.push(e.target.value)}
          className="h-11 w-full rounded-md border border-border bg-background-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {LEGAL_ROUTES.map((r) => (
            <option key={r.href} value={r.href}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <nav aria-label="Documentos legales" className="hidden lg:block">
        <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
          <Scale className="h-3.5 w-3.5" aria-hidden />
          Legal
        </p>
        <ul className="space-y-0.5 border-l border-border">
          {LEGAL_ROUTES.map((r) => {
            const active = r.href === current;
            return (
              <li key={r.href}>
                <Link
                  href={r.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-ml-px block border-l-2 py-2 pl-4 pr-2 text-sm transition-colors",
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-[var(--text-secondary)] hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {r.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
