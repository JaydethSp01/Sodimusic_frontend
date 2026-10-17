import type { Metadata } from "next";
import { BeatsLicense, BEATS_LICENSE_TITLE, BEATS_LICENSE_DESCRIPTION } from "@/content/legal";
import { LegalDocument } from "../legal-document";
import { getLegalContext } from "../legal-context";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: BEATS_LICENSE_TITLE,
    description: BEATS_LICENSE_DESCRIPTION,
    alternates: { canonical: "/legal/licencia-beats" },
    openGraph: { title: BEATS_LICENSE_TITLE, description: BEATS_LICENSE_DESCRIPTION },
  };
}

export default async function Page() {
  const { legal, siteUrl, isAdmin } = await getLegalContext();
  return (
    <LegalDocument title={BEATS_LICENSE_TITLE} description={BEATS_LICENSE_DESCRIPTION} updated={legal.termsVersion} isAdmin={isAdmin}>
      <BeatsLicense legal={legal} siteUrl={siteUrl} isAdmin={isAdmin} />
    </LegalDocument>
  );
}
