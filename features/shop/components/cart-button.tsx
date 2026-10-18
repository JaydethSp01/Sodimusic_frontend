"use client";

import { ShoppingCart } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { selectCount, useCartHydrated, useCartStore } from "@/features/shop/stores/cart-store";
import { cn } from "@/lib/utils";

/** Botón del pedido en la barra: IconButton 44 px con contador (badge 11 px, mínimo del sistema). */
export function CartButton({ className }: { className?: string }) {
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const setOpen = useCartStore((s) => s.setOpen);
  const count = hydrated ? selectCount({ items }) : 0;

  return (
    <IconButton
      variant="ghost"
      onClick={() => setOpen(true)}
      className={cn("relative touch-manipulation text-text-1 hover:text-fire-300", className)}
      aria-label={count > 0 ? `Abrir pedido (${count} ${count === 1 ? "artículo" : "artículos"})` : "Abrir pedido"}
    >
      <ShoppingCart />
      {count > 0 ? (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-fire-500 px-1 font-mono text-label-sm font-semibold text-fire-on ring-2 ring-ink-0"
          aria-hidden
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </IconButton>
  );
}
