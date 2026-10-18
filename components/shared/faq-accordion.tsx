"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FaqItem } from "@/content/faq";

interface FaqAccordionProps {
  items: FaqItem[];
  /** Prefijo para los `value` de los ítems (único por página si hay varias FAQ). */
  idPrefix?: string;
}

/**
 * Acordeón de preguntas (Radix): una pregunta abierta a la vez, todas plegables.
 * Es el único trozo con JS de la FAQ; el JSON-LD y el título viven en el server wrapper `FaqSection`.
 */
export function FaqAccordion({ items, idPrefix = "faq" }: FaqAccordionProps) {
  return (
    <Accordion type="single" collapsible className="border-t border-border">
      {items.map((item, i) => (
        <AccordionItem key={item.question} value={`${idPrefix}-${i}`}>
          <AccordionTrigger className="min-h-[44px] gap-4 py-5 text-left font-body text-base font-medium leading-snug text-foreground hover:no-underline hover:text-primary data-[state=open]:text-primary sm:text-lg [&>svg]:text-[var(--text-muted)]">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="max-w-prose pb-6 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
