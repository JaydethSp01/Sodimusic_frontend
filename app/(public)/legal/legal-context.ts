import { auth } from "@/lib/auth";
import { getSiteContent } from "@/lib/site-config-server";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-defaults";
import type { SiteLegal } from "@/types/site-content";

export type LegalContext = { legal: SiteLegal; siteUrl: string; isAdmin: boolean };

/**
 * Datos comunes de las páginas legales: sección `legal` (con defaults por si el backend aún no la envía),
 * URL pública y si hay sesión admin (misma detección que el banner de vista previa).
 */
export async function getLegalContext(): Promise<LegalContext> {
  const [site, session] = await Promise.all([getSiteContent(), auth()]);
  const legal: SiteLegal = { ...SITE_CONTENT_DEFAULTS.legal, ...(site.legal ?? {}) };
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return { legal, siteUrl, isAdmin: !!session };
}
