import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";
import { HomeFadeSection, HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { ProductCard } from "@/features/shop/components/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/models";
import type { SiteContent } from "@/types/site-content";

/** Quita flechas escritas en el CMS ("Ver toda la tienda →"): el icono ya las aporta. */
export function stripTrailingArrow(label: string): string {
  return label.replace(/[\s→➔➜>-]+$/, "").trim();
}

const HOME_MAX = 4;

export function HomeShopSection({ shop, products }: { shop: SiteContent["shop"]; products: Product[] }) {
  const items = products.slice(0, HOME_MAX);
  if (!items.length) {
    return null;
  }
  const cta = stripTrailingArrow(shop.homeCtaLabel) || "Ver toda la tienda";
  return (
    <HomeFadeSection className="px-4 py-16 sm:py-20 lg:px-8 lg:py-32" aria-labelledby="home-shop-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            eyebrow={shop.homeSectionEyebrow}
            title={shop.homeSectionTitle}
            subtitle={shop.homeSectionSubtitle}
            id="home-shop-title"
          />
          <Button asChild variant="outline" className="mb-12 hidden h-11 md:inline-flex">
            <Link href="/tienda">
              {cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
        <HomeStagger
          className={cn(
            "grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 sm:gap-5",
            // Con pocos productos acotamos el ancho para que una sola tarjeta no ocupe toda la fila.
            items.length === 1 && "max-w-sm",
            items.length === 2 && "max-w-2xl",
            items.length === 3 && "max-w-4xl",
          )}
        >
          {items.map((p) => (
            <HomeStaggerItem key={p.id} className="h-full">
              <ProductCard product={p} />
            </HomeStaggerItem>
          ))}
        </HomeStagger>
        <div className="mt-10 text-center md:hidden">
          <Button asChild variant="outline" className="h-11">
            <Link href="/tienda">
              {cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </HomeFadeSection>
  );
}
