import { SectionTitle } from "@/components/shared/section-title";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import type { FaqItem } from "@/content/faq";
import { cn } from "@/lib/utils";

interface FaqSectionProps {
  items: FaqItem[];
  /** id del H2 (`aria-labelledby` de la sección); cámbialo si hay más de una FAQ en la página. */
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Sección «Preguntas frecuentes» reutilizable (server component).
 * Emite JSON-LD `FAQPage` con un <script> plano (sin next/script) y delega el acordeón
 * al cliente (`FaqAccordion`). Si no hay preguntas no renderiza nada.
 */
export function FaqSection({
  items,
  id = "faq-title",
  eyebrow = "Dudas",
  title = "Preguntas frecuentes",
  subtitle,
  className,
}: FaqSectionProps) {
  if (!items.length) {
    return null;
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  // `<` escapado para que ninguna pregunta pueda cerrar el <script>.
  const jsonLdHtml = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <section className={cn("relative px-4 py-16 sm:py-20 lg:px-8 lg:py-28", className)} aria-labelledby={id}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />
      <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
        <SectionTitle eyebrow={eyebrow} title={title} subtitle={subtitle} id={id} className="mb-0 lg:sticky lg:top-28 lg:self-start" />
        <FaqAccordion items={items} idPrefix={id} />
      </div>
    </section>
  );
}
