import Link from "next/link";
import type { Product } from "@/types/models";
import { Badge } from "@/components/ui/badge";
import { MediaFrame } from "@/components/ds/media-frame";
import { QuickAddButton } from "@/features/shop/components/quick-add-button";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { formatCOP } from "@/lib/format-cop";
import { isSoldOut } from "@/features/shop/api";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  /** Prioriza la carga de la imagen (primeras tarjetas sobre el pliegue) */
  priority?: boolean;
  /** legal.ivaIncluded: muestra "IVA incluido" junto al precio */
  ivaIncluded?: boolean;
  className?: string;
}

/**
 * Tarjeta de producto (contrato v4 §6.3): `MediaFrame` 4/5 con el precio en mono display-sm sobre la
 * imagen, badges «-14%» (oro) / «Destacado» (fire) / «Agotado», y «Añadir» flotante (44 px; en
 * escritorio aparece al pasar el cursor). La foto va sin duotono: en merch el color real del producto
 * manda sobre el tratamiento de marca. Sin imagen se muestra el placeholder (nunca se oculta el producto).
 */
export function ProductCard({ product, priority = false, ivaIncluded = true, className }: ProductCardProps) {
  const soldOut = isSoldOut(product);
  const cover = product.images?.find((u) => typeof u === "string" && u.trim());
  const hasDiscount = product.compareAtCOP != null && product.compareAtCOP > product.priceCOP;
  const discountPct = hasDiscount
    ? Math.round((((product.compareAtCOP as number) - product.priceCOP) / (product.compareAtCOP as number)) * 100)
    : 0;

  return (
    <article className={cn("group relative flex h-full flex-col", className)}>
      <div className="relative">
        <MediaFrame
          src={cover ? resolveMediaUrl(cover) : null}
          alt={`${product.name} — ${product.category}`}
          aspect="4/5"
          treatment="none"
          zoom
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          fallbackSeed={product.name}
          fallbackLabel=""
          className={cn("shadow-card", soldOut && "[&_img]:grayscale [&_img]:opacity-70")}
          badges={
            soldOut || product.featured || hasDiscount ? (
              <>
                {soldOut ? (
                  <Badge tone="neutral" variant="solid">
                    Agotado
                  </Badge>
                ) : null}
                {product.featured ? (
                  <Badge tone="fire" variant="solid">
                    Destacado
                  </Badge>
                ) : null}
                {hasDiscount && !soldOut ? (
                  <Badge tone="gold" variant="solid">
                    -{discountPct}%
                  </Badge>
                ) : null}
              </>
            ) : undefined
          }
          overlay={
            <p className="min-w-0">
              <span
                className={cn(
                  "block truncate font-mono text-display-sm tabular-nums",
                  soldOut ? "text-text-2" : "text-text-1",
                )}
              >
                {formatCOP(product.priceCOP)}
              </span>
              {hasDiscount ? (
                <span className="mt-1 block font-mono text-body-sm text-text-2">
                  <span className="sr-only">Antes </span>
                  <s>{formatCOP(product.compareAtCOP as number)}</s>
                </span>
              ) : null}
            </p>
          }
        />
        {!soldOut ? (
          <div className="absolute right-3 top-3 z-10">
            <QuickAddButton product={product} />
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <p className="text-label text-text-3">{product.category}</p>
        <h3 className="text-title text-text-1 transition-colors duration-150 group-hover:text-fire-300">
          <Link
            href={`/tienda/${product.slug}`}
            className="after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-fire-500 focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-ink-0"
            aria-label={`${product.name}, ${formatCOP(product.priceCOP)}${ivaIncluded ? " IVA incluido" : ""}${soldOut ? " (agotado)" : ""}`}
          >
            <span className="line-clamp-2">{product.name}</span>
          </Link>
        </h3>
        {ivaIncluded ? <p className="mt-auto pt-1 text-label text-text-3">IVA incluido</p> : null}
      </div>
    </article>
  );
}
