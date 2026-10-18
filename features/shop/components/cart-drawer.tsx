"use client";

import Image from "next/image";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { getPublicApiUrl } from "@/lib/api";
import type { Product } from "@/types/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { IconButton } from "@/components/ui/icon-button";
import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
import { EmptyState } from "@/components/ds/empty-state";
import { ListRow } from "@/components/ds/list-row";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { cartLineKey, selectCount, selectSubtotal, useCartHydrated, useCartStore } from "@/features/shop/stores/cart-store";
import { buildWhatsAppOrderUrl, SHOP_TERMS_PATH } from "@/lib/whatsapp-order";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";

interface CartDrawerProps {
  whatsappPhone: string;
  whatsappIntro: string;
  orderCtaLabel: string;
  shippingNote?: string;
  siteUrl: string;
  /** Texto del enlace a la tienda en el estado vacío */
  shopLabel: string;
  /** legal.ivaIncluded: añade "IVA incluido" al resumen y al mensaje */
  ivaIncluded?: boolean;
}

/** Drawer del pedido (contrato v4 §6.3): `ListRow` + `Price`, resumen con IVA y CTA de WhatsApp. */
export function CartDrawer({
  whatsappPhone,
  whatsappIntro,
  orderCtaLabel,
  shippingNote,
  siteUrl,
  shopLabel,
  ivaIncluded = true,
}: CartDrawerProps) {
  const hydrated = useCartHydrated();
  const open = useCartStore((s) => s.open);
  const setOpen = useCartStore((s) => s.setOpen);
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const syncProducts = useCartStore((s) => s.syncProducts);
  const [priceNotice, setPriceNotice] = useState<string | null>(null);
  const syncedRef = useRef(false);

  // Al abrir el carrito, refrescamos nombre/precio desde la API: el pedido por WhatsApp
  // viaja como oferta aceptada y no debe llevar precios guardados hace días en localStorage.
  useEffect(() => {
    if (!open || !hydrated || items.length === 0 || syncedRef.current) {
      return;
    }
    syncedRef.current = true;
    const base = getPublicApiUrl().replace(/\/$/, "");
    const slugs = Array.from(new Set(items.map((x) => x.slug)));
    let cancelled = false;
    void (async () => {
      const updates: Record<string, { name: string; priceCOP: number } | null> = {};
      await Promise.all(
        slugs.map(async (slug) => {
          const line = items.find((x) => x.slug === slug);
          if (!line) return;
          try {
            const res = await fetch(`${base}/api/products/by-slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
            if (res.status === 404) {
              updates[line.productId] = null;
              return;
            }
            if (!res.ok) return;
            const p = (await res.json()) as Product;
            updates[line.productId] = { name: p.name, priceCOP: p.priceCOP };
          } catch {
            /* sin red: dejamos los precios guardados */
          }
        }),
      );
      if (cancelled) return;
      const changed = syncProducts(updates);
      if (changed > 0) {
        setPriceNotice(
          changed === 1
            ? "Actualizamos el precio o disponibilidad de un producto de tu pedido."
            : `Actualizamos el precio o disponibilidad de ${changed} productos de tu pedido.`,
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, hydrated, items, syncProducts]);

  useEffect(() => {
    if (!open) {
      syncedRef.current = false;
      setPriceNotice(null);
    }
  }, [open]);

  const count = selectCount({ items });
  const subtotal = selectSubtotal({ items });
  const waUrl = buildWhatsAppOrderUrl({
    phone: whatsappPhone,
    intro: whatsappIntro,
    items: items.map((x) => ({ name: x.name, qty: x.qty, priceCOP: x.priceCOP, size: x.size, slug: x.slug })),
    subtotal,
    siteUrl,
    ivaIncluded,
  });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-overlay bg-ink-0/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 right-0 z-modal flex h-full w-full flex-col border-l border-line-1 bg-ink-1 shadow-pop sm:max-w-md",
            "duration-200 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          )}
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between gap-4 border-b border-line-1 px-5 py-4">
            <DialogPrimitive.Title asChild>
              <Heading as="h2" size="display-sm" className="flex items-center gap-3">
                Tu pedido
                {hydrated && count > 0 ? (
                  <Badge tone="fire" size="md" aria-label={`${count} ${count === 1 ? "artículo" : "artículos"}`}>
                    {count}
                  </Badge>
                ) : null}
              </Heading>
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <IconButton variant="ghost" aria-label="Cerrar pedido">
                <X />
              </IconButton>
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            {!hydrated || items.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="Nada todavía"
                description="Tu pedido está vacío."
                className="border-0 py-16"
                action={
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link href="/tienda">{shopLabel}</Link>
                  </Button>
                }
              />
            ) : (
              <>
                {priceNotice ? (
                  <p role="status" className="mb-3 rounded border border-warning/40 bg-warning/10 px-3 py-2 text-body-sm text-warning">
                    {priceNotice}
                  </p>
                ) : null}
                <ul>
                  {items.map((it) => (
                    <ListRow
                      key={cartLineKey(it.productId, it.size)}
                      as="li"
                      className="px-0"
                      media={
                        <Link
                          href={`/tienda/${it.slug}`}
                          onClick={() => setOpen(false)}
                          className="relative block h-16 w-16 overflow-hidden rounded border border-line-1 bg-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500"
                          aria-label={it.name}
                        >
                          {it.image ? (
                            <Image src={resolveMediaUrl(it.image)} alt="" fill className="object-cover" sizes="64px" />
                          ) : (
                            <PlaceholderCover seed={it.name} label="" className="h-full w-full" />
                          )}
                        </Link>
                      }
                      title={
                        <Link
                          href={`/tienda/${it.slug}`}
                          onClick={() => setOpen(false)}
                          className="line-clamp-2 whitespace-normal transition-colors duration-150 hover:text-fire-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500"
                        >
                          {it.name}
                        </Link>
                      }
                      meta={
                        <>
                          {it.size ? <span className="text-label text-text-3">Talla {it.size}</span> : null}
                          <div className="mt-1 flex w-full items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded border border-line-2 bg-ink-3">
                              <IconButton
                                variant="ghost"
                                pill={false}
                                onClick={() => setQty(it.productId, it.size, it.qty - 1)}
                                aria-label={`Reducir cantidad de ${it.name}`}
                              >
                                <Minus />
                              </IconButton>
                              <span className="w-8 text-center font-mono text-body tabular-nums text-text-1" aria-live="polite">
                                {it.qty}
                              </span>
                              <IconButton
                                variant="ghost"
                                pill={false}
                                onClick={() => setQty(it.productId, it.size, it.qty + 1)}
                                aria-label={`Aumentar cantidad de ${it.name}`}
                              >
                                <Plus />
                              </IconButton>
                            </div>
                            <Price amount={it.priceCOP * it.qty} size="sm" />
                          </div>
                        </>
                      }
                      action={
                        <IconButton
                          variant="ghost"
                          className="self-start text-text-3 hover:text-danger"
                          onClick={() => remove(it.productId, it.size)}
                          aria-label={`Quitar ${it.name}${it.size ? ` talla ${it.size}` : ""}`}
                        >
                          <Trash2 />
                        </IconButton>
                      }
                    />
                  ))}
                </ul>
              </>
            )}
          </div>

          {hydrated && items.length > 0 ? (
            <div
              className="border-t border-line-1 bg-ink-2 px-5 pt-4"
              style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
            >
              <p className="flex items-baseline justify-between gap-4">
                <span className="text-label text-text-3">Subtotal</span>
                <Price amount={subtotal} size="lg" />
              </p>
              <p className="mt-2 flex justify-between gap-4 text-label text-text-3">
                <span>{ivaIncluded ? "IVA incluido" : "Precios en COP"}</span>
                <span>Envío: por cotizar</span>
              </p>
              <Text as="p" size="body-sm" tone="3" className="mt-3">
                {shippingNote?.trim() || "El envío se cotiza por WhatsApp según tu ciudad antes de confirmar."}
              </Text>
              <Button asChild size="lg" variant="whatsapp" className="mt-4 w-full">
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  {orderCtaLabel}
                </a>
              </Button>
              <Text as="p" size="body-sm" tone="3" className="mt-3 text-center">
                Al enviar aceptas los{" "}
                <Link href={SHOP_TERMS_PATH} onClick={() => setOpen(false)} className="link-sweep text-fire-400 hover:text-fire-300">
                  Términos de la tienda
                </Link>
                .
              </Text>
              <Button type="button" variant="ghost" onClick={clear} className="mt-2 w-full text-text-3 hover:text-danger">
                <Trash2 aria-hidden />
                Vaciar pedido
              </Button>
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
