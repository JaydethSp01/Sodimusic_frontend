import Link from "next/link";
import { MediaCard } from "@/components/ds/media-card";
import { SectionHeader } from "@/components/ds/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { HomeFadeSection, HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { isSoldOut } from "@/features/shop/api";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/models";
import type { SiteContent } from "@/types/site-content";

/** Quita flechas escritas en el CMS ("Ver toda la tienda →"): el icono ya las aporta. */
export function stripTrailingArrow(label: string): string {
  return label.replace(/[\s→➔➜>-]+$/, "").trim();
}

const HOME_MAX = 4;

function discountPct(p: Product): number {
  if (p.compareAtCOP == null || p.compareAtCOP <= p.priceCOP) return 0;
  return Math.round(((p.compareAtCOP - p.priceCOP) / p.compareAtCOP) * 100);
}

/**
 * Merch en la home: cabecera a la izquierda (escritorio) y hasta 4 `MediaCard` 4/5 con `Price`,
 * badges «Destacado» (oro) / «-N %» / «Agotado» sobre la imagen. Fondo ink-1.
 */
export function HomeShopSection({ shop, products }: { shop: SiteContent["shop"]; products: Product[] }) {
  const items = products.slice(0, HOME_MAX);
  if (!items.length) {
    return null;
  }
  const cta = stripTrailingArrow(shop.homeCtaLabel) || "Ver toda la tienda";
  const action = (
    <Button asChild variant="outline" withArrow>
      <Link href="/tienda">{cta}</Link>
    </Button>
  );

  return (
    <HomeFadeSection className="bg-ink-1 py-section" aria-labelledby="home-shop-title">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <SectionHeader
            eyebrow={shop.homeSectionEyebrow}
            title={shop.homeSectionTitle}
            lead={shop.homeSectionSubtitle}
            id="home-shop-title"
            className="mb-0 md:flex-col md:items-start lg:sticky lg:top-24"
            action={<div className="hidden md:block">{action}</div>}
          />
        </div>
        <HomeStagger
          className={cn(
            "grid grid-cols-2 gap-4 sm:gap-5 lg:col-span-8 lg:grid-cols-3",
            items.length === 4 && "xl:grid-cols-4",
          )}
        >
          {items.map((p, i) => {
            const cover = p.images?.find((u) => typeof u === "string" && u.trim());
            const soldOut = isSoldOut(p);
            const pct = discountPct(p);
            return (
              <HomeStaggerItem key={p.id} className="h-full">
                <MediaCard
                  src={cover ? resolveMediaUrl(cover) : null}
                  alt={`${p.name} — ${p.category}`}
                  aspect="4/5"
                  priority={i === 0}
                  fallbackSeed={p.name}
                  fallbackLabel=""
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  title={p.name}
                  href={`/tienda/${p.slug}`}
                  badges={
                    <>
                      {soldOut ? <Badge tone="neutral" variant="solid">Agotado</Badge> : null}
                      {p.featured && !soldOut ? <Badge tone="gold" variant="solid">Destacado</Badge> : null}
                      {pct > 0 && !soldOut ? <Badge tone="fire" variant="solid">-{pct} %</Badge> : null}
                    </>
                  }
                  meta={<Badge variant="outline">{p.category}</Badge>}
                  action={
                    <Price
                      amount={p.priceCOP}
                      compareAt={p.compareAtCOP ?? undefined}
                      size="sm"
                      tone={soldOut ? "1" : "fire"}
                      className="flex-col items-end gap-0"
                    />
                  }
                  className={cn(soldOut && "opacity-70")}
                />
              </HomeStaggerItem>
            );
          })}
        </HomeStagger>
        <div className="text-center md:hidden">
          <Button asChild variant="outline" withArrow className="w-full sm:w-auto">
            <Link href="/tienda">{cta}</Link>
          </Button>
        </div>
      </div>
    </HomeFadeSection>
  );
}
