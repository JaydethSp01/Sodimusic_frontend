import Link from "next/link";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/types/site-content";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

/**
 * Entrada del hero en CSS (`.hero-enter` en globals.css): opacity 0→1 y translateY(--enter-y)→0 en 0.8 s
 * con el mismo retardo escalonado que tenía framer. Server component: es el LCP y no necesita JS.
 * `prefers-reduced-motion` anula la animación (regla global) y el contenido queda visible al instante.
 */
const enter = (y: number, delay: number) =>
  ({ "--enter-y": `${y}px`, "--enter-delay": `${delay}s` }) as React.CSSProperties;

export function HeroSection({ hero }: { hero: SiteContent["hero"] }) {
  const heroSrc = resolveMediaUrl(hero.heroImageUrl);

  return (
    <section
      aria-label="Presentación"
      className="relative flex min-h-[85svh] flex-col justify-end overflow-hidden"
    >
      <Image
        src={heroSrc}
        alt="Sesión de estudio con equipo de audio"
        fill
        priority
        quality={70}
        className="object-cover object-center"
        sizes="100vw"
      />
      {/* Velo: oscurece de forma progresiva hacia abajo para que el texto se lea sobre la foto. */}
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.35)_0%,rgba(8,8,8,0.55)_45%,rgba(8,8,8,0.9)_80%,#080808_100%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="hero-orb hero-orb-a absolute -left-16 top-1/3 h-48 w-48 rounded-full bg-primary/20 blur-3xl md:h-80 md:w-80" />
        <div className="hero-orb hero-orb-b absolute -right-16 bottom-16 h-40 w-40 rounded-full bg-[var(--gold-muted)] blur-3xl md:h-64 md:w-64" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-14 pt-32 text-center sm:pb-16 lg:px-8">
        <p className="hero-enter eyebrow text-[11px] text-white/80 sm:text-xs" style={enter(12, 0.05)}>
          {hero.eyebrow}
        </p>
        <h1
          className="hero-enter display-title mt-5 text-[clamp(64px,15vw,96px)] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:tracking-[0.12em] md:text-[clamp(96px,11vw,150px)]"
          style={enter(36, 0.15)}
        >
          {hero.title}
        </h1>
        <p
          className="hero-enter mt-4 max-w-2xl text-balance font-body text-lg italic leading-snug text-[var(--gold)] sm:text-xl md:text-2xl"
          style={enter(24, 0.3)}
        >
          {hero.tagline}
        </p>
        <div
          className="hero-enter mt-9 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4"
          style={enter(20, 0.45)}
        >
          <Button
            asChild
            size="lg"
            className={cn(
              "h-12 rounded-md px-8 text-base font-semibold transition-shadow duration-300",
              "shadow-[0_8px_30px_rgba(255,107,0,0.28)] hover:shadow-[0_8px_36px_rgba(255,107,0,0.45)]",
            )}
          >
            <Link href={hero.primaryHref}>{hero.primaryCta}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-md border-white/25 bg-black/20 px-8 text-base text-white backdrop-blur-sm hover:border-primary/60 hover:bg-black/40"
          >
            <Link href={hero.secondaryHref}>{hero.secondaryCta}</Link>
          </Button>
        </div>

        <div
          className="hero-enter mt-12 flex flex-col items-center gap-2 text-[var(--text-muted)]"
          style={enter(0, 0.9)}
          aria-hidden
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Desliza</span>
          <ArrowDown className="h-4 w-4 motion-safe:animate-bounce" />
        </div>
      </div>
    </section>
  );
}
