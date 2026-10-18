import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ExternalLink, Facebook, Instagram, QrCode, Youtube } from "lucide-react";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { LEGAL_ROUTES } from "@/content/legal/routes";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-defaults";
import { cn } from "@/lib/utils";
import type { SiteContent, SiteLegal } from "@/types/site-content";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.504 17.307a.75.75 0 0 1-1.031.249c-2.825-1.727-6.381-2.118-10.57-1.161a.75.75 0 1 1-.334-1.462c4.584-1.047 8.516-.596 11.686 1.342a.75.75 0 0 1 .249 1.032zm1.469-3.268a.937.937 0 0 1-1.289.309c-3.234-1.988-8.164-2.564-11.99-1.403a.938.938 0 1 1-.545-1.794c4.371-1.327 9.805-.684 13.515 1.597a.937.937 0 0 1 .309 1.291zm.126-3.403C15.23 8.332 8.83 8.12 5.127 9.244a1.125 1.125 0 1 1-.653-2.153c4.25-1.29 11.315-1.041 15.78 1.61a1.125 1.125 0 0 1-1.155 1.935z" />
    </svg>
  );
}

type FooterSite = Pick<SiteContent, "brand" | "footer" | "social" | "nav" | "contact" | "qr"> &
  Partial<Pick<SiteContent, "shop" | "legal">>;

/** Colores del QR a juego con el tema (hex sin `#`): texto principal sobre fondo base. */
const QR_SRC = "/api/qr?size=240&margin=1&fg=f3efe8&bg=050404";
const SIC_URL = "https://www.sic.gov.co";

/** Fondo del pie: lo define el CMS vía `--footer-bg`; por defecto un carbón neutro algo frío, distinto del negro de la página. */
const FOOTER_BG = "var(--footer-bg, #0e100f)";

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("57") && d.length === 12 ? `+57 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : d ? `+${d}` : "";
}

/** Enlace de las filas de navegación: 44 px táctiles en móvil, compacto desde sm. */
const rowLinkClass =
  "flex min-h-11 items-center text-body-sm text-text-2 transition-colors duration-150 hover:text-fire-400 sm:inline-flex sm:min-h-0 sm:py-1";
/** Separador «·» entre elementos de una fila (solo desde sm, donde la fila es horizontal). */
const dotBeforeClass = "sm:before:mr-2 sm:before:text-text-3 sm:before:content-['·']";

export function Footer({ site }: { site: FooterSite }) {
  const legal: SiteLegal = { ...SITE_CONTENT_DEFAULTS.legal, ...(site.legal ?? {}) };
  const whatsappPhone = legal.phone || site.contact.whatsapp;
  const whatsappUrl = `https://wa.me/${whatsappPhone}`;
  const showQr = site.qr?.showInFooter === true;
  const showNewsletter = legal.showNewsletter === true;
  const social = [
    { href: site.social.youtube, label: "YouTube", Icon: Youtube },
    { href: site.social.instagram, label: "Instagram", Icon: Instagram },
    { href: site.social.facebook, label: "Facebook", Icon: Facebook },
    { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: site.social.spotify, label: "Spotify", Icon: SpotifyIcon },
    { href: whatsappUrl, label: "WhatsApp", Icon: WhatsAppIcon },
  ] as const;

  // Navegación compacta: solo las 6 rutas principales (etiquetas del CMS cuando existen).
  const navLabel = new Map(site.nav.links.map((l) => [l.href, l.label]));
  const shopVisible = site.shop?.enabled === true || navLabel.has("/tienda");
  const footerNav = [
    { href: "/productions", label: navLabel.get("/productions") || "Producciones" },
    { href: "/beats", label: navLabel.get("/beats") || "Beats" },
    { href: "/artists", label: navLabel.get("/artists") || "Artistas" },
    ...(shopVisible ? [{ href: "/tienda", label: navLabel.get("/tienda") || site.shop?.navLabel || "Tienda" }] : []),
    { href: "/novedades", label: "Novedades" },
    { href: "/contacto", label: "Contacto" },
  ];

  const brandTitle = site.brand.siteNameLine ?? site.brand.logoText;
  const location = [legal.address, legal.city, legal.country].filter((v) => v?.trim()).join(", ");

  // Datos del comerciante (Ley 1480) en texto corrido: cada par dt/dd va inline, separado por «·».
  const merchant: Array<{ key: string; term: string; detail: ReactNode }> = [
    {
      key: "comerciante",
      term: "Comerciante",
      detail: (
        <>
          {legal.businessName}
          {legal.legalName?.trim() ? ` · ${legal.legalName}` : null}
          {legal.nit?.trim() ? ` · NIT ${legal.nit}` : null}
        </>
      ),
    },
    ...(location ? [{ key: "direccion", term: "Dirección", detail: location }] : []),
    ...(legal.hours?.trim() ? [{ key: "horario", term: "Horario", detail: legal.hours }] : []),
    {
      key: "pqr",
      term: "PQR y datos personales",
      detail: (
        <>
          {legal.email?.trim() ? (
            <a href={`mailto:${legal.email}`} className="break-all underline-offset-4 hover:text-fire-400 hover:underline">
              {legal.email}
            </a>
          ) : null}
          {legal.email?.trim() && whatsappPhone ? " · " : null}
          {whatsappPhone ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-fire-400 hover:underline">
              WhatsApp {formatPhone(whatsappPhone)}
            </a>
          ) : null}
        </>
      ),
    },
    {
      key: "consumidor",
      term: "Protección al consumidor",
      detail: (
        <>
          quejas y reclamos ante la{" "}
          <a href={SIC_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-fire-400">
            Superintendencia de Industria y Comercio
          </a>
          .{legal.ivaIncluded ? " Precios en COP con IVA incluido." : " Precios en COP."}
        </>
      ),
    },
  ];

  return (
    <footer className="relative z-[2] overflow-hidden border-t border-line-2" style={{ background: FOOTER_BG }} role="contentinfo">
      <div className="container-page pb-8 pt-10 lg:pt-12">
        {/* 1. Marca + boletín */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-7">
            <p className="font-display text-xl font-black uppercase tracking-wordmark text-text-1 [font-stretch:125%]">{brandTitle}</p>
            <p className="mt-2 max-w-md text-body-sm text-text-2">{site.footer.tagline}</p>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Redes sociales">
              {social.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line-2 text-text-2 transition-colors duration-150 hover:border-fire-500 hover:text-fire-300"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 lg:col-span-5">
            {showNewsletter ? (
              <NewsletterForm
                businessName={legal.businessName}
                policyVersion={legal.policyVersion}
                title={legal.newsletterTitle}
                subtitle={legal.newsletterSubtitle}
                ctaLabel={legal.newsletterCtaLabel}
              />
            ) : showQr ? (
              <QrBlock site={site} />
            ) : (
              <div>
                <p className="text-label text-text-3">Contacto</p>
                <ul className="mt-3 space-y-1 font-mono text-body-sm text-text-2">
                  {legal.email ? (
                    <li>
                      <a href={`mailto:${legal.email}`} className="inline-flex min-h-11 items-center hover:text-fire-400 sm:min-h-0">
                        {legal.email}
                      </a>
                    </li>
                  ) : null}
                  {whatsappPhone ? (
                    <li>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center hover:text-fire-400 sm:min-h-0"
                      >
                        WhatsApp {formatPhone(whatsappPhone)}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            )}
          </div>
        </div>

        {showNewsletter && showQr ? (
          <div className="mt-6">
            <QrBlock site={site} />
          </div>
        ) : null}

        {/* 2. Navegación compacta: una fila principal y otra legal */}
        <nav aria-labelledby="footer-nav-title" className="mt-8 border-t border-line-1 pt-4">
          <p id="footer-nav-title" className="sr-only">
            Explorar
          </p>
          <ul className="grid grid-cols-2 gap-x-6 sm:flex sm:flex-wrap sm:gap-x-7">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={cn(rowLinkClass, "font-medium")}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="footer-legal-title" className="mt-2 sm:mt-1">
          <p id="footer-legal-title" className="sr-only">
            Legal
          </p>
          <ul className="grid grid-cols-2 gap-x-6 sm:flex sm:flex-wrap sm:items-center">
            {LEGAL_ROUTES.map((r, i) => (
              <li key={r.href} className={cn(i > 0 && dotBeforeClass)}>
                <Link href={r.href} className={cn(rowLinkClass, "text-xs text-text-3 hover:text-text-1")}>
                  {r.label}
                </Link>
              </li>
            ))}
            <li className={dotBeforeClass}>
              <a
                href={SIC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(rowLinkClass, "gap-1 text-xs text-text-3 hover:text-text-1")}
              >
                Quejas y reclamos: SIC
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            </li>
          </ul>
        </nav>

        {/* 3. Datos del comerciante (Ley 1480) + copyright */}
        <section aria-label="Datos del comerciante" className="mt-6 border-t border-line-1 pt-5">
          <dl className="text-body-sm leading-relaxed text-text-2">
            {merchant.map((m, i) => (
              <div
                key={m.key}
                className={cn("inline", i > 0 && "before:mx-2 before:text-text-3 before:content-['·']")}
              >
                <dt className="inline font-mono text-xs text-text-3 after:content-[':']">{m.term}</dt>{" "}
                <dd className="inline">{m.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-4 flex flex-col gap-1 font-mono text-xs text-text-3 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-6">
          <p>{site.footer.copyright}</p>
          {site.footer.subline ? <p>{site.footer.subline}</p> : null}
        </div>
      </div>
    </footer>
  );
}

/** Fila opcional compacta con el QR del sitio (si `qr.showInFooter`). */
function QrBlock({ site }: { site: FooterSite }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-line-1 bg-ink-2 p-3 sm:max-w-md">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-line-2 bg-ink-0">
        <Image
          src={QR_SRC}
          alt={`Código QR: ${site.qr.label}`}
          width={240}
          height={240}
          unoptimized
          loading="lazy"
          className="h-full w-full"
        />
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-label text-fire-500">
          <QrCode className="h-4 w-4 shrink-0" aria-hidden />
          {site.qr.label}
        </p>
        {site.qr.footerCaption?.trim() ? <p className="mt-1 text-body-sm text-text-3">{site.qr.footerCaption}</p> : null}
        <a
          href="/api/qr?size=1024&download=1"
          className="mt-1 inline-flex min-h-11 items-center text-body-sm text-text-2 underline-offset-4 hover:text-fire-400 hover:underline"
          download
        >
          Descargar PNG
        </a>
      </div>
    </div>
  );
}
