import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
import Link from "next/link";
import { ArrowRight, Facebook, Instagram, Mail, Youtube } from "lucide-react";
import { HeroSection } from "@/components/landing/hero-section";
import { HomeFadeSection, HomeFigureMotion, HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { StatsSection } from "@/components/landing/stats-section";
import { GenresGrid } from "@/components/landing/genres-grid";
import { HomeStoryTimeline } from "@/components/landing/home-story-timeline";
import { HomeServicesSection } from "@/components/landing/home-services-section";
import { HomeShopSection, stripTrailingArrow } from "@/components/landing/home-shop-section";
import { HomeChannelsSection } from "@/features/channels/components/home-channels-section";
import { SectionTitle } from "@/components/shared/section-title";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { ProductionCard, SpotifyIcon } from "@/features/productions/components/production-card";
import { Button } from "@/components/ui/button";
import { fetchPublic } from "@/lib/api";
import { fetchProducts } from "@/features/shop/api";
import { getSiteContent } from "@/lib/site-config-server";
import type { Production } from "@/types/models";

/** Foto fija en /public; sustituye el Unsplash antiguo guardado en el CMS. */
const ABOUT_ASIDE_IMAGE = "/maria_la_bajafoto.jpg";
const LEGACY_ABOUT_UNSPLASH_ID = "photo-1507525428034-b723cf961d3e";
const ABOUT_ASIDE_ALT =
  "Iglesia colonial de María La Baja, Bolívar, bajo el cielo de los Montes de María, cuna de Sodimusic";

function resolveAboutAsideImageUrl(configured: string): string {
  const u = configured?.trim() ?? "";
  if (!u) return ABOUT_ASIDE_IMAGE;
  if (u.includes(LEGACY_ABOUT_UNSPLASH_ID)) return ABOUT_ASIDE_IMAGE;
  return u;
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sodimusic.com").replace(/\/$/, "");
  return {
    title: site.seo.homeTitle,
    description: site.seo.homeDescription,
    alternates: { canonical: base },
    openGraph: {
      type: "website",
      locale: "es_CO",
      url: base,
      siteName: site.brand.logoText ?? "Sodimusic",
      title: site.seo.homeTitle,
      description: site.seo.homeDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: site.seo.homeTitle,
      description: site.seo.homeDescription,
    },
  };
}

async function getFeaturedProductions(): Promise<Production[]> {
  try {
    const res = await fetchPublic("/api/productions?featured=1&pageSize=3", { next: { revalidate: 60 } });
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as { items: Production[] };
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

const socialBtn =
  "flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-all hover:-translate-y-px hover:border-primary hover:text-primary";

export default async function HomePage() {
  const site = await getSiteContent();
  const showShop = site.shop.enabled && site.shop.showOnHome;
  const showYoutube = site.youtube.showOnHome;
  const [featured, featuredProducts] = await Promise.all([
    getFeaturedProductions(),
    showShop ? fetchProducts({ featured: true, pageSize: 4 }).then((r) => r.items) : Promise.resolve([]),
  ]);

  const whatsappUrl = `https://wa.me/${site.contact.whatsapp}`;
  const portfolioCta = stripTrailingArrow(site.home.portfolioCta) || "Ver todas las producciones";
  const socials = [
    { href: site.social.youtube, label: "YouTube de Sodimusic", Icon: Youtube },
    { href: site.social.instagram, label: "Instagram de Sodimusic", Icon: Instagram },
    { href: site.social.facebook, label: "Facebook de Sodimusic", Icon: Facebook },
    { href: site.social.spotify, label: "Spotify de Sodimusic", Icon: SpotifyIcon },
  ].filter((s) => s.href?.trim());

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: site.brand.siteNameLine ?? site.brand.logoText,
    foundingDate: "2016",
    foundingLocation: {
      "@type": "Place",
      name: "María La Baja, Bolívar, Colombia",
    },
    genre: ["Champeta", "Trap", "Reggaeton", "Afrobeat", "Dancehall"],
    url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sodimusic.com").replace(/\/$/, ""),
    sameAs: [site.social.facebook, site.social.youtube, site.social.instagram, site.social.tiktok].filter(Boolean),
  };

  return (
    <>
      <Script id="ld-music-group" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>

      <HeroSection hero={site.hero} />

      {/* Quiénes somos */}
      <HomeFadeSection className="px-4 pb-16 pt-8 sm:pb-20 lg:px-8 lg:pb-32 lg:pt-16" aria-labelledby="about-title">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-16">
          <div>
            <SectionTitle eyebrow={site.home.aboutEyebrow} title={site.home.aboutTitle} id="about-title" />
            <p className="max-w-prose border-l-2 border-primary pl-6 text-lg leading-[1.75] text-[var(--text-secondary)]">
              {site.home.aboutBody}
            </p>
            <StatsSection stats={site.home.stats} />
          </div>
          <HomeFigureMotion className="relative min-h-[320px] overflow-hidden rounded-lg border border-border bg-background-card lg:min-h-[460px]">
            <Image
              src={resolveAboutAsideImageUrl(site.home.aboutImageUrl)}
              alt={ABOUT_ASIDE_ALT}
              fill
              quality={70}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 38vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0)_45%,rgba(8,8,8,0.85)_100%)]" />
            <figcaption className="absolute bottom-5 left-5 right-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              <span className="h-px w-6 bg-[var(--gold)]" aria-hidden />
              {site.home.aboutAsideCaption}
            </figcaption>
          </HomeFigureMotion>
        </div>
      </HomeFadeSection>

      {/* Géneros */}
      <HomeFadeSection className="relative px-4 py-16 sm:py-20 lg:px-8 lg:py-32" aria-labelledby="genres-title">
        <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow={site.home.genresEyebrow} title={site.home.genresTitle} id="genres-title" />
          <GenresGrid />
        </div>
      </HomeFadeSection>

      {/* Historia */}
      <HomeFadeSection className="relative px-4 py-16 sm:py-20 lg:px-8 lg:py-32" aria-labelledby="historia-title">
        <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow={site.home.storyEyebrow} title={site.home.storyTitle} id="historia-title" />
          <HomeStoryTimeline milestones={site.home.milestones} />
        </div>
      </HomeFadeSection>

      {/* Producciones destacadas */}
      <HomeFadeSection className="relative bg-background-secondary/60 px-4 py-16 sm:py-20 lg:px-8 lg:py-32" aria-labelledby="feat-title">
        <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionTitle eyebrow={site.home.portfolioEyebrow} title={site.home.portfolioTitle} id="feat-title" />
            <Button asChild variant="outline" className="mb-12 hidden h-11 md:inline-flex">
              <Link href="/productions">
                {portfolioCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
          {featured.length ? (
            <HomeStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <HomeStaggerItem key={p.id} className="h-full">
                  <ProductionCard production={p} />
                </HomeStaggerItem>
              ))}
            </HomeStagger>
          ) : (
            <p className="rounded-lg border border-dashed border-border px-6 py-12 text-center text-[var(--text-secondary)]">
              Pronto verás aquí las producciones destacadas.
            </p>
          )}
          <div className="mt-10 text-center md:hidden">
            <Button asChild variant="outline" className="h-11">
              <Link href="/productions">
                {portfolioCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </HomeFadeSection>

      {showYoutube ? (
        <HomeChannelsSection youtube={site.youtube} className="border-t border-border" />
      ) : null}

      {showShop ? <HomeShopSection shop={site.shop} products={featuredProducts} /> : null}

      {/* Servicios */}
      <HomeFadeSection className="relative px-4 py-16 sm:py-20 lg:px-8 lg:py-32" aria-labelledby="services-title">
        <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            title={site.home.servicesTitle}
            subtitle={site.home.servicesSubtitle}
            eyebrow={site.home.servicesEyebrow || undefined}
            id="services-title"
          />
          <HomeServicesSection services={site.booking.services} ctaHref={site.nav.ctaHref} />
        </div>
      </HomeFadeSection>

      {/* Contacto: resumen con CTA a /contacto y WhatsApp */}
      <HomeFadeSection className="relative overflow-hidden px-4 py-16 sm:py-20 lg:px-8 lg:py-32" aria-labelledby="contact-title">
        <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(255,107,0,0.14),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <SectionTitle
            eyebrow="Contacto"
            title={site.home.contactTitle}
            subtitle={site.home.contactSubtitle}
            id="contact-title"
            align="center"
            className="mb-8"
          />
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild className="h-12 w-full px-8 text-base font-semibold sm:w-auto">
              <Link href="/contacto">
                <Mail className="h-4 w-4" aria-hidden />
                Escríbenos
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 w-full border-[rgba(37,211,102,0.5)] px-8 text-base text-whatsapp hover:border-whatsapp hover:bg-[rgba(37,211,102,0.12)] hover:text-whatsapp sm:w-auto"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp a Sodimusic">
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-[var(--text-muted)]">
            O escribe a{" "}
            <a href={`mailto:${site.contact.email}`} className="text-[var(--text-secondary)] underline-offset-4 hover:text-primary hover:underline">
              {site.contact.email}
            </a>
          </p>
          {socials.length ? (
            <HomeStagger className="mt-10 flex flex-wrap justify-center gap-3">
              {socials.map(({ href, label, Icon }) => (
                <HomeStaggerItem key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={socialBtn} aria-label={label}>
                    <Icon className="h-5 w-5" />
                  </a>
                </HomeStaggerItem>
              ))}
            </HomeStagger>
          ) : null}
        </div>
      </HomeFadeSection>
    </>
  );
}
