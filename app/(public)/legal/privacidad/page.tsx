import type { Metadata } from "next";
import { PrivacyPolicy, PRIVACY_TITLE, PRIVACY_DESCRIPTION } from "@/content/legal";
import { LegalDocument } from "../legal-document";
import { getLegalContext } from "../legal-context";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: PRIVACY_TITLE,
    description: PRIVACY_DESCRIPTION,
    alternates: { canonical: "/legal/privacidad" },
    openGraph: { title: PRIVACY_TITLE, description: PRIVACY_DESCRIPTION },
  };
}

export default async function Page({ searchParams }: { searchParams?: { baja?: string } }) {
  const { legal, siteUrl, isAdmin } = await getLegalContext();
  const baja = searchParams?.baja;
  return (
    <LegalDocument title={PRIVACY_TITLE} description={PRIVACY_DESCRIPTION} updated={legal.policyVersion} isAdmin={isAdmin}>
      {baja === "ok" ? (
        <p role="status" className="not-prose mb-8 rounded border border-success/40 bg-success/10 px-4 py-3 text-body-sm text-success">
          Listo: tu correo fue dado de baja del boletín. No volverás a recibir comunicaciones comerciales nuestras.
        </p>
      ) : baja === "error" ? (
        <p role="alert" className="not-prose mb-8 rounded border border-danger/40 bg-danger/10 px-4 py-3 text-body-sm text-danger">
          El enlace de baja no es válido o ya caducó. Escríbenos a {legal.email || "nuestro correo de contacto"} y te damos de
          baja de inmediato.
        </p>
      ) : null}
      <PrivacyPolicy legal={legal} siteUrl={siteUrl} isAdmin={isAdmin} />
    </LegalDocument>
  );
}
