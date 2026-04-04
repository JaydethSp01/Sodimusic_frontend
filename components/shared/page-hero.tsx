import { resolveMediaUrl } from "@/lib/resolve-media-url";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  /** URL absoluta o ruta (/uploads/…) mostrada como fondo con velo para legibilidad */
  backgroundImageUrl?: string;
}

export function PageHero({ eyebrow, title, description, className, backgroundImageUrl }: PageHeroProps) {
  const bg = backgroundImageUrl?.trim() ? resolveMediaUrl(backgroundImageUrl) : null;

  return (
    <section
      aria-labelledby="page-hero-title"
      className={`relative overflow-hidden border-b border-border px-4 py-16 lg:px-8 ${bg ? "" : "bg-background-secondary"} ${className ?? ""}`}
    >
      {bg ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bg})` }} aria-hidden />
          <div className="absolute inset-0 bg-background/85" aria-hidden />
        </>
      ) : null}
      <div className="relative mx-auto max-w-7xl">
        {eyebrow ? (
          <p className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</p>
        ) : null}
        <h1
          id="page-hero-title"
          className={`font-display text-4xl tracking-wide text-foreground md:text-6xl ${eyebrow ? "mt-2" : ""}`}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-3xl text-lg italic text-[var(--gold)]">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
