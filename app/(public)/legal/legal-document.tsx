import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { formatVersionDate } from "@/content/legal/shared";
import styles from "./legal.module.css";

/** Cabecera + cuerpo tipográfico de un documento legal (§6.6: display-md, container-prose, tokens). */
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
      <header className="mb-10 border-b border-line-1 pb-8">
        <Eyebrow>Legal</Eyebrow>
        <Heading as="h1" size="display-md" className="mt-4">
          {title}
        </Heading>
        <Text as="p" size="body-lg" tone="2" prose className="mt-5">
          {description}
        </Text>
        <p className="mt-5 text-label text-text-3">
          Última actualización: <time dateTime={updated}>{formatVersionDate(updated)}</time>
        </p>
        {isAdmin ? (
          <p className="mt-4 inline-block rounded border border-warning/40 bg-warning/10 px-3 py-2 text-body-sm text-warning">
            Vista de administrador: los datos marcados en ámbar faltan en Admin → Sitio → Legal y no se muestran al público.
          </p>
        ) : null}
      </header>
      <div className={styles.prose}>{children}</div>
    </article>
  );
}
