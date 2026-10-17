import type { ReactNode } from "react";
import type { SiteLegal } from "@/types/site-content";
import { formatPhone, hasValue } from "@/content/legal/shared";

/**
 * Primitivas de los documentos legales. Viven aquí (y no en content/legal) porque Tailwind solo
 * escanea app/, components/ y features/: las clases usadas en content/ no se generarían.
 */
/** Marcador que solo ve el admin cuando falta un dato del SiteConfig. */
export function Pending({ what }: { what?: string }) {
  return (
    <span
      className="mx-0.5 inline-block rounded border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 align-baseline font-mono text-[11px] font-medium not-italic leading-tight text-amber-300"
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
    <li className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className="shrink-0 font-medium text-foreground sm:w-44">{label}</span>
      <span className="text-[var(--text-secondary)]">
        {present ? (
          href ? (
            <a href={href} className="text-primary underline underline-offset-4 hover:text-[var(--primary-hover)]">
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
  return <ul className="not-prose my-4 space-y-2 rounded-lg border border-border bg-background-card/60 p-4 text-[15px] sm:p-5">{children}</ul>;
}

export type TocItem = { id: string; label: string };

/** Índice del documento con enlaces a cada sección. */
export function Toc({ items }: { items: TocItem[] }) {
  return (
    <nav aria-label="Contenido del documento" className="not-prose mb-10 rounded-lg border border-border bg-background-secondary/60 p-5">
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">En este documento</p>
      <ol className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
        {items.map((it, i) => (
          <li key={it.id} className="flex gap-2">
            <span className="w-5 shrink-0 font-mono text-xs text-[var(--text-muted)]">{i + 1}.</span>
            <a href={`#${it.id}`} className="text-[var(--text-secondary)] underline-offset-4 hover:text-primary hover:underline">
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
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
      <h2 id={`${id}-title`}>
        <span className="mr-2 font-mono text-base text-primary">{n}.</span>
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
        <span className="mr-2 font-mono text-sm text-[var(--text-muted)]">{n}</span>
        {title}
      </h3>
      {children}
    </>
  );
}

/** Cierre del documento: versión. */
export function DocFooter({ version, note }: { version: string; note?: ReactNode }) {
  return (
    <footer className="not-prose mt-12 border-t border-border pt-6 text-sm text-[var(--text-muted)]">
      {note ? <p className="mb-2">{note}</p> : null}
      <p className="font-mono text-xs uppercase tracking-widest">Versión {version}</p>
    </footer>
  );
}

export type LicenseRow = { name: string; cells: ReactNode[] };

/** Tabla comparativa de licencias (desplazable en móvil). */
export function LicenseTable({ headers, rows, lastRowSpan }: { headers: string[]; rows: LicenseRow[]; lastRowSpan?: { name: string; delivery: string; text: string } }) {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-background-secondary font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-[var(--text-secondary)]">
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
              {r.cells.map((c, i) => (
                <td key={i} className="px-4 py-3">
                  {c}
                </td>
              ))}
            </tr>
          ))}
          {lastRowSpan ? (
            <tr>
              <td className="px-4 py-3 font-medium text-foreground">{lastRowSpan.name}</td>
              <td className="px-4 py-3">{lastRowSpan.delivery}</td>
              <td className="px-4 py-3" colSpan={Math.max(1, headers.length - 2)}>
                {lastRowSpan.text}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
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
