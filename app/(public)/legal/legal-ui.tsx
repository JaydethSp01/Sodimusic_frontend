import type { ReactNode } from "react";
import type { SiteLegal } from "@/types/site-content";
import { formatPhone, hasValue } from "@/content/legal/shared";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "@/components/ds/admin-table";

/**
 * Primitivas de los documentos legales. Viven aquí (y no en content/legal) porque Tailwind solo
 * escanea app/, components/ y features/: las clases usadas en content/ no se generarían.
 */
/** Marcador que solo ve el admin cuando falta un dato del SiteConfig. */
export function Pending({ what }: { what?: string }) {
  return (
    <span
      className="mx-0.5 inline-block rounded-sm border border-warning/40 bg-warning/10 px-1.5 py-0.5 align-baseline font-mono text-label normal-case not-italic text-warning"
      title={what ? `Falta: ${what}` : undefined}
    >
      [pendiente: completar en Admin → Sitio → Legal]
    </span>
  );
}

/**
 * Valor interpolado en prosa: muestra el dato; si está vacío, el admin ve el marcador
 * y el público ve `fallback` (o nada).
 */
export function V({
  value,
  isAdmin,
  fallback = null,
  what,
}: {
  value: string | number | null | undefined;
  isAdmin?: boolean;
  fallback?: ReactNode;
  what?: string;
}) {
  if (hasValue(value)) return <>{value}</>;
  if (isAdmin) return <Pending what={what} />;
  return <>{fallback}</>;
}

/**
 * Línea "Etiqueta: valor" en una lista de identificación. Se omite por completo para el público
 * si el valor está vacío; el admin ve el marcador.
 */
export function Line({
  label,
  value,
  isAdmin,
  href,
  what,
}: {
  label: string;
  value: string | number | null | undefined;
  isAdmin?: boolean;
  href?: string;
  what?: string;
}) {
  const present = hasValue(value);
  if (!present && !isAdmin) return null;
  return (
    <li className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <span className="shrink-0 text-label text-text-3 sm:w-44 sm:pt-1">{label}</span>
      <span className="text-body text-text-1">
        {present ? (
          href ? (
            <a href={href} className="text-fire-400 underline underline-offset-4 transition-colors duration-150 hover:text-fire-300">
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          <Pending what={what ?? label} />
        )}
      </span>
    </li>
  );
}

/** Lista de identificación (responsable, comerciante, etc.) */
export function IdList({ children }: { children: ReactNode }) {
  return <ul className="not-prose my-5 space-y-3 rounded-lg border border-line-1 bg-ink-2 p-5">{children}</ul>;
}

export type TocItem = { id: string; label: string };

/** Índice del documento con enlaces a cada sección. */
export function Toc({ items }: { items: TocItem[] }) {
  return (
    <nav aria-label="Contenido del documento" className="not-prose mb-12 rounded-lg border border-line-1 bg-ink-2 p-5 sm:p-6">
      <p className="text-label text-fire-500">En este documento</p>
      <ol className="mt-4 grid gap-x-8 gap-y-1 text-body-sm sm:grid-cols-2">
        {items.map((it, i) => (
          <li key={it.id} className="flex gap-3">
            <span className="w-5 shrink-0 pt-2 font-mono text-label text-text-3">{i + 1}.</span>
            <a
              href={`#${it.id}`}
              className="link-sweep inline-flex min-h-10 items-center text-text-2 transition-colors duration-150 hover:text-fire-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Sección numerada (h2) con ancla. */
export function Section({ n, id, title, children }: { n: number; id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-[calc(var(--nav-h,72px)+1.5rem)]">
      <h2 id={`${id}-title`}>
        <span className="text-accent mr-3 text-fire-500" aria-hidden>
          {String(n).padStart(2, "0")}
        </span>
        <span className="sr-only">{n}. </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Subsección (h3) numerada "n.m". */
export function Sub({ n, title, children }: { n: string; title: string; children?: ReactNode }) {
  return (
    <>
      <h3>
        <span className="mr-2 font-mono text-label text-text-3">{n}</span>
        {title}
      </h3>
      {children}
    </>
  );
}

/** Cierre del documento: versión. */
export function DocFooter({ version, note }: { version: string; note?: ReactNode }) {
  return (
    <footer className="not-prose mt-14 border-t border-line-1 pt-6 text-body-sm text-text-3">
      {note ? <p className="mb-3">{note}</p> : null}
      <p className="text-label">Versión {version}</p>
    </footer>
  );
}

export type LicenseRow = { name: string; cells: ReactNode[] };

/** Tabla comparativa de licencias (`AdminTable` ligero, desplazable en móvil). */
export function LicenseTable({ headers, rows, lastRowSpan }: { headers: string[]; rows: LicenseRow[]; lastRowSpan?: { name: string; delivery: string; text: string } }) {
  return (
    <div className="not-prose my-6">
      <AdminTable className="min-w-[640px]">
        <AdminTableHead>
          <AdminTableRow>
            {headers.map((h) => (
              <AdminTableHeader key={h}>{h}</AdminTableHeader>
            ))}
          </AdminTableRow>
        </AdminTableHead>
        <AdminTableBody>
          {rows.map((r) => (
            <AdminTableRow key={r.name}>
              <AdminTableCell className="py-3 font-semibold text-text-1">{r.name}</AdminTableCell>
              {r.cells.map((c, i) => (
                <AdminTableCell key={i} className="whitespace-normal py-3 text-text-2">
                  {c}
                </AdminTableCell>
              ))}
            </AdminTableRow>
          ))}
          {lastRowSpan ? (
            <AdminTableRow>
              <AdminTableCell className="py-3 font-semibold text-text-1">{lastRowSpan.name}</AdminTableCell>
              <AdminTableCell className="whitespace-normal py-3 text-text-2">{lastRowSpan.delivery}</AdminTableCell>
              <AdminTableCell className="whitespace-normal py-3 text-text-2" colSpan={Math.max(1, headers.length - 2)}>
                {lastRowSpan.text}
              </AdminTableCell>
            </AdminTableRow>
          ) : null}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}

/** Enlace externo con rel seguro. */
export function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/** Correo PQR como enlace mailto, o marcador para el admin. */
export function MailLink({ legal, isAdmin }: { legal: SiteLegal; isAdmin?: boolean }) {
  if (hasValue(legal.email)) return <a href={`mailto:${legal.email}`}>{legal.email}</a>;
  return isAdmin ? <Pending what="correo PQR" /> : <>nuestro correo de contacto</>;
}

/** WhatsApp como enlace wa.me, o marcador para el admin. */
export function WaLink({ legal, isAdmin }: { legal: SiteLegal; isAdmin?: boolean }) {
  if (hasValue(legal.phone)) return <a href={`https://wa.me/${legal.phone}`}>{formatPhone(legal.phone)}</a>;
  return isAdmin ? <Pending what="WhatsApp" /> : <>nuestro WhatsApp</>;
}
