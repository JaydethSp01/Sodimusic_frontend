import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { SitePreviewBanner } from "@/components/shared/site-preview-banner";
import { getSiteContent } from "@/lib/site-config-server";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteContent();
  return (
    <>
      <Navbar site={site} />
      <main id="contenido-principal" className="relative z-[2]">
        {children}
      </main>
      <Footer site={site} />
      <SitePreviewBanner />
    </>
  );
}
