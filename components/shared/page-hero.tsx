import { HeroPage } from "@/components/ds/hero-page";

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

/** Wrapper de compatibilidad (fase A): delega en `HeroPage` (mismo `id="page-hero-title"`). */
export function PageHero({ eyebrow, title, description, className, backgroundImageUrl, children }: PageHeroProps) {
  return (
    <HeroPage eyebrow={eyebrow} title={title} description={description} className={className} backgroundImageUrl={backgroundImageUrl}>
      {children}
    </HeroPage>
  );
}
