"use client";

import Image from "next/image";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { cartLineKey, selectCount, selectSubtotal, useCartHydrated, useCartStore } from "@/features/shop/stores/cart-store";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp-order";
import { formatCOP } from "@/lib/format-cop";
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
}

export function CartDrawer({ whatsappPhone, whatsappIntro, orderCtaLabel, shippingNote, siteUrl, shopLabel }: CartDrawerProps) {
  const hydrated = useCartHydrated();
  const open = useCartStore((s) => s.open);
  const setOpen = useCartStore((s) => s.setOpen);
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  const count = selectCount({ items });
  const subtotal = selectSubtotal({ items });
  const waUrl = buildWhatsAppOrderUrl({
    phone: whatsappPhone,
    intro: whatsappIntro,
    items: items.map((x) => ({ name: x.name, qty: x.qty, priceCOP: x.priceCOP, size: x.size, slug: x.slug })),
    subtotal,
    siteUrl,
  });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 right-0 z-[201] flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl",
            "duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          )}
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <DialogPrimitive.Title className="flex items-center gap-2 font-display text-2xl tracking-wide text-foreground">
              <ShoppingBag className="h-5 w-5 text-primary" aria-hidden />
              Tu pedido
              {hydrated && count > 0 ? (
                <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-xs text-primary">{count}</span>
              ) : null}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label="Cerrar pedido"
            >
              <X className="h-5 w-5" aria-hidden />
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            {!hydrated || items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-border text-[var(--text-muted)]">
                  <ShoppingBag className="h-7 w-7" aria-hidden />
                </span>
                <p className="text-[var(--text-secondary)]">Tu pedido está vacío.</p>
                <Button asChild variant="outline" onClick={() => setOpen(false)}>
                  <Link href="/tienda">{shopLabel}</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((it) => (
                  <li key={cartLineKey(it.productId, it.size)} className="flex gap-3 py-4">
                    <Link
                      href={`/tienda/${it.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-background-card"
                      aria-label={it.name}
                    >
                      {it.image ? (
                        <Image src={resolveMediaUrl(it.image)} alt="" fill className="object-cover" sizes="80px" />
                      ) : (
                        <PlaceholderCover seed={it.name} className="h-full w-full" />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/tienda/${it.slug}`}
                            onClick={() => setOpen(false)}
                            className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary"
                          >
                            {it.name}
                          </Link>
                          {it.size ? (
                            <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">Talla {it.size}</p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(it.productId, it.size)}
                          className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:text-red-400"
                          aria-label={`Quitar ${it.name}${it.size ? ` talla ${it.size}` : ""}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-md border border-border">
                          <button
                            type="button"
                            onClick={() => setQty(it.productId, it.size, it.qty - 1)}
                            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-primary"
                            aria-label={`Reducir cantidad de ${it.name}`}
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <span className="w-9 text-center font-mono text-sm tabular-nums" aria-live="polite">
                            {it.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(it.productId, it.size, it.qty + 1)}
                            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-primary"
                            aria-label={`Aumentar cantidad de ${it.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                        <p className="font-mono text-sm text-primary">{formatCOP(it.priceCOP * it.qty)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {hydrated && items.length > 0 ? (
            <div
              className="border-t border-border bg-background-secondary px-5 pt-4"
              style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Subtotal</span>
                <span className="font-display text-3xl text-foreground">{formatCOP(subtotal)}</span>
              </div>
              {shippingNote?.trim() ? (
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">{shippingNote}</p>
              ) : null}
              <Button
                asChild
                size="lg"
                className="mt-4 h-12 w-full bg-[#25D366] text-black hover:bg-[#2ee07a] hover:shadow-[0_8px_24px_rgba(37,211,102,0.3)]"
              >
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="!size-5" />
                  {orderCtaLabel}
                </a>
              </Button>
              <button
                type="button"
                onClick={clear}
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Vaciar pedido
              </button>
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
