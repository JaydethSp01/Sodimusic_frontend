import { Quote } from "lucide-react";
import { SectionHeader } from "@/components/ds/section-header";
import { Avatar } from "@/components/ui/avatar";
import { HomeFadeSection } from "@/components/landing/home-page-motion";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";
import type { SiteHomeTestimonials } from "@/types/site-content";

/**
 * Testimonios: carrusel con scroll-snap (sin JS) de citas en serif itálica, autor y rol.
 * Devuelve `null` si no hay testimonios.
 */
export function HomeTestimonialsSection({
  testimonials,
  id = "testimonials-title",
  className,
}: {
  testimonials: SiteHomeTestimonials;
  id?: string;
  className?: string;
}) {
  const items = testimonials.items.filter((t) => t.quote.trim());
  if (!items.length) return null;

  return (
    <HomeFadeSection className={cn("py-section", className)} aria-labelledby={id}>
      <div className="container-page">
        <SectionHeader eyebrow="Testimonios" title={testimonials.title} id={id} />
        <ul
          aria-label="Testimonios"
          className="scroll-fade-x -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-0 sm:gap-5 sm:px-0 [scrollbar-width:thin]"
        >
          {items.map((t, i) => (
            <li
              key={`${t.author}-${i}`}
              className="flex w-[85vw] max-w-md shrink-0 snap-start flex-col justify-between gap-6 rounded-lg border border-line-1 bg-ink-2 p-6 shadow-card sm:w-[26rem] sm:p-8"
            >
              <blockquote className="relative">
                <Quote className="absolute -left-1 -top-2 h-7 w-7 text-fire-500/40" strokeWidth={1.5} aria-hidden />
                <p className="text-accent relative text-display-sm leading-snug text-text-1">“{t.quote.trim()}”</p>
              </blockquote>
              <figure className="flex items-center gap-3">
                <Avatar name={t.author || "Anónimo"} src={t.avatarUrl ? resolveMediaUrl(t.avatarUrl) : null} size={40} />
                <figcaption className="min-w-0">
                  <span className="block truncate text-body-sm font-semibold text-text-1">{t.author || "Anónimo"}</span>
                  {t.role ? <span className="block truncate text-label text-text-3">{t.role}</span> : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </HomeFadeSection>
  );
}
