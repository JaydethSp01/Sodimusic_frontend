import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { isRealProfileUrl, ORG_ID } from "@/lib/seo/structured-data";
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { CtaBand } from "@/components/ds/cta-band";
import { EditorialSplit } from "@/components/ds/editorial-split";
import { HeroCinematic, type HeroLatest } from "@/components/ds/hero-cinematic";
import { SectionHeader } from "@/components/ds/section-header";
import { HomeFadeSection } from "@/components/landing/home-page-motion";
import { StatsSection } from "@/components/landing/stats-section";
import { GenresGrid, HOME_GENRES } from "@/components/landing/genres-grid";
import { HomeStoryTimeline } from "@/components/landing/home-story-timeline";
import { HomeServicesSection } from "@/components/landing/home-services-section";
import { HomeShopSection } from "@/components/landing/home-shop-section";
import { HomeLatestSection } from "@/components/landing/home-latest-section";
import { HomeLeadSection } from "@/components/landing/home-lead-section";
import { HomeTestimonialsSection } from "@/components/landing/home-testimonials-section";
import { MobileCtaBar } from "@/components/landing/mobile-cta-bar";
import { HomeChannelsSection } from "@/features/channels/components/home-channels-section";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { SpotifyIcon } from "@/features/productions/components/production-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Text } from "@/components/ui/text";
import { fetchPublic } from "@/lib/api";
import { fetchProducts } from "@/features/shop/api";
import { fetchSocialFeed } from "@/features/social/api";
import { SOCIAL_KIND_LABEL } from "@/features/social/copy";
import { genreColor } from "@/lib/genre-colors";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { getSiteContent } from "@/lib/site-config-server";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-defaults";
import { isFutureRelease } from "@/app/(public)/releases/_components/release-date";
import type { Product, Production, Release, SocialPost } from "@/types/models";
import type { SiteHomeMerch } from "@/types/site-content";

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

/**
 * Separa la última frase del texto «Quiénes somos» para usarla como cita serif (el resto queda como
 * párrafo). Si solo hay una frase, no hay cita. Todo el texto sigue viniendo del CMS.
 */
function splitQuote(body: string): { quote: string | null; text: string } {
  const trimmed = body.trim();
  const i = trimmed.lastIndexOf(". ");
  if (i < 0) return { quote: null, text: trimmed };
  const quote = trimmed.slice(i + 2).trim();
  const text = trimmed.slice(0, i + 1).trim();
  return quote.length >= 20 && quote.length <= 140 ? { quote, text } : { quote: null, text: trimmed };
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sodimusic.com").replace(/\/$/, "");
  return {
    title: { absolute: site.seo.homeTitle },
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

async function getProductions(query: string): Promise<Production[]> {
  try {
    const res = await fetchPublic(`/api/productions?${query}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as { items: Production[] };
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

const getFeaturedProductions = (n: number) => getProductions(`featured=1&pageSize=${Math.min(12, Math.max(1, n))}`);

/**
 * Merch de la portada: destacados primero y, si `onlyFeatured` es false, relleno con los más recientes
 * (orden de `/api/products`) hasta `limit`, sin repetir. Devuelve también el total de la tienda.
 */
async function getHomeMerch(merch: SiteHomeMerch): Promise<{ items: Product[]; total: number }> {
  const featured = await fetchProducts({ featured: true, pageSize: merch.limit });
  if (merch.onlyFeatured || featured.items.length >= merch.limit) {
    return { items: featured.items.slice(0, merch.limit), total: merch.onlyFeatured ? featured.total : featured.total };
  }
  const recent = await fetchProducts({ pageSize: merch.limit });
  const seen = new Set<string>();
  const items = [...featured.items, ...recent.items].filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true))).slice(0, merch.limit);
  return { items, total: recent.total };
}

/** Tarjeta «Lo último» del hero a partir del post más reciente del feed social (mismo origen que la sección). */
function heroLatestFromPost(post: SocialPost): HeroLatest {
  const network = SOCIAL_KIND_LABEL[post.kind] ?? SOCIAL_KIND_LABEL.LINK;
  return {
    title: post.title,
    artistName: post.author?.trim() || network,
    slug: "",
    upcoming: false,
    coverUrl: post.imageUrl?.trim() || null,
    href: post.url,
    external: true,
    label: post.kind === "YOUTUBE_VIDEO" ? "Nuevo video" : "Nuevo",
    ctaLabel: post.kind === "YOUTUBE_VIDEO" ? "Ver" : "Abrir",
    unoptimized: true,
  };
}

/** Portada por género (para la imagen flotante de la lista de géneros): la primera producción de cada uno. */
async function getGenreImages(): Promise<Record<string, string>> {
  const items = await getProductions("pageSize=30");
  const out: Record<string, string> = {};
  for (const p of items) {
    const key = p.genre?.trim().toLowerCase();
    if (key && p.coverUrl && !out[key]) out[key] = resolveMediaUrl(p.coverUrl);
  }
  return out;
}

/**
 * Lanzamiento más reciente para la tarjeta «Lo último» del hero: primero un destacado, si no el más reciente.
 * (`/api/releases` ya filtra `upcoming: true` y ordena por año y fecha de creación desc.)
 */
async function getLatestRelease(): Promise<HeroLatest | null> {
  const first = async (path: string): Promise<Release | null> => {
    const res = await fetchPublic(path, { next: { revalidate: 60 } });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as { items?: Release[] };
    return Array.isArray(data.items) && data.items[0] ? data.items[0] : null;
  };
  try {
    const r = (await first("/api/releases?pageSize=1&featured=1")) ?? (await first("/api/releases?pageSize=1"));
    if (!r?.title || !r.slug) {
      return null;
    }
    return {
      title: r.title,
      artistName: r.artistName,
      slug: r.slug,
      upcoming: isFutureRelease(r),
      coverUrl: r.coverUrl ? resolveMediaUrl(r.coverUrl) : null,
    };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const site = await getSiteContent();
  const showShop = site.shop.enabled && site.shop.showOnHome;
  const showYoutube = site.youtube.showOnHome;
  const latestCfg = site.home.latest;
  const wantFeed = latestCfg.source !== "productions";
  const wantProductions = latestCfg.source !== "feed";
  const [feed, featured, merch, latestRelease, genreImages] = await Promise.all([
    wantFeed ? fetchSocialFeed(latestCfg.limit).then((r) => r.items) : Promise.resolve([] as SocialPost[]),
    wantProductions ? getFeaturedProductions(latestCfg.source === "both" ? 3 : latestCfg.limit) : Promise.resolve([] as Production[]),
    showShop ? getHomeMerch(site.home.merch) : Promise.resolve({ items: [] as Product[], total: 0 }),
    // El hero usa el mismo origen que la sección: post más reciente del feed si lo hay; si no, el release.
    wantFeed ? Promise.resolve(null) : getLatestRelease(),
    getGenreImages(),
  ]);
  // Con feed sin publicaciones (o API caída) se cae al release más reciente para no dejar el hero sin tarjeta.
  const latest: HeroLatest | null = wantFeed ? (feed[0] ? heroLatestFromPost(feed[0]) : await getLatestRelease()) : latestRelease;

  const whatsappUrl = `https://wa.me/${site.contact.whatsapp}`;
  const businessName = site.legal?.businessName?.trim() || site.brand.logoText;
  const policyVersion = site.legal?.policyVersion?.trim() || SITE_CONTENT_DEFAULTS.legal.policyVersion;
  const about = splitQuote(site.home.aboutBody);
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
    genre: HOME_GENRES.map((g) => g.name),
    url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://sodimusic.com").replace(/\/$/, ""),
    sameAs: [site.social.facebook, site.social.youtube, site.social.instagram, site.social.tiktok, site.social.spotify].filter(isRealProfileUrl),
    memberOf: { "@id": ORG_ID },
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* 1. Hero */}
      <HeroCinematic
        title={site.hero.title}
        eyebrow={site.hero.eyebrow}
        tagline={site.hero.tagline}
        imageUrl={resolveMediaUrl(site.hero.heroImageUrl)}
        imageAlt="Sesión de estudio con equipo de audio"
        primary={{ href: site.hero.primaryHref, label: site.hero.primaryCta }}
        secondary={{ href: site.hero.secondaryHref, label: site.hero.secondaryCta }}
        latest={latest}
      />
      {/* Barra CTA fija en móvil (aparece al pasar el hero; se oculta con el reproductor abierto) */}
      <MobileCtaBar ctaHref={site.nav.ctaHref} ctaLabel={site.nav.ctaLabel} whatsapp={site.contact.whatsapp} businessName={businessName} />

      {/* 2. Quiénes somos: EditorialSplit + cifras en fila */}
      <HomeFadeSection className="relative py-section" aria-labelledby="about-title">
        <div className="container-page">
          <EditorialSplit
            quote={about.quote}
            image={{
              src: resolveAboutAsideImageUrl(site.home.aboutImageUrl),
              alt: ABOUT_ASIDE_ALT,
              aspect: "4/5",
              sizes: "(max-width: 1024px) 100vw, 40vw",
            }}
            caption={site.home.aboutAsideCaption}
          >
            <SectionHeader
              eyebrow={site.home.aboutEyebrow}
              title={site.home.aboutTitle}
              accent="sin fronteras"
              id="about-title"
              className="mb-6"
            />
            <Text size="body-lg" tone="2" prose>
              {about.text}
            </Text>
            <StatsSection stats={site.home.stats} className="mt-10" />
          </EditorialSplit>

          {/* Historia: continuación de «Quiénes somos» (misma pantalla, línea de hitos) */}
          <section aria-labelledby="historia-title" className="mt-16 border-t border-line-1 pt-12 lg:mt-24 lg:pt-16">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-3">
                <SectionHeader
                  eyebrow={site.home.storyEyebrow}
                  title={site.home.storyTitle}
                  accent="champeta"
                  size="display-sm"
                  id="historia-title"
                  className="mb-0"
                />
              </div>
              <div className="min-w-0 lg:col-span-9">
                <HomeStoryTimeline milestones={site.home.milestones} />
              </div>
            </div>
          </section>
        </div>
      </HomeFadeSection>

      {/* 3. Géneros: cabecera a la izquierda + lista editorial */}
      <HomeFadeSection className="bg-ink-1 py-section" aria-labelledby="genres-title">
        <div className="container-page grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <SectionHeader
              eyebrow={site.home.genresEyebrow}
              title={site.home.genresTitle}
              id="genres-title"
              className="mb-0 md:flex-col md:items-start lg:sticky lg:top-24"
              lead={
                <span className="flex flex-wrap gap-1.5">
                  {HOME_GENRES.map((g) => {
                    const c = genreColor(g.name);
                    return (
                      <Badge key={g.name} variant="outline" style={{ color: c.fg, borderColor: c.border }}>
                        {g.name}
                      </Badge>
                    );
                  })}
                </span>
              }
            />
          </div>
          <div className="min-w-0 border-t border-line-1 lg:col-span-8">
            <GenresGrid images={genreImages} />
          </div>
        </div>
      </HomeFadeSection>

      {/* 5. Lo último: una sola sección (feed social y/o producciones destacadas, según el CMS) */}
      <HomeLatestSection latest={latestCfg} posts={feed} productions={featured} className="bg-ink-1" />

      {/* 7. Canales (organismo del catálogo, tal cual) */}
      {showYoutube ? <HomeChannelsSection youtube={site.youtube} className="border-t border-line-1" /> : null}

      {/* 8. Merch */}
      {showShop ? (
        <HomeShopSection shop={site.shop} merch={site.home.merch} products={merch.items} total={merch.total} ivaIncluded={site.legal?.ivaIncluded ?? true} />
      ) : null}

      {/* 9. Servicios: cabecera a la izquierda + FeatureRow ×6 */}
      <HomeFadeSection className="py-section" aria-labelledby="services-title">
        <div className="container-page">
          <SectionHeader
            title={site.home.servicesTitle}
            lead={site.home.servicesSubtitle}
            eyebrow={site.home.servicesEyebrow || undefined}
            id="services-title"
            action={
              <div className="hidden md:block">
                <Button asChild withArrow>
                  <Link href={site.nav.ctaHref}>{site.nav.ctaLabel}</Link>
                </Button>
              </div>
            }
          />
          <HomeServicesSection services={site.booking.services} ctaHref={site.nav.ctaHref} />
        </div>
      </HomeFadeSection>

      {/* 9b. Testimonios (oculto si no hay) */}
      <HomeTestimonialsSection testimonials={site.home.testimonials} className="border-t border-line-1" />

      {/* 9c. Cotización rápida (leads) */}
      {site.home.lead.enabled ? (
        <HomeLeadSection
          lead={site.home.lead}
          services={site.booking.services.map((s) => s.title).filter((t) => t?.trim())}
          businessName={businessName}
          policyVersion={policyVersion}
          whatsapp={site.contact.whatsapp}
        />
      ) : null}

      {/* 10. Contacto: banda fire */}
      <CtaBand
        id="contact-title"
        title={site.home.contactTitle}
        accent="proyecto"
        lead={
          <>
            {site.home.contactSubtitle} O escribe a{" "}
            <a href={`mailto:${site.contact.email}`} className="font-semibold text-fire-on underline decoration-fire-on/40 underline-offset-4 hover:decoration-fire-on">
              {site.contact.email}
            </a>
            .
          </>
        }
        actions={
          <>
            <Button asChild size="lg" className="bg-ink-0 text-text-1 shadow-none hover:bg-ink-3">
              <Link href="/contacto">Escríbenos</Link>
            </Button>
            <Button asChild size="lg" variant="whatsapp">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp a Sodimusic">
                <WhatsAppIcon className="h-5 w-5" />
                WhatsApp
              </a>
            </Button>
          </>
        }
        aside={
          socials.length
            ? socials.map(({ href, label, Icon }) => (
                <IconButton
                  key={label}
                  asChild
                  variant="outline"
                  className="border-fire-on/30 text-fire-on hover:border-fire-on hover:bg-fire-on hover:text-fire-300"
                  aria-label={label}
                >
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <Icon className="h-5 w-5" />
                  </a>
                </IconButton>
              ))
            : undefined
        }
      />
    </>
  );
}
