import type { ReactNode } from "react";
import { formatVersionDate } from "@/content/legal/shared";
import styles from "./legal.module.css";

/** Cabecera + cuerpo tipográfico de un documento legal. */
export function LegalDocument({
  title,
  description,
  updated,
  isAdmin,
  children,
}: {
  title: string;
  description: string;
  /** Versión/fecha (policyVersion o termsVersion) */
  updated: string;
  isAdmin?: boolean;
  children: ReactNode;
}) {
  return (
    <article>
      <header className="mb-8 border-b border-border pb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-foreground md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-prose text-base text-[var(--text-secondary)]">{description}</p>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
          Última actualización: <time dateTime={updated}>{formatVersionDate(updated)}</time>
        </p>
        {isAdmin ? (
          <p className="mt-3 inline-block rounded border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-xs text-amber-300">
            Vista de administrador: los datos marcados en ámbar faltan en Admin → Sitio → Legal y no se muestran al público.
          </p>
        ) : null}
      </header>
      <div className={styles.prose}>{children}</div>
    </article>
  );
}
