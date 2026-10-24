import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { SitePreviewBanner } from "@/components/shared/site-preview-banner";
import { PageViewTracker } from "@/components/public/page-view-tracker";
import { getSiteContent } from "@/lib/site-config-server";
import { CartDrawerLazy } from "@/features/shop/components/cart-drawer-lazy";
import { FloatingWhatsapp } from "@/components/shared/floating-whatsapp";
import { RevealNoScriptFallback } from "@/components/shared/reveal-item";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";
import { BeatPlayerBarLazy } from "@/features/beats/components/beat-player-bar-lazy";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteContent();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return (
    <>
      <JsonLd data={[organizationSchema(site), websiteSchema()]} />
      <RevealNoScriptFallback />
      <PageViewTracker />
      <Navbar site={site} />
      <main id="contenido-principal" className="relative z-[2]">
        {children}
      </main>
      <Footer site={site} />
      <BeatPlayerBarLazy />
      <FloatingWhatsapp
        config={{
          enabled: site.legal?.floatingWhatsapp ?? true,
          phone: site.legal?.phone || site.contact.whatsapp,
          businessName: site.legal?.businessName ?? site.brand.logoText,
        }}
      />
      {site.shop.enabled ? (
        <CartDrawerLazy
          whatsappPhone={site.contact.whatsapp}
          ivaIncluded={site.legal?.ivaIncluded ?? true}
          whatsappIntro={site.shop.whatsappOrderIntro}
          orderCtaLabel={site.shop.orderCtaLabel}
          shippingNote={site.shop.shippingNote}
          siteUrl={siteUrl}
          shopLabel={site.shop.navLabel}
        />
      ) : null}
      <SitePreviewBanner />
    </>
  );
}
