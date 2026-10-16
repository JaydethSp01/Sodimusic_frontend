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
}

export function buildWhatsAppOrderMessage({ intro, items, subtotal, siteUrl }: Omit<WhatsAppOrderInput, "phone">): string {
  const base = (siteUrl ?? "").replace(/\/$/, "");
  const lines: string[] = [];
  if (intro.trim()) {
    lines.push(intro.trim(), "");
  }
  for (const it of items) {
    const size = it.size ? ` (${it.size})` : "";
    lines.push(`• ${it.qty} × ${it.name}${size} — ${formatCOP(it.priceCOP * it.qty)}`);
    if (base && it.slug) {
      lines.push(`  ${base}/tienda/${it.slug}`);
    }
  }
  lines.push("", `Subtotal: ${formatCOP(subtotal)}`);
  if (base) {
    lines.push("", `Pedido desde ${base}/tienda`);
  }
  return lines.join("\n");
}

export function buildWhatsAppOrderUrl(input: WhatsAppOrderInput): string {
  const phone = input.phone.replace(/\D/g, "");
  const text = buildWhatsAppOrderMessage(input);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
