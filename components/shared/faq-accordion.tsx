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
    <Accordion type="single" collapsible className="border-t border-line-1">
      {items.map((item, i) => (
        <AccordionItem key={item.question} value={`${idPrefix}-${i}`} className="border-line-1">
          <AccordionTrigger className="min-h-11 gap-4 py-5 text-left text-body font-semibold text-text-1 transition-colors duration-150 hover:text-fire-300 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0 data-[state=open]:text-fire-300 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-text-3 [&>svg]:stroke-[1.75]">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="container-prose pb-6 text-body text-text-2">{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
