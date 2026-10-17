import type { Metadata } from "next";
import { StudioTerms, STUDIO_TERMS_TITLE, STUDIO_TERMS_DESCRIPTION } from "@/content/legal";
import { LegalDocument } from "../legal-document";
import { getLegalContext } from "../legal-context";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: STUDIO_TERMS_TITLE,
    description: STUDIO_TERMS_DESCRIPTION,
    alternates: { canonical: "/legal/terminos-estudio" },
    openGraph: { title: STUDIO_TERMS_TITLE, description: STUDIO_TERMS_DESCRIPTION },
  };
}

export default async function Page() {
  const { legal, siteUrl, isAdmin } = await getLegalContext();
  return (
    <LegalDocument title={STUDIO_TERMS_TITLE} description={STUDIO_TERMS_DESCRIPTION} updated={legal.termsVersion} isAdmin={isAdmin}>
      <StudioTerms legal={legal} siteUrl={siteUrl} isAdmin={isAdmin} />
    </LegalDocument>
  );
}
