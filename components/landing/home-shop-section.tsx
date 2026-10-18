import Link from "next/link";
import { SectionHeader } from "@/components/ds/section-header";
import { Button } from "@/components/ui/button";
import { HomeFadeSection, HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { ProductCard } from "@/features/shop/components/product-card";
import type { Product } from "@/types/models";
import type { SiteContent, SiteHomeMerch } from "@/types/site-content";

/** Quita flechas escritas en el CMS ("Ver toda la tienda →"): el icono ya las aporta. */
export function stripTrailingArrow(label: string): string {
  return label.replace(/[\s→➔➜>-]+$/, "").trim();
}

/**
 * Merch en la home: cabecera a la izquierda (escritorio) y hasta `merch.limit` `ProductCard` (MediaFrame 4/5,
 * precio sobre la imagen, badges y «Añadir» flotante = `QuickAddButton`) en grilla 2/4. Fondo ink-1.
 * El botón «Ver la tienda» aparece con ≥ 4 productos o si la tienda tiene más de los mostrados.
 */
export function HomeShopSection({
  shop,
  merch,
  products,
  total,
  ivaIncluded = true,
}: {
  shop: SiteContent["shop"];
  merch: SiteHomeMerch;
  products: Product[];
  /** Total de productos activos en la tienda (para decidir si mostrar «Ver la tienda»). */
  total?: number;
  ivaIncluded?: boolean;
}) {
  const items = products.slice(0, merch.limit);
  if (!items.length) {
    return null;
  }
  const cta = stripTrailingArrow(merch.ctaLabel) || "Ver la tienda";
  const showCta = items.length >= 4 || (typeof total === "number" && total > items.length);
  const action = showCta ? (
    <Button asChild variant="outline" withArrow>
      <Link href="/tienda">{cta}</Link>
    </Button>
  ) : undefined;

  return (
    <HomeFadeSection className="bg-ink-1 py-section" aria-labelledby="home-shop-title">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <SectionHeader
            eyebrow={shop.homeSectionEyebrow}
            title={merch.title}
            lead={merch.subtitle}
            id="home-shop-title"
            className="mb-0 md:flex-col md:items-start lg:sticky lg:top-24"
            action={action ? <div className="hidden md:block">{action}</div> : undefined}
          />
        </div>
        <HomeStagger className="grid grid-cols-2 gap-4 sm:gap-5 lg:col-span-8 lg:grid-cols-4">
          {items.map((p, i) => (
            <HomeStaggerItem key={p.id} className="h-full">
              <ProductCard product={p} priority={i < 2} ivaIncluded={ivaIncluded} />
            </HomeStaggerItem>
          ))}
        </HomeStagger>
        {action ? (
          <div className="text-center md:hidden">
            <Button asChild variant="outline" withArrow className="w-full sm:w-auto">
              <Link href="/tienda">{cta}</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </HomeFadeSection>
  );
}
