import { formatCOP } from "@/lib/format-cop";

export interface WhatsAppOrderItem {
  name: string;
  qty: number;
  priceCOP: number;
  size?: string;
  slug?: string;
}

export interface WhatsAppOrderInput {
  /** Número en formato internacional sin `+` (p. ej. 573215368590); se limpian otros caracteres */
  phone: string;
  intro: string;
  items: WhatsAppOrderItem[];
  subtotal: number;
  /** Base pública del sitio para enlazar productos (sin barra final) */
  siteUrl?: string;
  /** Añade la línea "IVA incluido" tras el total (legal.ivaIncluded) */
  ivaIncluded?: boolean;
}

export const SHOP_TERMS_PATH = "/legal/terminos-tienda";

/**
 * Mensaje de pedido para WhatsApp: producto, talla, cantidad, subtotal, total,
 * "IVA incluido", "Envío: por cotizar" y enlace a los Términos de la tienda.
 */
export function buildWhatsAppOrderMessage({
  intro,
  items,
  subtotal,
  siteUrl,
  ivaIncluded,
}: Omit<WhatsAppOrderInput, "phone">): string {
  const base = (siteUrl ?? "").replace(/\/$/, "");
  const lines: string[] = [];
  if (intro.trim()) {
    lines.push(intro.trim(), "");
  }
  for (const it of items) {
    lines.push(`• ${it.name}`);
    if (it.size) {
      lines.push(`  Talla: ${it.size}`);
    }
    lines.push(`  Cantidad: ${it.qty} × ${formatCOP(it.priceCOP)} = ${formatCOP(it.priceCOP * it.qty)}`);
    if (base && it.slug) {
      lines.push(`  ${base}/tienda/${it.slug}`);
    }
  }
  lines.push("", `Subtotal: ${formatCOP(subtotal)}`, "Envío: por cotizar", `Total: ${formatCOP(subtotal)} + envío`);
  if (ivaIncluded) {
    lines.push("IVA incluido");
  }
  lines.push("", `Al enviar acepto los Términos de la tienda: ${base}${SHOP_TERMS_PATH}`);
  if (base) {
    lines.push(`Pedido desde ${base}/tienda`);
  }
  return lines.join("\n");
}

export function buildWhatsAppOrderUrl(input: WhatsAppOrderInput): string {
  const phone = input.phone.replace(/\D/g, "");
  const text = buildWhatsAppOrderMessage(input);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
