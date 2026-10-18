"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Scale } from "lucide-react";
import { Label } from "@/components/ui/label";
import { inputClass } from "@/components/ui/input";
import { LEGAL_ROUTES } from "@/content/legal/routes";
import { cn } from "@/lib/utils";

/** Índice lateral de los documentos legales: lista sticky en escritorio, selector nativo en móvil. */
export function LegalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const current = LEGAL_ROUTES.find((r) => pathname === r.href || pathname.startsWith(`${r.href}/`))?.href ?? LEGAL_ROUTES[0].href;

  return (
    <>
      <div className="flex flex-col gap-2 lg:hidden">
        <Label htmlFor="legal-doc-select">Documento</Label>
        <select
          id="legal-doc-select"
          value={current}
          onChange={(e) => router.push(e.target.value)}
          className={cn(inputClass, "cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%238f8a82%22 stroke-width=%221.75%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[position:right_0.875rem_center] bg-no-repeat pr-10")}
        >
          {LEGAL_ROUTES.map((r) => (
            <option key={r.href} value={r.href}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <nav aria-label="Documentos legales" className="hidden lg:block">
        <p className="mb-4 flex items-center gap-2 text-label text-fire-500">
          <Scale className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Legal
        </p>
        <ul className="border-l border-line-1">
          {LEGAL_ROUTES.map((r) => {
            const active = r.href === current;
            return (
              <li key={r.href}>
                <Link
                  href={r.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-ml-px flex min-h-11 items-center border-l-2 py-2 pl-4 pr-2 text-body-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500",
                    active ? "border-fire-500 font-semibold text-text-1" : "border-transparent text-text-2 hover:border-fire-500/40 hover:text-text-1",
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
