"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/shop/stores/cart-store";
import { isSoldOut } from "@/features/shop/api";
import { buildWhatsAppOrderUrl, SHOP_TERMS_PATH } from "@/lib/whatsapp-order";
import { formatCOP } from "@/lib/format-cop";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/models";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { LazyToaster } from "@/components/shared/lazy-toaster";

interface AddToCartProps {
  product: Product;
  addLabel: string;
  orderLabel: string;
  whatsappPhone: string;
  whatsappIntro: string;
  siteUrl: string;
  /** legal.ivaIncluded: añade "IVA incluido" al mensaje de WhatsApp */
  ivaIncluded?: boolean;
}

const MAX_QTY = 99;

export function AddToCart({
  product,
  addLabel,
  orderLabel,
  whatsappPhone,
  whatsappIntro,
  siteUrl,
  ivaIncluded = true,
}: AddToCartProps) {
  const sizes = useMemo(() => (product.sizes ?? []).filter((s) => s && s.trim()), [product.sizes]);
  const needsSize = sizes.length > 0;
  const [size, setSize] = useState<string | undefined>(sizes.length === 1 ? sizes[0] : undefined);
  const [sizeError, setSizeError] = useState<string | null>(null);
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
    ivaIncluded,
  });

  function requireSize(): boolean {
    if (sizeMissing) {
      setSizeError("Elige una talla para continuar.");
      toast.error("Elige una talla antes de continuar.");
      return false;
    }
    return true;
  }

  function handleAdd() {
    if (soldOut || !requireSize()) {
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

  const sizeErrorId = "size-error";

  return (
    <div className="space-y-6">
      <LazyToaster />
      {needsSize ? (
        <fieldset aria-describedby={sizeError ? sizeErrorId : undefined} aria-invalid={sizeError ? true : undefined}>
          <legend className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Talla</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => {
              const selected = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setSizeError(null);
                  }}
                  disabled={soldOut}
                  aria-pressed={selected}
                  className={cn(
                    "min-h-11 min-w-11 rounded-md border px-4 font-mono text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-transparent text-foreground hover:border-primary/40",
                    sizeError && !selected && "border-red-400/60",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {sizeError ? (
            <p id={sizeErrorId} role="alert" className="mt-2 text-xs text-red-400">
              {sizeError}
            </p>
          ) : null}
        </fieldset>
      ) : null}

      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Cantidad</p>
        <div className="mt-3 inline-flex items-center rounded-md border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={soldOut || qty <= 1}
            className="flex h-11 w-11 items-center justify-center rounded-l-md text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:opacity-40"
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
            className="flex h-11 w-11 items-center justify-center rounded-r-md text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:opacity-40"
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
        <Button
          type="button"
          size="lg"
          className="h-12 w-full basis-auto sm:w-auto sm:flex-1"
          onClick={handleAdd}
          disabled={soldOut}
        >
          <ShoppingBag className="!size-5" aria-hidden />
          {soldOut ? "Agotado" : addLabel}
        </Button>
        {soldOut ? (
          <Button type="button" size="lg" variant="outline" className="h-12 w-full basis-auto sm:w-auto sm:flex-1" disabled>
            <WhatsAppIcon className="!size-5" />
            {orderLabel}
          </Button>
        ) : (
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 w-full basis-auto border-[#25D366]/50 bg-[#25D366]/10 text-[#25D366] hover:border-[#25D366] hover:bg-[#25D366]/20 hover:text-[#25D366] sm:w-auto sm:flex-1"
          >
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!requireSize()) {
                  e.preventDefault();
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
      <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
        Al enviar aceptas los{" "}
        <Link href={SHOP_TERMS_PATH} className="text-primary underline underline-offset-2 hover:text-primary-hover">
          Términos de la tienda
        </Link>
        . El pedido se confirma por WhatsApp y el envío se cotiza según tu ciudad.
      </p>
    </div>
  );
}
