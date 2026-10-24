import type { SiteContent } from "@/types/site-content";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sodimusic-frontend.vercel.app").replace(/\/$/, "");
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Coordenadas de María La Baja, Bolívar (cabecera municipal). */
const GEO = { latitude: 9.9817, longitude: -75.3008 };

/** Una URL de red social cuenta solo si apunta a un perfil concreto (no a la raíz del servicio). */
export function isRealProfileUrl(url?: string | null): url is string {
  if (!url?.trim()) return false;
  try {
    const u = new URL(url);
    return u.pathname.replace(/\/+$/, "").length > 1;
  } catch {
    return false;
  }
}

function e164(phone?: string | null): string | undefined {
  const d = (phone ?? "").replace(/\D/g, "");
  return d ? `+${d}` : undefined;
}

/**
 * Entidad principal del sitio: el sello y estudio. Nombre, nombres alternativos, ubicación,
 * contacto y perfiles oficiales (`sameAs`) para que Google lo distinga de homónimos.
 */
export function organizationSchema(site: SiteContent) {
  const legal = site.legal;
  const sameAs = [site.social.youtube, site.social.instagram, site.social.facebook, site.social.tiktok, site.social.spotify].filter(isRealProfileUrl);
  const telephone = e164(legal?.phone || site.contact.whatsapp);
  const locality = (legal?.city || "María La Baja, Bolívar").split(",")[0]!.trim();
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": ORG_ID,
    name: "Sodimusic",
    alternateName: ["Sodimusic Company", "Sodi Music", "SODIMUSIC", site.brand.siteNameLine].filter(Boolean),
    ...(legal?.legalName?.trim() ? { legalName: legal.legalName } : {}),
    ...(legal?.nit?.trim() ? { taxID: legal.nit } : {}),
    description:
      "Sello discográfico y estudio de grabación de música urbana caribeña fundado en 2016 en María La Baja, Bolívar (Colombia): champeta, reggaeton, trap, afrobeat y dancehall. Producción de beats, grabación, mezcla, masterización y video.",
    url: SITE_URL,
    logo: `${SITE_URL}/logosodi.jpeg`,
    image: `${SITE_URL}/logosodi.jpeg`,
    foundingDate: "2016",
    slogan: site.hero.tagline,
    address: {
      "@type": "PostalAddress",
      ...(legal?.address?.trim() ? { streetAddress: legal.address } : {}),
      addressLocality: locality,
      addressRegion: "Bolívar",
      addressCountry: "CO",
    },
    geo: { "@type": "GeoCoordinates", ...GEO },
    areaServed: [{ "@type": "Country", name: "Colombia" }],
    knowsAbout: ["Champeta", "Reggaeton", "Trap", "Afrobeat", "Dancehall", "Producción musical", "Grabación de voces", "Mezcla y masterización"],
    ...(telephone ? { telephone } : {}),
    ...(legal?.email || site.contact.email ? { email: legal?.email || site.contact.email } : {}),
    ...(legal?.hours?.trim() ? { openingHours: legal.hours } : {}),
    priceRange: "$$",
    ...(sameAs.length ? { sameAs } : {}),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        areaServed: "CO",
        availableLanguage: ["es"],
        ...(telephone ? { telephone } : {}),
        url: `${SITE_URL}/contacto`,
      },
    ],
    potentialAction: { "@type": "ReserveAction", name: "Agendar sesión de estudio", target: `${SITE_URL}${site.nav.ctaHref || "/booking"}` },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "Sodimusic",
    alternateName: ["Sodimusic Company", "Sodi Music"],
    inLanguage: "es-CO",
    publisher: { "@id": ORG_ID },
  };
}

/** Migas de pan para páginas internas: Inicio › Sección (› Detalle). */
export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  const all = [{ name: "Inicio", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path === "/" ? "" : it.path}` })),
  };
}

/** Servicios del estudio como catálogo de ofertas (página de agenda). */
export function servicesSchema(site: SiteContent) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Estudio de grabación y producción musical",
    name: "Sesiones de estudio Sodimusic",
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "Colombia" },
    url: `${SITE_URL}${site.nav.ctaHref || "/booking"}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios",
      itemListElement: site.booking.services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.desc },
        ...(typeof (s as { priceFromCOP?: number }).priceFromCOP === "number"
          ? { priceSpecification: { "@type": "PriceSpecification", priceCurrency: "COP", minPrice: (s as { priceFromCOP?: number }).priceFromCOP } }
          : {}),
      })),
    },
  };
}
