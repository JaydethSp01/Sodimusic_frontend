import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck } from "lucide-react";
import { SectionHeader } from "@/components/ds/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { SHOP_FAQ } from "@/content/faq";
import { ProductGallery } from "@/features/shop/components/product-gallery";
import { AddToCart } from "@/features/shop/components/add-to-cart";
import { ProductCard } from "@/features/shop/components/product-card";
import { fetchProductBySlug, fetchProducts, isSoldOut } from "@/features/shop/api";
import { getSiteContent } from "@/lib/site-config-server";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { formatCOP } from "@/lib/format-cop";

type Props = { params: { slug: string } };

function siteBase(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Envío, retracto, garantía y cambio de talla: las respuestas ya redactadas de la FAQ de la tienda. */
const PRODUCT_INFO = SHOP_FAQ.filter((f) => /env[ií]o|arrepiento|defectuoso|talla/i.test(f.question));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await fetchProductBySlug(params.slug, 120);
  if (!product) {
    return { title: "Producto" };
  }
  const site = await getSiteContent();
  const description =
    product.description?.trim() || `${product.name} — ${formatCOP(product.priceCOP)}. ${site.shop.metaDescription}`;
  const images = (product.images ?? []).filter(Boolean).slice(0, 3).map((u) => ({ url: resolveMediaUrl(u) }));
  return {
    title: product.name,
    description,
    alternates: { canonical: `/tienda/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      images,
    },
    twitter: {
      card: images.length ? "summary_large_image" : "summary",
      title: product.name,
      description,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await fetchProductBySlug(params.slug);
  if (!product) {
    notFound();
  }
  const site = await getSiteContent();
  const base = siteBase();
  const soldOut = isSoldOut(product);
  const ivaIncluded = site.legal?.ivaIncluded ?? true;

  const sameCategory = await fetchProducts({ category: product.category, pageSize: 8 });
  let related = sameCategory.items.filter((p) => p.id !== product.id);
  if (related.length < 4) {
    const more = await fetchProducts({ pageSize: 12 });
    const seen = new Set(related.map((p) => p.id));
    for (const p of more.items) {
      if (p.id !== product.id && !seen.has(p.id)) {
        related.push(p);
        seen.add(p.id);
      }
    }
  }
  related = related.slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: (product.images ?? []).map((u) => resolveMediaUrl(u)),
    sku: product.id,
    category: product.category,
    brand: { "@type": "Brand", name: site.brand.logoText },
    url: `${base}/tienda/${product.slug}`,
    offers: {
      "@type": "Offer",
      url: `${base}/tienda/${product.slug}`,
      priceCurrency: "COP",
      price: product.priceCOP,
      availability: soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const hasDiscount = product.compareAtCOP != null && product.compareAtCOP > product.priceCOP;
  const shippingNote =
    site.shop.shippingNote?.trim() || "Envío a toda Colombia. El costo se cotiza por WhatsApp según tu ciudad antes de confirmar.";

  return (
    <article className="container-page py-8 lg:py-12">
      <JsonLd data={jsonLd} />
      <Button asChild variant="ghost" size="sm" className="-ml-4 text-label text-text-2 hover:text-fire-300">
        <Link href="/tienda">
          <ArrowLeft aria-hidden />
          {site.shop.navLabel}
        </Link>
      </Button>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6 lg:sticky lg:top-[calc(var(--nav-h,72px)+24px)] lg:self-start">
          <ProductGallery images={product.images ?? []} name={product.name} />
        </div>

        <div className="min-w-0 lg:col-span-6 xl:col-span-5">
          <Eyebrow>{product.category}</Eyebrow>
          <Heading as="h1" size="display-md" className="mt-4">
            {product.name}
          </Heading>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <Price amount={product.priceCOP} size="lg" tone={soldOut ? "1" : "fire"} />
            {hasDiscount ? (
              <span className="font-mono text-body-sm text-text-3">
                Antes <s>{formatCOP(product.compareAtCOP as number)}</s>
              </span>
            ) : null}
            <span className="text-label text-text-3">COP{ivaIncluded ? " · IVA incluido" : ""}</span>
            {soldOut ? <Badge size="md">Agotado</Badge> : null}
          </div>

          {product.description?.trim() ? (
            <Text as="p" size="body" tone="2" prose className="mt-6 whitespace-pre-line">
              {product.description}
            </Text>
          ) : null}

          <div className="mt-8 border-t border-line-1 pt-8">
            <AddToCart
              product={product}
              addLabel={site.shop.addToCartLabel}
              orderLabel={site.shop.orderCtaLabel}
              whatsappPhone={site.contact.whatsapp}
              whatsappIntro={site.shop.whatsappOrderIntro}
              siteUrl={base}
              ivaIncluded={ivaIncluded}
            />
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-lg border border-line-1 bg-ink-2 p-4">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-fire-400" strokeWidth={1.75} aria-hidden />
            <Text as="p" size="body-sm" tone="2">
              {shippingNote}
            </Text>
          </div>

          {PRODUCT_INFO.length ? (
            <section className="mt-10" aria-labelledby="product-info-title">
              <Eyebrow id="product-info-title" as="p">
                Envío, retracto y garantía
              </Eyebrow>
              <div className="mt-4">
                <FaqAccordion items={PRODUCT_INFO} idPrefix="product-info" />
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-20 border-t border-line-1 pt-12 lg:mt-28" aria-labelledby="related-products">
          <SectionHeader eyebrow={site.shop.navLabel} title="También te puede gustar" accent="gustar" id="related-products" />
          <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
            {related.map((p) => (
              <li key={p.id} className="h-full">
                <ProductCard product={p} ivaIncluded={ivaIncluded} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
