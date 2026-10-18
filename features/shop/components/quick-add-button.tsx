"use client";

import Link from "next/link";
import { Ruler, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/shop/stores/cart-store";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/models";

/**
 * «Añadir» flotante de la tarjeta de producto. Si el producto tiene varias tallas lleva al detalle
 * («Elegir talla»); si no, añade una unidad al pedido y abre el drawer (la confirmación es el propio
 * drawer: así funciona también en la portada, donde no hay Toaster montado).
 * 44 px siempre; en escritorio aparece al pasar el cursor (o al enfocar) sobre la tarjeta.
 */
export function QuickAddButton({ product, className }: { product: Product; className?: string }) {
  const add = useCartStore((s) => s.add);
  const setOpen = useCartStore((s) => s.setOpen);
  const sizes = (product.sizes ?? []).filter((s) => s && s.trim());
  const needsSize = sizes.length > 1;
  const classes = cn(
    "border-line-2 bg-ink-0/80 px-3 text-text-1 backdrop-blur-md hover:border-fire-500 hover:bg-ink-0/90 hover:text-fire-300 md:px-4",
    "md:translate-y-1 md:opacity-0 md:transition-[opacity,transform,color,border-color] md:duration-200 md:ease-out md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 motion-reduce:transition-none",
    className,
  );

  if (needsSize) {
    return (
      <Button asChild variant="secondary" pill className={classes}>
        <Link href={`/tienda/${product.slug}`} aria-label={`Elegir talla de ${product.name}`}>
          <Ruler aria-hidden />
          <span className="hidden md:inline">Elegir talla</span>
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      pill
      className={classes}
      aria-label={`Añadir ${product.name} al pedido`}
      onClick={() => {
        add({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          priceCOP: product.priceCOP,
          image: product.images?.[0],
          size: sizes[0],
          qty: 1,
        });
        setOpen(true);
      }}
    >
      <ShoppingBag aria-hidden />
      <span className="hidden md:inline">Añadir</span>
    </Button>
  );
}
