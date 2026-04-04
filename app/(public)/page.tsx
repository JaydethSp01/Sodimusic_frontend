import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";
import Link from "next/link";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { GenresGrid } from "@/components/landing/genres-grid";
import { HomeStoryTimeline } from "@/components/landing/home-story-timeline";
import { HomeServicesSection } from "@/components/landing/home-services-section";
import { SectionTitle } from "@/components/shared/section-title";
import { ProductionCard } from "@/features/productions/components/production-card";
import { Button } from "@/components/ui/button";
import { fetchPublic } from "@/lib/api";
import { getSiteContent } from "@/lib/site-config-server";
import type { Production } from "@/types/models";
import { Facebook, Instagram, Music2, Youtube } from "lucide-react";

/** Foto fija en /public; sustituye el Unsplash antiguo guardado en el CMS. */
const ABOUT_ASIDE_IMAGE = "/maria_la_bajafoto.jpg";
const LEGACY_ABOUT_UNSPLASH_ID = "photo-1507525428034-b723cf961d3e";

function resolveAboutAsideImageUrl(configured: string): string {
  const u = configured?.trim() ?? "";
  if (!u) return ABOUT_ASIDE_IMAGE;
  if (u.includes(LEGACY_ABOUT_UNSPLASH_ID)) return ABOUT_ASIDE_IMAGE;
  return u;
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: site.seo.homeTitle,
    description: site.seo.homeDescription,
  };
}

async function getFeaturedProductions(): Promise<Production[]> {
  const res = await fetchPublic("/api/productions?featured=1&pageSize=3", { next: { revalidate: 60 } });
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as { items: Production[] };
  return data.items;
}

export default async function HomePage() {
  const site = await getSiteContent();
  const featured = await getFeaturedProductions();

  const whatsappUrl = `https://wa.me/${site.contact.whatsapp}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: site.brand.siteNameLine ?? site.brand.logoText,
    foundingDate: "2016",
    foundingLocation: {
      "@type": "Place",
      name: "María La Baja, Bolívar, Colombia",
    },
    genre: ["Trap", "Reggaeton", "Afrobeat", "Dancehall"],
    url: "https://sodimusic.com",
    sameAs: [site.social.facebook, site.social.youtube],
  };

  return (
    <>
      <Script id="ld-music-group" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>

      <HeroSection hero={site.hero} />

      <section className="border-b border-border px-4 py-20 lg:px-8" aria-labelledby="about-title">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[3fr_2fr] lg:items-center">
          <div>
            <SectionTitle eyebrow={site.home.aboutEyebrow} title={site.home.aboutTitle} />
            <h2 id="about-title" className="sr-only">
              Quiénes somos
            </h2>
            <p className="max-w-prose border-l-2 border-primary pl-6 text-lg leading-[1.75] text-[var(--text-secondary)]">
              {site.home.aboutBody}
            </p>
            <StatsSection />
          </div>
          <figure className="relative min-h-[280px] overflow-hidden rounded-lg border border-border bg-background-card">
            <Image
              src={resolveAboutAsideImageUrl(site.home.aboutImageUrl)}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 38vw"
              priority={false}
            />
            <div className="hero-gradient pointer-events-none absolute inset-0 opacity-35" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <figcaption className="absolute bottom-6 left-6 right-6 font-mono text-xs text-[var(--text-muted)]">
              {site.home.aboutAsideCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="px-4 py-20 lg:px-8" aria-labelledby="genres-title">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow={site.home.genresEyebrow} title={site.home.genresTitle} id="genres-title" />
          <GenresGrid />
        </div>
      </section>

      <section className="border-t border-border px-4 py-20 lg:px-8" aria-labelledby="historia-title">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow={site.home.storyEyebrow} title={site.home.storyTitle} />
          <h2 id="historia-title" className="sr-only">
            Historia de Sodimusic
          </h2>
          <HomeStoryTimeline milestones={site.home.milestones} />
        </div>
      </section>

      <section className="border-t border-border bg-background-secondary px-4 py-20 lg:px-8" aria-labelledby="feat-title">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow={site.home.portfolioEyebrow} title={site.home.portfolioTitle} />
          <h2 id="feat-title" className="sr-only">
            Producciones destacadas
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductionCard key={p.id} production={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link href="/productions">{site.home.portfolioCta}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 lg:px-8" aria-labelledby="services-title">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            title={site.home.servicesTitle}
            subtitle={site.home.servicesSubtitle}
            eyebrow={site.home.servicesEyebrow || undefined}
          />
          <h2 id="services-title" className="sr-only">
            Servicios
          </h2>
          <HomeServicesSection />
        </div>
      </section>

      <section className="border-t border-border bg-background-secondary px-4 py-20 lg:px-8" aria-labelledby="contact-title">
        <div className="mx-auto max-w-7xl text-center">
          <h2 id="contact-title" className="font-display text-4xl text-foreground">
            {site.home.contactTitle}
          </h2>
          <p className="mt-2 text-[var(--text-secondary)]">{site.home.contactSubtitle}</p>
          <p className="mt-4">
            <a href={`mailto:${site.contact.email}`} className="text-primary hover:underline">
              {site.contact.email}
            </a>
          </p>
          <div className="mt-10 grid grid-cols-3 justify-center gap-4 sm:flex sm:flex-wrap sm:gap-6">
            <a
              href={site.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-foreground transition-all hover:-translate-y-px hover:border-primary hover:text-primary"
              aria-label="YouTube de Sodimusic"
            >
              <Youtube className="h-8 w-8" />
            </a>
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-border transition-all hover:-translate-y-px hover:border-primary hover:text-primary"
              aria-label="Instagram"
            >
              <Instagram className="h-8 w-8" />
            </a>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-border transition-all hover:-translate-y-px hover:border-primary hover:text-primary"
              aria-label="Facebook"
            >
              <Facebook className="h-8 w-8" />
            </a>
            <a
              href={site.social.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-border transition-all hover:-translate-y-px hover:border-primary hover:text-primary"
              aria-label="Spotify"
            >
              <Music2 className="h-8 w-8" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-3 flex h-14 min-w-[120px] items-center justify-center rounded-full border border-[#25D366]/50 bg-[#25D366]/10 px-4 text-sm font-medium text-[#25D366] transition hover:-translate-y-px hover:bg-[#25D366]/20 sm:col-auto"
              aria-label="WhatsApp Sodimusic"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
