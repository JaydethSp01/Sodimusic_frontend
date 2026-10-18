import type { Metadata } from "next";
import { PackageOpen, Truck } from "lucide-react";
import { HeroPage } from "@/components/ds/hero-page";
import { FilterBar } from "@/components/ds/filter-bar";
import { EmptyState } from "@/components/ds/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
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
  const shippingNote =
    site.shop.shippingNote?.trim() || "Envío a toda Colombia: se cotiza por WhatsApp según tu ciudad antes de confirmar el pedido.";
  const count = data.items.length;

  return (
    <div>
      <HeroPage
        eyebrow={site.shop.heroEyebrow}
        title={site.shop.heroTitle}
        description={site.shop.heroDescription}
        backgroundImageUrl={site.shop.heroImageUrl}
        aside={
          <ul className="flex flex-wrap gap-2 lg:justify-end" aria-label="Condiciones de la tienda">
            <li>
              <Badge size="md" tone="fire" icon={<Truck aria-hidden />}>
                Envíos a toda Colombia
              </Badge>
            </li>
            <li>
              <Badge size="md">{ivaIncluded ? "IVA incluido" : "Precios en COP"}</Badge>
            </li>
            <li>
              <Badge size="md" tone="success" icon={<WhatsAppIcon />}>
                {site.shop.orderCtaLabel}
              </Badge>
            </li>
          </ul>
        }
      />

      {categories.length ? (
        <FilterBar sticky label="Filtros de la tienda">
          <ShopCategoryChips categories={categories} active={category} />
        </FilterBar>
      ) : null}

      <section className="container-page py-10 lg:py-14" aria-label="Catálogo de productos">
        {count === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title={category ? `Nada en «${category}» por ahora` : "Pronto, merch nuevo"}
            description={category ? `No hay productos en «${category}» por ahora.` : site.shop.emptyStateMessage}
            action={
              <Button asChild variant="whatsapp" size="lg">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  Escribir por WhatsApp
                </a>
              </Button>
            }
          />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <Text as="p" size="label" tone="3">
                {count} {count === 1 ? "producto" : "productos"}
                {category ? ` · ${category}` : ""}
              </Text>
              <Text as="p" size="label" tone="3">
                {ivaIncluded ? "Precios en COP · IVA incluido" : "Precios en COP"}
              </Text>
            </div>
            <HomeStagger className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
              {data.items.map((p, i) => (
                <HomeStaggerItem key={p.id} className="h-full">
                  <ProductCard product={p} priority={i < 4} ivaIncluded={ivaIncluded} />
                </HomeStaggerItem>
              ))}
            </HomeStagger>
            <div className="mt-12 flex items-start gap-3 border-t border-line-1 pt-6">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-fire-400" strokeWidth={1.75} aria-hidden />
              <Text as="p" size="body-sm" tone="2" prose>
                {shippingNote}
              </Text>
            </div>
          </>
        )}
      </section>

      <FaqSection
        items={SHOP_FAQ}
        subtitle="Pedidos por WhatsApp, pagos, envíos a toda Colombia, retracto, garantía y cambios de talla."
      />
    </div>
  );
}
