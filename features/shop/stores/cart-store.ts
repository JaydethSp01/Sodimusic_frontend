"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  priceCOP: number;
  image?: string;
  size?: string;
  qty: number;
}

export const CART_STORAGE_KEY = "sodimusic-cart";
const MAX_QTY = 99;

export function cartLineKey(productId: string, size?: string): string {
  return `${productId}::${size ?? ""}`;
}

interface CartState {
  items: CartItem[];
  /** Estado del drawer (no se persiste) */
  open: boolean;
  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  remove: (productId: string, size?: string) => void;
  setQty: (productId: string, size: string | undefined, qty: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  /** Actualiza nombre/precio desde la API; `null` elimina la línea (producto retirado). Devuelve cuántas líneas cambiaron. */
  syncProducts: (updates: Record<string, { name: string; priceCOP: number } | null>) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      add: (item) =>
        set((s) => {
          const key = cartLineKey(item.productId, item.size);
          const qty = Math.max(1, Math.min(MAX_QTY, Math.round(item.qty ?? 1)));
          const idx = s.items.findIndex((x) => cartLineKey(x.productId, x.size) === key);
          if (idx === -1) {
            const { qty: _ignored, ...rest } = item;
            return { items: [...s.items, { ...rest, qty }] };
          }
          const next = s.items.slice();
          next[idx] = { ...next[idx], qty: Math.min(MAX_QTY, next[idx].qty + qty) };
          return { items: next };
        }),
      remove: (productId, size) =>
        set((s) => {
          const key = cartLineKey(productId, size);
          return { items: s.items.filter((x) => cartLineKey(x.productId, x.size) !== key) };
        }),
      setQty: (productId, size, qty) =>
        set((s) => {
          const key = cartLineKey(productId, size);
          const q = Math.round(qty);
          if (q <= 0) {
            return { items: s.items.filter((x) => cartLineKey(x.productId, x.size) !== key) };
          }
          return {
            items: s.items.map((x) =>
              cartLineKey(x.productId, x.size) === key ? { ...x, qty: Math.min(MAX_QTY, q) } : x,
            ),
          };
        }),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
      syncProducts: (updates) => {
        let changed = 0;
        set((s) => {
          const next: CartItem[] = [];
          for (const it of s.items) {
            if (!(it.productId in updates)) {
              next.push(it);
              continue;
            }
            const u = updates[it.productId];
            if (u === null) {
              changed += 1;
              continue;
            }
            if (u.priceCOP !== it.priceCOP || u.name !== it.name) {
              changed += 1;
              next.push({ ...it, priceCOP: u.priceCOP, name: u.name });
            } else {
              next.push(it);
            }
          }
          return changed ? { items: next } : {};
        });
        return changed;
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      // Evita desajustes de hidratación: el servidor y el primer render del cliente ven el carrito vacío.
      skipHydration: true,
    },
  ),
);

export const selectCount = (s: Pick<CartState, "items">): number => s.items.reduce((acc, x) => acc + x.qty, 0);
export const selectSubtotal = (s: Pick<CartState, "items">): number =>
  s.items.reduce((acc, x) => acc + x.priceCOP * x.qty, 0);

/**
 * Rehidrata el carrito desde localStorage tras montar y devuelve si ya está listo.
 * En SSR (sin `localStorage`) zustand no expone `store.persist`, por eso se accede con guarda.
 */
export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persistApi = (useCartStore as { persist?: typeof useCartStore.persist }).persist;
    if (!persistApi) {
      return;
    }
    const unsub = persistApi.onFinishHydration(() => setHydrated(true));
    if (persistApi.hasHydrated()) {
      setHydrated(true);
    } else {
      void persistApi.rehydrate();
    }
    return unsub;
  }, []);

  return hydrated;
}
