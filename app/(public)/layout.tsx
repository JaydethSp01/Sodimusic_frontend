import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { SitePreviewBanner } from "@/components/shared/site-preview-banner";
import { PageViewTracker } from "@/components/public/page-view-tracker";
import { getSiteContent } from "@/lib/site-config-server";
import { CartDrawer } from "@/features/shop/components/cart-drawer";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteContent();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return (
    <>
      <PageViewTracker />
      <Navbar site={site} />
      <main id="contenido-principal" className="relative z-[2]">
        {children}
      </main>
      <Footer site={site} />
      {site.shop.enabled ? (
        <CartDrawer
          whatsappPhone={site.contact.whatsapp}
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
