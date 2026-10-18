import { SectionHeader } from "@/components/ds/section-header";
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
 * Sección «Preguntas frecuentes» reutilizable (server component): `SectionHeader` sticky a la izquierda
 * (5/12) y acordeón a la derecha (7/12). Emite JSON-LD `FAQPage` con un <script> plano (sin next/script)
 * y delega el acordeón al cliente (`FaqAccordion`). Si no hay preguntas no renderiza nada.
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
    <section className={cn("relative bg-ink-1 py-section", className)} aria-labelledby={id}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />
      <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          lead={subtitle}
          id={id}
          className="mb-0 lg:col-span-5 lg:sticky lg:top-[calc(var(--nav-h,72px)+32px)] lg:self-start"
        />
        <div className="lg:col-span-7">
          <FaqAccordion items={items} idPrefix={id} />
        </div>
      </div>
    </section>
  );
}
