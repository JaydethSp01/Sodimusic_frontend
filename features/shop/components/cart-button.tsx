"use client";

import { ShoppingBag } from "lucide-react";
import { selectCount, useCartHydrated, useCartStore } from "@/features/shop/stores/cart-store";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const setOpen = useCartStore((s) => s.setOpen);
  const count = hydrated ? selectCount({ items }) : 0;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary-muted hover:text-primary",
        className,
      )}
      aria-label={count > 0 ? `Abrir pedido (${count} ${count === 1 ? "artículo" : "artículos"})` : "Abrir pedido"}
    >
      <ShoppingBag className="h-6 w-6" aria-hidden />
      {count > 0 ? (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold text-white ring-2 ring-background"
          aria-hidden
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
