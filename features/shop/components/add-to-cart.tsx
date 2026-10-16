"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/shop/stores/cart-store";
import { isSoldOut } from "@/features/shop/api";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp-order";
import { formatCOP } from "@/lib/format-cop";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/models";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

interface AddToCartProps {
  product: Product;
  addLabel: string;
  orderLabel: string;
  whatsappPhone: string;
  whatsappIntro: string;
  siteUrl: string;
}

const MAX_QTY = 99;

export function AddToCart({ product, addLabel, orderLabel, whatsappPhone, whatsappIntro, siteUrl }: AddToCartProps) {
  const sizes = useMemo(() => (product.sizes ?? []).filter((s) => s && s.trim()), [product.sizes]);
  const needsSize = sizes.length > 0;
  const [size, setSize] = useState<string | undefined>(sizes.length === 1 ? sizes[0] : undefined);
  const [qty, setQty] = useState(1);
  const add = useCartStore((s) => s.add);
  const setOpen = useCartStore((s) => s.setOpen);

  const soldOut = isSoldOut(product);
  const maxQty = product.stock != null && product.stock > 0 ? Math.min(MAX_QTY, product.stock) : MAX_QTY;
  const sizeMissing = needsSize && !size;

  const waUrl = buildWhatsAppOrderUrl({
    phone: whatsappPhone,
    intro: whatsappIntro,
    items: [{ name: product.name, qty, priceCOP: product.priceCOP, size, slug: product.slug }],
    subtotal: product.priceCOP * qty,
    siteUrl,
  });

  function handleAdd() {
    if (soldOut) {
      return;
    }
    if (sizeMissing) {
      toast.error("Elige una talla antes de añadir.");
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCOP: product.priceCOP,
      image: product.images?.[0],
      size,
      qty,
    });
    toast.success(`${product.name}${size ? ` (${size})` : ""} añadido al pedido`, {
      action: { label: "Ver pedido", onClick: () => setOpen(true) },
    });
  }

  return (
    <div className="space-y-6">
      {needsSize ? (
        <fieldset>
          <legend className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Talla</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => {
              const selected = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  disabled={soldOut}
                  aria-pressed={selected}
                  className={cn(
                    "min-h-11 min-w-11 rounded-md border px-4 font-mono text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-transparent text-foreground hover:border-primary/40",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Cantidad</p>
        <div className="mt-3 inline-flex items-center rounded-md border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={soldOut || qty <= 1}
            className="flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:text-primary disabled:opacity-40"
            aria-label="Reducir cantidad"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <span className="w-12 text-center font-mono text-base tabular-nums" aria-live="polite" aria-label={`Cantidad: ${qty}`}>
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={soldOut || qty >= maxQty}
            className="flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:text-primary disabled:opacity-40"
            aria-label="Aumentar cantidad"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {product.stock != null && product.stock > 0 && product.stock <= 5 ? (
          <p className="mt-2 font-mono text-xs text-[var(--gold)]">Quedan {product.stock} unidades</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" size="lg" className="h-12 flex-1" onClick={handleAdd} disabled={soldOut}>
          <ShoppingBag className="!size-5" aria-hidden />
          {soldOut ? "Agotado" : addLabel}
        </Button>
        {soldOut ? (
          <Button type="button" size="lg" variant="outline" className="h-12 flex-1" disabled>
            <WhatsAppIcon className="!size-5" />
            {orderLabel}
          </Button>
        ) : (
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 flex-1 border-[#25D366]/50 bg-[#25D366]/10 text-[#25D366] hover:border-[#25D366] hover:bg-[#25D366]/20 hover:text-[#25D366]"
          >
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (sizeMissing) {
                  e.preventDefault();
                  toast.error("Elige una talla antes de pedir.");
                }
              }}
              aria-label={`${orderLabel}: ${qty} × ${product.name} por ${formatCOP(product.priceCOP * qty)}`}
            >
              <WhatsAppIcon className="!size-5" />
              {orderLabel}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
