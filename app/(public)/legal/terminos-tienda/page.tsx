import type { Metadata } from "next";
import { ShopTerms, SHOP_TERMS_TITLE, SHOP_TERMS_DESCRIPTION } from "@/content/legal";
import { LegalDocument } from "../legal-document";
import { getLegalContext } from "../legal-context";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: SHOP_TERMS_TITLE,
    description: SHOP_TERMS_DESCRIPTION,
    alternates: { canonical: "/legal/terminos-tienda" },
    openGraph: { title: SHOP_TERMS_TITLE, description: SHOP_TERMS_DESCRIPTION },
  };
}

export default async function Page() {
  const { legal, siteUrl, isAdmin } = await getLegalContext();
  return (
    <LegalDocument title={SHOP_TERMS_TITLE} description={SHOP_TERMS_DESCRIPTION} updated={legal.termsVersion} isAdmin={isAdmin}>
      <ShopTerms legal={legal} siteUrl={siteUrl} isAdmin={isAdmin} />
    </LegalDocument>
  );
}
