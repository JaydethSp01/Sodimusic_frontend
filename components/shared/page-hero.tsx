import Image from "next/image";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  /** URL absoluta o ruta (/uploads/…) mostrada como fondo con velo para legibilidad */
  backgroundImageUrl?: string;
  /** Contenido extra bajo la descripción (CTA, cifras, chips). */
  children?: React.ReactNode;
}

export function PageHero({ eyebrow, title, description, className, backgroundImageUrl, children }: PageHeroProps) {
  const bg = backgroundImageUrl?.trim() ? resolveMediaUrl(backgroundImageUrl) : null;

  return (
    <section
      aria-labelledby="page-hero-title"
      className={cn(
        "relative overflow-hidden px-4 pb-14 pt-16 lg:px-8 lg:pb-20 lg:pt-24",
        bg ? "" : "bg-background-secondary/60",
        className,
      )}
    >
      {bg ? (
        <>
          <Image src={bg} alt="" fill priority quality={60} sizes="100vw" className="object-cover object-center" />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.72)_0%,rgba(8,8,8,0.86)_60%,#080808_100%)]"
            aria-hidden
          />
        </>
      ) : (
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_0%,rgba(255,107,0,0.12),transparent)]"
          aria-hidden
        />
      )}
      <div className="section-divider absolute inset-x-0 bottom-0" aria-hidden />
      <div className="relative mx-auto max-w-7xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1
          id="page-hero-title"
          className={cn("display-title text-balance text-5xl text-foreground sm:text-6xl md:text-7xl lg:text-8xl", eyebrow && "mt-4")}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-balance text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
