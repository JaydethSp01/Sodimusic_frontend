import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/shop/components/product-card";
import { ShopCategoryChips } from "@/features/shop/components/shop-category-chips";
import { FaqSection } from "@/components/shared/faq-section";
import { SHOP_FAQ } from "@/content/faq";
import { fetchProducts } from "@/features/shop/api";
import { getSiteContent } from "@/lib/site-config-server";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const image = site.shop.heroImageUrl?.trim() ? resolveMediaUrl(site.shop.heroImageUrl) : undefined;
  return {
    title: site.shop.metaTitle,
    description: site.shop.metaDescription,
    alternates: { canonical: "/tienda" },
    openGraph: {
      title: site.shop.metaTitle,
      description: site.shop.metaDescription,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const site = await getSiteContent();
  const category = searchParams.category?.trim() || undefined;
  const data = await fetchProducts({ category, pageSize: 48 });
  // Si se filtra por una categoría sin resultados, mantenemos las chips con las categorías globales.
  const categories =
    data.categories.length || !category ? data.categories : (await fetchProducts({ pageSize: 1 })).categories;
  const whatsappUrl = `https://wa.me/${site.contact.whatsapp}`;
  const ivaIncluded = site.legal?.ivaIncluded ?? true;

  return (
    <div>
      <PageHero
        eyebrow={site.shop.heroEyebrow}
        title={site.shop.heroTitle}
        description={site.shop.heroDescription}
        backgroundImageUrl={site.shop.heroImageUrl}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8" aria-label="Catálogo de productos">
        {categories.length ? (
          <div className="mb-8">
            <ShopCategoryChips categories={categories} active={category} />
          </div>
        ) : null}

        {data.items.length === 0 ? (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-lg border border-dashed border-border bg-background-card/50 px-6 py-14 text-center">
            <p className="text-[var(--text-secondary)]">
              {category ? `No hay productos en «${category}» por ahora.` : site.shop.emptyStateMessage}
            </p>
            <Button
              asChild
              size="lg"
              className="h-12 bg-[#25D366] text-black hover:bg-[#2ee07a] hover:shadow-[0_8px_24px_rgba(37,211,102,0.3)]"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="!size-5" />
                Escribir por WhatsApp
              </a>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
                {data.items.length} {data.items.length === 1 ? "producto" : "productos"}
                {category ? ` · ${category}` : ""}
              </p>
              {ivaIncluded ? (
                <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Precios en COP · IVA incluido</p>
              ) : (
                <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Precios en COP</p>
              )}
            </div>
            <HomeStagger className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {data.items.map((p, i) => (
                <HomeStaggerItem key={p.id} className="h-full">
                  <ProductCard product={p} priority={i < 4} ivaIncluded={ivaIncluded} />
                </HomeStaggerItem>
              ))}
            </HomeStagger>
          </>
        )}

        {data.items.length > 0 ? (
          <p className="mt-10 text-center font-mono text-xs leading-relaxed text-[var(--text-muted)]">
            {site.shop.shippingNote?.trim() || "Envío a toda Colombia: se cotiza por WhatsApp según tu ciudad antes de confirmar el pedido."}
          </p>
        ) : null}
      </section>

      <FaqSection
        items={SHOP_FAQ}
        subtitle="Pedidos por WhatsApp, pagos, envíos a toda Colombia, retracto, garantía y cambios de talla."
      />
    </div>
  );
}
