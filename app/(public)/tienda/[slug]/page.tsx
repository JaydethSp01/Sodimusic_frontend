import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck } from "lucide-react";
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
    <article className="px-4 py-10 lg:px-8 lg:py-16">
      <Script id={`ld-product-${product.id}`} type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <div className="mx-auto max-w-7xl">
        <Link
          href="/tienda"
          className="inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--text-secondary)] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {site.shop.navLabel}
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images ?? []} name={product.name} />

          <div className="lg:py-2">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">{product.category}</p>
            <h1 className="mt-2 font-display text-4xl leading-none tracking-wide text-foreground sm:text-5xl md:text-6xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-3xl text-primary">{formatCOP(product.priceCOP)}</span>
              {hasDiscount ? (
                <span className="font-mono text-base text-[var(--text-muted)]">
                  Antes <span className="line-through">{formatCOP(product.compareAtCOP as number)}</span>
                </span>
              ) : null}
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                COP{ivaIncluded ? " · IVA incluido" : ""}
              </span>
              {soldOut ? (
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                  Agotado
                </span>
              ) : null}
            </div>

            {product.description?.trim() ? (
              <p className="mt-6 max-w-prose whitespace-pre-line text-base leading-relaxed text-[var(--text-secondary)]">
                {product.description}
              </p>
            ) : null}

            <div className="mt-8 border-t border-border pt-8">
              <AddToCart
                product={product}
                addLabel={site.shop.addToCartLabel}
                orderLabel={site.shop.orderCtaLabel}
                whatsappPhone={site.contact.whatsapp}
                whatsappIntro={site.shop.whatsappOrderIntro}
                siteUrl={base}
                ivaIncluded={ivaIncluded}
              />
              <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-[var(--text-muted)]">
                <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{shippingNote}</span>
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-20 border-t border-primary/10 pt-12" aria-labelledby="related-products">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">{site.shop.navLabel}</p>
            <h2 id="related-products" className="mt-2 font-display text-3xl tracking-wide text-foreground md:text-4xl">
              También te puede gustar
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.id} className="h-full">
                  <ProductCard product={p} ivaIncluded={ivaIncluded} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
