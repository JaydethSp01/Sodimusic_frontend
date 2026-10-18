import { cn } from "@/lib/utils";

interface MarqueeStripProps {
  /** Géneros del sello (p. ej. `site.booking.genreChips`); «Otro» se descarta. */
  genres: string[];
  className?: string;
}

/** Textos fijos que cierran cada vuelta de la cinta. */
const FIXED_ITEMS = ["María La Baja → Medellín", "Est. 2016"];

/**
 * Cinta editorial entre el hero y «Quiénes somos»: texto display grande que corre en bucle (solo CSS,
 * `@keyframes marquee` en globals.css). Server component sin JS.
 *
 * - La cinta son dos copias del mismo grupo; la animación desplaza -50 % y el bucle no tiene costura.
 * - Con `prefers-reduced-motion` la regla global anula la animación, la copia duplicada (`aria-hidden`)
 *   se oculta y los ítems se muestran una sola vez con `flex-wrap`.
 */
export function MarqueeStrip({ genres, className }: MarqueeStripProps) {
  const items = [...genres.map((g) => g.trim()).filter((g) => g && g.toLowerCase() !== "otro"), ...FIXED_ITEMS];

  const renderGroup = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className={cn(
        "marquee-group flex shrink-0 items-center",
        !hidden && "motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-2",
        hidden && "motion-reduce:hidden",
      )}
    >
      {items.map((item, i) => (
        <li
          key={`${item}-${i}`}
          className="flex items-center gap-5 pr-5 font-display text-[clamp(28px,5vw,44px)] uppercase leading-none tracking-[0.04em] text-white/85 sm:gap-7 sm:pr-7"
        >
          <span className="whitespace-nowrap">{item}</span>
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary sm:h-2.5 sm:w-2.5" aria-hidden />
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label="Géneros y origen del sello"
      data-testid="marquee-strip"
      className={cn("marquee overflow-hidden border-y border-white/[0.06] bg-background py-5", className)}
    >
      <div className="marquee-track flex w-max items-center motion-reduce:w-full">
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </section>
  );
}
