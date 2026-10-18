"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { FieldError } from "@/components/ui/field-error";
import { IconButton } from "@/components/ui/icon-button";
import { Text } from "@/components/ui/text";
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
    <div className="space-y-8">
      <LazyToaster />
      {needsSize ? (
        <fieldset
          id="talla"
          className="scroll-mt-28"
          aria-describedby={sizeError ? sizeErrorId : undefined}
          aria-invalid={sizeError ? true : undefined}
        >
          <legend className="text-label text-text-3">Talla</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => {
              const selected = s === size;
              return (
                <Chip
                  key={s}
                  selected={selected}
                  disabled={soldOut}
                  onClick={() => {
                    setSize(s);
                    setSizeError(null);
                  }}
                  className={cn("min-w-11 justify-center font-mono normal-case", sizeError && !selected && "border-danger/70")}
                >
                  {s}
                </Chip>
              );
            })}
          </div>
          <FieldError id={sizeErrorId}>{sizeError}</FieldError>
        </fieldset>
      ) : null}

      <div>
        <p className="text-label text-text-3">Cantidad</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center rounded border border-line-2 bg-ink-3">
            <IconButton
              variant="ghost"
              pill={false}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={soldOut || qty <= 1}
              aria-label="Reducir cantidad"
            >
              <Minus />
            </IconButton>
            <span className="w-12 text-center font-mono text-body-lg tabular-nums text-text-1" aria-live="polite">
              <span className="sr-only">Cantidad: </span>
              {qty}
            </span>
            <IconButton
              variant="ghost"
              pill={false}
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={soldOut || qty >= maxQty}
              aria-label="Aumentar cantidad"
            >
              <Plus />
            </IconButton>
          </div>
          {product.stock != null && product.stock > 0 && product.stock <= 5 ? (
            <Badge tone="warning" size="md">
              Quedan {product.stock} unidades
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button type="button" size="xl" className="w-full" onClick={handleAdd} disabled={soldOut}>
          <ShoppingBag aria-hidden />
          {soldOut ? "Agotado" : addLabel}
        </Button>
        {soldOut ? (
          <Button type="button" size="lg" variant="whatsapp" className="w-full" disabled>
            <WhatsAppIcon />
            {orderLabel}
          </Button>
        ) : (
          <Button asChild size="lg" variant="whatsapp" className="w-full">
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
              <WhatsAppIcon />
              {orderLabel}
            </a>
          </Button>
        )}
      </div>
      <Text as="p" size="body-sm" tone="3">
        Al enviar aceptas los{" "}
        <Link href={SHOP_TERMS_PATH} className="link-sweep text-fire-400 hover:text-fire-300">
          Términos de la tienda
        </Link>
        . El pedido se confirma por WhatsApp y el envío se cotiza según tu ciudad.
      </Text>
    </div>
  );
}
