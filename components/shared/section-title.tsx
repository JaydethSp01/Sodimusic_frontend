import { SectionHeader } from "@/components/ds/section-header";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  id?: string;
  /** Centra el bloque (p. ej. secciones de cierre). */
  align?: "left" | "center";
  className?: string;
}

/**
 * Wrapper de compatibilidad (fase A): delega en `SectionHeader`. Las vistas nuevas usan
 * `SectionHeader` directamente (kicker, accent, action).
 */
export function SectionTitle({ eyebrow, title, subtitle, id, align = "left", className }: SectionTitleProps) {
  return <SectionHeader eyebrow={eyebrow} title={title} lead={subtitle} id={id} align={align} className={className} />;
}
