import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/models";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { formatCOP } from "@/lib/format-cop";
import { isSoldOut } from "@/features/shop/api";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  /** Prioriza la carga de la imagen (primeras tarjetas sobre el pliegue) */
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const soldOut = isSoldOut(product);
  const cover = product.images?.[0];
  const hasDiscount = product.compareAtCOP != null && product.compareAtCOP > product.priceCOP;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(255,107,0,0.1)]",
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {cover ? (
          <Image
            src={resolveMediaUrl(cover)}
            alt={product.name}
            fill
            priority={priority}
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-[1.04]",
              soldOut && "grayscale-[0.6]",
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <PlaceholderCover seed={product.name} className="absolute inset-0" />
        )}
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
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{product.category}</p>
        <h3 className="mt-1 font-body text-base font-semibold leading-snug text-foreground">
          <Link
            href={`/tienda/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-primary"
            aria-label={`${product.name}${soldOut ? " (agotado)" : ""}`}
          >
            <span className="line-clamp-2">{product.name}</span>
          </Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-3">
          <span className={cn("font-mono text-lg", soldOut ? "text-[var(--text-secondary)]" : "text-primary")}>
            {formatCOP(product.priceCOP)}
          </span>
          {hasDiscount ? (
            <span className="font-mono text-xs text-[var(--text-muted)] line-through">{formatCOP(product.compareAtCOP as number)}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
