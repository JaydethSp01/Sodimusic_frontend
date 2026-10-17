import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/models";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { formatCOP } from "@/lib/format-cop";
import { COVER_IMAGE_PROPS } from "@/lib/image-blur";
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
 * Tarjeta de producto: portada 4:5 con overlay, precio en chip, "Antes $X" tachado.
 * Sin imagen se muestra el placeholder de marca (nunca se oculta el producto).
 */
export function ProductCard({ product, priority = false, ivaIncluded = true, className }: ProductCardProps) {
  const soldOut = isSoldOut(product);
  const cover = product.images?.find((u) => typeof u === "string" && u.trim());
  const hasDiscount = product.compareAtCOP != null && product.compareAtCOP > product.priceCOP;
  const discountPct = hasDiscount
    ? Math.round(((product.compareAtCOP as number) - product.priceCOP) / (product.compareAtCOP as number) * 100)
    : 0;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(255,107,0,0.1)] focus-within:border-primary/50",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {cover ? (
          <Image
            src={resolveMediaUrl(cover)}
            alt={`${product.name} — ${product.category}`}
            fill
            priority={priority}
            {...COVER_IMAGE_PROPS}
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none",
              soldOut && "grayscale-[0.6]",
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <PlaceholderCover seed={product.name} className="absolute inset-0" />
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          aria-hidden
        />
        <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5">
          {soldOut ? (
            <span className="rounded-full bg-black/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/85 backdrop-blur-sm">
              Agotado
            </span>
          ) : null}
          {product.featured ? (
            <span className="rounded-full bg-[var(--gold)]/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--gold)] ring-1 ring-[var(--gold)]/40 backdrop-blur-sm">
              Destacado
            </span>
          ) : null}
          {hasDiscount && !soldOut ? (
            <span className="rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white">
              -{discountPct}%
            </span>
          ) : null}
        </div>
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex flex-wrap items-end justify-between gap-1.5">
          <span
            className={cn(
              "inline-flex items-baseline gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm backdrop-blur-sm",
              soldOut ? "bg-black/70 text-[var(--text-secondary)]" : "bg-black/70 text-primary ring-1 ring-primary/40",
            )}
          >
            {formatCOP(product.priceCOP)}
            {hasDiscount ? (
              <span className="text-[10px] text-white/55 line-through">
                <span className="sr-only">Antes </span>
                {formatCOP(product.compareAtCOP as number)}
              </span>
            ) : null}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">{product.category}</p>
        <h3 className="mt-1 font-body text-base font-semibold leading-snug text-foreground">
          <Link
            href={`/tienda/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-primary"
            aria-label={`${product.name}, ${formatCOP(product.priceCOP)}${ivaIncluded ? " IVA incluido" : ""}${soldOut ? " (agotado)" : ""}`}
          >
            <span className="line-clamp-2">{product.name}</span>
          </Link>
        </h3>
        {ivaIncluded ? (
          <p className="mt-auto pt-2 font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">IVA incluido</p>
        ) : null}
      </div>
    </article>
  );
}
