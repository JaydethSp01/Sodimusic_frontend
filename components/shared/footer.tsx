import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Music2, QrCode, Youtube } from "lucide-react";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import type { SiteContent } from "@/types/site-content";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

type FooterSite = Pick<SiteContent, "brand" | "footer" | "social" | "nav" | "contact" | "qr"> &
  Partial<Pick<SiteContent, "shop">>;

/** Colores del QR a juego con el tema (hex sin `#`): texto principal sobre fondo base. */
const QR_SRC = "/api/qr?size=240&margin=1&fg=f0ede8&bg=080808";

export function Footer({ site }: { site: FooterSite }) {
  const whatsappUrl = `https://wa.me/${site.contact.whatsapp}`;
  const showQr = site.qr?.showInFooter === true;
  const social = [
    { href: site.social.youtube, label: "YouTube", Icon: Youtube },
    { href: site.social.instagram, label: "Instagram", Icon: Instagram },
    { href: site.social.facebook, label: "Facebook", Icon: Facebook },
    { href: site.social.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: site.social.spotify, label: "Spotify", Icon: Music2 },
    { href: whatsappUrl, label: "WhatsApp", Icon: WhatsAppIcon },
  ] as const;

  const shopEnabled = site.shop?.enabled === true;
  const hasShopLink = site.nav.links.some((l) => l.href === "/tienda" || l.href.startsWith("/tienda/"));
  const footerNav = [
    { href: "/", label: "Inicio" },
    ...site.nav.links,
    ...(shopEnabled && !hasShopLink ? [{ href: "/tienda", label: site.shop?.navLabel || "Tienda" }] : []),
    { href: site.nav.ctaHref, label: "Agendar" },
  ];

  const brandTitle = site.brand.siteNameLine ?? site.brand.logoText;

  return (
    <footer className="relative z-[2] border-t border-primary/10 bg-background-secondary" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="font-display text-2xl tracking-[0.2em] text-foreground">{brandTitle}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">{site.footer.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {social.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-[var(--text-secondary)] transition-colors hover:border-primary/40 hover:text-primary"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          <nav
            aria-label="Pie de página"
            className="grid grid-cols-2 gap-x-8 gap-y-2 border-t border-primary/10 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0"
          >
            {footerNav.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="nav-link-underline text-sm text-[var(--text-secondary)] transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {showQr ? (
            <div className="flex items-center gap-4 rounded-lg border border-border bg-background-card/70 p-4 md:max-w-[280px] md:flex-col md:items-start md:self-start">
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
          ) : null}
        </div>
        <p className="mt-12 border-t border-primary/10 pt-8 text-center text-xs text-[var(--text-muted)]">{site.footer.copyright}</p>
        {site.footer.subline ? (
          <p className="mt-2 text-center font-mono text-xs text-[var(--text-muted)]">{site.footer.subline}</p>
        ) : null}
      </div>
    </footer>
  );
}
