"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCartHydrated, useCartStore } from "@/features/shop/stores/cart-store";

const CartDrawer = dynamic(() => import("./cart-drawer").then((m) => m.CartDrawer), { ssr: false });

type CartDrawerLazyProps = React.ComponentProps<typeof CartDrawer>;

/**
 * Monta `CartDrawer` (radix dialog + react-remove-scroll) solo cuando hace falta: cuando el pedido
 * tiene ítems o al pulsar el botón del carrito (`setOpen(true)` en el store). Hasta entonces, cero JS
 * del drawer en las rutas públicas. Una vez montado se mantiene (animación de cierre incluida).
 */
export function CartDrawerLazy(props: CartDrawerLazyProps) {
  const hydrated = useCartHydrated();
  const open = useCartStore((s) => s.open);
  const hasItems = useCartStore((s) => s.items.length > 0);
  const [wanted, setWanted] = useState(false);

  useEffect(() => {
    if (hydrated && (open || hasItems)) {
      setWanted(true);
    }
  }, [hydrated, open, hasItems]);

  return wanted ? <CartDrawer {...props} /> : null;
}
