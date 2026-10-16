import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/shared/section-title";
import { Button } from "@/components/ui/button";
import { HomeFadeSection, HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { ProductCard } from "@/features/shop/components/product-card";
import type { Product } from "@/types/models";
import type { SiteContent } from "@/types/site-content";

export function HomeShopSection({ shop, products }: { shop: SiteContent["shop"]; products: Product[] }) {
  if (!products.length) {
    return null;
  }
  return (
    <HomeFadeSection className="border-t border-border px-4 py-20 lg:px-8" aria-labelledby="home-shop-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            eyebrow={shop.homeSectionEyebrow}
            title={shop.homeSectionTitle}
            subtitle={shop.homeSectionSubtitle}
            id="home-shop-title"
          />
          <Button asChild variant="outline" className="mb-10 hidden md:inline-flex">
            <Link href="/tienda">
              {shop.homeCtaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
        <HomeStagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => (
            <HomeStaggerItem key={p.id} className="h-full">
              <ProductCard product={p} />
            </HomeStaggerItem>
          ))}
        </HomeStagger>
        <div className="mt-10 text-center md:hidden">
          <Button asChild variant="outline" className="h-11">
            <Link href="/tienda">
              {shop.homeCtaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </HomeFadeSection>
  );
}
