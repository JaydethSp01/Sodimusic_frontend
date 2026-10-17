import type { SiteLegal } from "@/types/site-content";

/** Props comunes de todos los documentos legales. */
export type LegalDocProps = {
  legal: SiteLegal;
  /** URL pública del sitio, sin barra final */
  siteUrl: string;
  /** Con sesión admin se muestran los datos pendientes en ámbar; el público no ve la línea. */
  isAdmin?: boolean;
};

export const SIC_URL = "https://www.sic.gov.co";

export function hasValue(v: string | number | null | undefined): boolean {
  if (typeof v === "number") return Number.isFinite(v);
  return typeof v === "string" && v.trim().length > 0;
}

/** Formatea un teléfono E.164 sin "+" colombiano: 573215368590 → +57 321 536 8590 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("57") && digits.length === 12) {
    return `+57 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return digits ? `+${digits}` : "";
}

/** "2026-10-17" → "17 de octubre de 2026"; si no es fecha ISO devuelve el texto tal cual. */
export function formatVersionDate(version: string): string {
  const m = version.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return version;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

/** Nombre del responsable: razón social si existe; si no, el nombre comercial. */
export function responsibleName(legal: SiteLegal): string {
  return hasValue(legal.legalName) ? legal.legalName : legal.businessName;
}

export function fullAddress(legal: SiteLegal): string {
  return [legal.address, legal.city, legal.country].filter(hasValue).join(", ");
}

// Componentes con clases Tailwind: viven en app/(public)/legal (directorio escaneado por Tailwind).
export {
  Pending,
  V,
  Line,
  IdList,
  Toc,
  Section,
  Sub,
  DocFooter,
  LicenseTable,
  Ext,
  MailLink,
  WaLink,
} from "@/app/(public)/legal/legal-ui";
export type { TocItem, LicenseRow } from "@/app/(public)/legal/legal-ui";
