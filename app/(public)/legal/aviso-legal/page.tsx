import type { Metadata } from "next";
import { LegalNotice, LEGAL_NOTICE_TITLE, LEGAL_NOTICE_DESCRIPTION } from "@/content/legal";
import { LegalDocument } from "../legal-document";
import { getLegalContext } from "../legal-context";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: LEGAL_NOTICE_TITLE,
    description: LEGAL_NOTICE_DESCRIPTION,
    alternates: { canonical: "/legal/aviso-legal" },
    openGraph: { title: LEGAL_NOTICE_TITLE, description: LEGAL_NOTICE_DESCRIPTION },
  };
}

export default async function Page() {
  const { legal, siteUrl, isAdmin } = await getLegalContext();
  return (
    <LegalDocument title={LEGAL_NOTICE_TITLE} description={LEGAL_NOTICE_DESCRIPTION} updated={legal.termsVersion} isAdmin={isAdmin}>
      <LegalNotice legal={legal} siteUrl={siteUrl} isAdmin={isAdmin} />
    </LegalDocument>
  );
}
