import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Facebook, Instagram, QrCode, Youtube } from "lucide-react";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { LEGAL_ROUTES } from "@/content/legal/routes";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-defaults";
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
const QR_SRC = "/api/qr?size=240&margin=1&fg=f0ede8&bg=080808";
const SIC_URL = "https://www.sic.gov.co";

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("57") && d.length === 12 ? `+57 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : d ? `+${d}` : "";
}

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

  const shopEnabled = site.shop?.enabled === true;
  const hasShopLink = site.nav.links.some((l) => l.href === "/tienda" || l.href.startsWith("/tienda/"));
  const footerNav = [
    { href: "/", label: "Inicio" },
    ...site.nav.links,
    ...(shopEnabled && !hasShopLink ? [{ href: "/tienda", label: site.shop?.navLabel || "Tienda" }] : []),
    { href: "/canales", label: "Canales" },
    { href: "/contacto", label: "Contacto y prensa" },
    { href: site.nav.ctaHref, label: "Agendar" },
  ];

  const brandTitle = site.brand.siteNameLine ?? site.brand.logoText;
  const location = [legal.address, legal.city, legal.country].filter((v) => v?.trim()).join(", ");
  const headingClass = "font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]";

  return (
    <footer className="relative z-[2] border-t border-primary/10 bg-background-secondary" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_0.85fr_1.25fr] lg:gap-12">
          {/* Marca */}
          <div className="min-w-0">
            <p className="font-display text-2xl tracking-[0.2em] text-foreground">{brandTitle}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">{site.footer.tagline}</p>
            <ul className="mt-6 flex flex-wrap gap-3" aria-label="Redes sociales">
              {social.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-[var(--text-secondary)] transition-colors hover:border-primary/40 hover:text-primary"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navegación */}
          <nav aria-labelledby="footer-nav-title">
            <p id="footer-nav-title" className={headingClass}>
              Explorar
            </p>
            <ul className="mt-4 space-y-2.5">
              {footerNav.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    className="nav-link-underline inline-block py-0.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-labelledby="footer-legal-title">
            <p id="footer-legal-title" className={headingClass}>
              Legal
            </p>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_ROUTES.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="nav-link-underline inline-block py-0.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-primary"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <a
                  href={SIC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 py-0.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-primary"
                >
                  Quejas y reclamos: SIC
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </li>
            </ul>
          </nav>

          {/* Boletín o QR */}
          <div className="min-w-0 md:col-span-2 lg:col-span-1">
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
                <p className={headingClass}>Contacto</p>
                <ul className="mt-4 space-y-2.5 text-sm text-[var(--text-secondary)]">
                  {legal.email ? (
                    <li>
                      <a href={`mailto:${legal.email}`} className="hover:text-primary">
                        {legal.email}
                      </a>
                    </li>
                  ) : null}
                  {whatsappPhone ? (
                    <li>
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
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
          <div className="mt-10">
            <QrBlock site={site} horizontal />
          </div>
        ) : null}

        {/* Bloque legal de identificación */}
        <section aria-label="Datos del comerciante" className="mt-12 border-t border-primary/10 pt-8">
          <dl className="grid gap-x-8 gap-y-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className={headingClass}>Comerciante</dt>
              <dd className="mt-1 text-[var(--text-secondary)]">
                {legal.businessName}
                {legal.legalName?.trim() ? <span className="block">{legal.legalName}</span> : null}
                {legal.nit?.trim() ? <span className="block">NIT {legal.nit}</span> : null}
              </dd>
            </div>
            {location ? (
              <div>
                <dt className={headingClass}>Dirección</dt>
                <dd className="mt-1 text-[var(--text-secondary)]">
                  {location}
                  {legal.hours?.trim() ? <span className="block">{legal.hours}</span> : null}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className={headingClass}>PQR y datos personales</dt>
              <dd className="mt-1 text-[var(--text-secondary)]">
                {legal.email?.trim() ? (
                  <a href={`mailto:${legal.email}`} className="break-all hover:text-primary">
                    {legal.email}
                  </a>
                ) : null}
                {whatsappPhone ? (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block hover:text-primary">
                    WhatsApp {formatPhone(whatsappPhone)}
                  </a>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className={headingClass}>Protección al consumidor</dt>
              <dd className="mt-1 text-[var(--text-secondary)]">
                Quejas y reclamos ante la{" "}
                <a href={SIC_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-primary">
                  Superintendencia de Industria y Comercio
                </a>
                .{legal.ivaIncluded ? " Precios en COP con IVA incluido." : " Precios en COP."}
              </dd>
            </div>
          </dl>
        </section>

        <div className="mt-8 border-t border-primary/10 pt-6 text-center">
          <p className="text-xs text-[var(--text-muted)]">{site.footer.copyright}</p>
          {site.footer.subline ? <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">{site.footer.subline}</p> : null}
        </div>
      </div>
    </footer>
  );
}

function QrBlock({ site, horizontal }: { site: FooterSite; horizontal?: boolean }) {
  return (
    <div
      className={
        horizontal
          ? "flex items-center gap-4 rounded-lg border border-border bg-background-card/70 p-4 sm:max-w-md"
          : "flex items-center gap-4 rounded-lg border border-border bg-background-card/70 p-4 md:max-w-[280px] md:flex-col md:items-start"
      }
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md border border-white/10 bg-background">
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
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          <QrCode className="h-4 w-4 shrink-0" aria-hidden />
          {site.qr.label}
        </p>
        {site.qr.footerCaption?.trim() ? (
          <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{site.qr.footerCaption}</p>
        ) : null}
        <a
          href="/api/qr?size=1024&download=1"
          className="mt-3 inline-flex min-h-11 items-center text-xs text-[var(--text-secondary)] underline-offset-4 hover:text-primary hover:underline"
          download
        >
          Descargar PNG
        </a>
      </div>
    </div>
  );
}
