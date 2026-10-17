import { cn } from "@/lib/utils";

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
 * Cabecera de sección: eyebrow con línea de acento, titular display grande
 * con tracking y subtítulo en texto secundario.
 */
export function SectionTitle({ eyebrow, title, subtitle, id, align = "left", className }: SectionTitleProps) {
  return (
    <div className={cn("mb-12 max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <p className={cn("eyebrow", align === "center" && "justify-center")}>{eyebrow}</p> : null}
      <h2 id={id} className="display-title mt-3 text-balance text-4xl text-foreground sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
