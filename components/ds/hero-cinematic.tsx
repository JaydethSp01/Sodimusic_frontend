import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { MediaFrame } from "@/components/ds/media-frame";
import { cn } from "@/lib/utils";

/**
 * Elemento de la tarjeta «Lo último». Por defecto es un lanzamiento (`/releases/[slug]`; `upcoming` =
 * fecha de salida en el futuro). Con `href` apunta a otro destino (p. ej. el post más reciente del feed
 * social): `external` abre en pestaña nueva, `label` sustituye a «Nuevo» y `ctaLabel` a «Escuchar».
 */
export interface HeroLatest {
  title: string;
  artistName: string;
  slug: string;
  upcoming: boolean;
  coverUrl?: string | null;
  href?: string;
  external?: boolean;
  label?: string;
  ctaLabel?: string;
  /** Imagen externa (miniaturas de YouTube/Facebook) sin pasar por el optimizador. */
  unoptimized?: boolean;
}

export interface HeroCinematicProps {
  title: string;
  accent?: string;
  eyebrow?: string;
  tagline?: string;
  imageUrl: string;
  imageAlt?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string } | null;
  latest?: HeroLatest | null;
  /** `aria-label` de la región (los e2e buscan "Presentación"). */
  ariaLabel?: string;
  /** Contenido extra bajo los CTAs (móvil) / junto a ellos. */
  children?: ReactNode;
  className?: string;
}

/** Entrada escalonada en CSS (`.hero-enter`): opacity 0→1 y translateY(--enter-y)→0 en 0.8 s. */
const enter = (y: number, delay: number) => ({ "--enter-y": `${y}px`, "--enter-delay": `${delay}s` }) as React.CSSProperties;

/**
 * Hero de portada: foto a sangre con duotono + grano, H1 display-xl anclado abajo-izquierda que se sale
 * un 3 % del contenedor en escritorio, tagline serif, 2 CTAs y tarjeta «Lo último» que solapa el borde
 * inferior (escritorio) o va bajo los CTAs (móvil). Server component: es el LCP.
 */
export function HeroCinematic({
  title,
  accent,
  eyebrow,
  tagline,
  imageUrl,
  imageAlt = "",
  primary,
  secondary,
  latest,
  ariaLabel = "Presentación",
  children,
  className,
}: HeroCinematicProps) {
  const latestHref = latest?.href ?? (latest?.slug ? `/releases/${latest.slug}` : "/releases");
  const latestLabel = latest?.label ?? (latest?.upcoming ? "Próximamente" : "Nuevo");
  const latestCta = latest?.ctaLabel ?? "Escuchar";

  return (
    <section aria-label={ariaLabel} className={cn("relative isolate flex min-h-[78svh] flex-col justify-end overflow-visible", className)}>
      {/* Foto tratada */}
      <div className="media-duotone grain absolute inset-0 -z-10 overflow-hidden">
        <Image src={imageUrl} alt={imageAlt} fill priority quality={70} sizes="100vw" className="object-cover object-center" />
        {/* Velo cálido para legibilidad del texto, por encima del duotono. */}
        <div className="absolute inset-0 z-[4] bg-[linear-gradient(180deg,rgba(5,4,4,0.25)_0%,rgba(5,4,4,0.35)_40%,rgba(5,4,4,0.85)_78%,#050404_100%)]" aria-hidden />
      </div>

      <div className="container-page relative z-10 pb-10 pt-40 lg:pb-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="min-w-0 lg:col-span-8">
            {eyebrow ? (
              <Eyebrow tone="fire" className="hero-enter" style={enter(12, 0.05)}>
                {eyebrow}
              </Eyebrow>
            ) : null}
            <Heading
              as="h1"
              size="display-xl"
              accent={accent}
              balance={false}
              className="hero-enter mt-5 text-text-1 [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] lg:-ml-[3%]"
              style={enter(36, 0.15)}
            >
              {title}
            </Heading>
            {tagline ? (
              <p className="hero-enter text-accent mt-5 max-w-xl text-balance text-display-sm text-fire-300" style={enter(24, 0.3)}>
                {tagline}
              </p>
            ) : null}
            <div className="hero-enter mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4" style={enter(20, 0.45)}>
              <Button asChild size="xl" withArrow className="w-full sm:w-auto">
                <Link href={primary.href}>{primary.label}</Link>
              </Button>
              {secondary ? (
                <Button asChild size="xl" variant="outline" className="w-full border-white/25 bg-black/30 backdrop-blur-sm sm:w-auto">
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              ) : null}
            </div>
            {children}
          </div>

          {latest ? (
            <div className="hero-enter min-w-0 lg:col-span-4 lg:justify-self-end" style={enter(16, 0.6)}>
              <Link
                href={latestHref}
                target={latest.external ? "_blank" : undefined}
                rel={latest.external ? "noopener noreferrer" : undefined}
                data-testid="hero-latest"
                className="group relative flex min-h-11 items-center gap-4 rounded-lg border border-line-2 bg-ink-2/90 p-3 pr-5 shadow-card backdrop-blur-md transition-colors duration-150 hover:border-fire-500/60 lg:w-[22rem] lg:translate-y-1/2"
              >
                <MediaFrame
                  src={latest.coverUrl ?? undefined}
                  alt=""
                  aspect="1/1"
                  treatment="duotone"
                  hoverReveal
                  rounded="md"
                  fallbackSeed={latest.artistName || latest.title}
                  fallbackLabel=""
                  unoptimized={latest.unoptimized}
                  sizes="96px"
                  className="h-20 w-20 shrink-0 lg:h-24 lg:w-24"
                  center={
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-text-1 text-ink-0 transition-colors duration-150 group-hover:bg-fire-500 group-hover:text-fire-on">
                      <Play className="ml-0.5 h-4 w-4" fill="currentColor" strokeWidth={0} aria-hidden />
                    </span>
                  }
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-label-sm text-fire-400">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-fire-500 motion-safe:animate-pulse" aria-hidden />
                    {latestLabel}
                  </span>
                  <span className="mt-1 block truncate text-title text-text-1">{latest.title}</span>
                  <span className="mt-0.5 block truncate text-body-sm text-text-2">{latest.artistName}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-label text-text-3 transition-colors duration-150 group-hover:text-fire-300">
                    {latestCta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" aria-hidden />
                  </span>
                </span>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
