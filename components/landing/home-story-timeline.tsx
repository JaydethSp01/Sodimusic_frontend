import { Reveal } from "@/components/shared/reveal";
import { RevealItem } from "@/components/shared/reveal-item";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export type StoryMilestone = { year: string; title: string; desc: string };

/**
 * Línea de hitos: una sola línea con puntos; en móvil/tablet los hitos van en scroll horizontal
 * con `scroll-snap` (tarjetas de ~78 vw) y en escritorio en 4 columnas. Año en display-md fire.
 */
export function HomeStoryTimeline({ milestones, className }: { milestones: StoryMilestone[]; className?: string }) {
  const last = milestones.length - 1;
  return (
    <Reveal
      as="ol"
      variant="stagger"
      className={cn(
        "no-scrollbar relative -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6",
        "lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible lg:px-0 lg:pb-0",
        className,
      )}
      aria-label="Hitos del sello"
    >
      {milestones.map((m, i) => (
        <RevealItem
          as="li"
          key={m.year}
          className="relative w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-auto"
        >
          {/* Línea + punto: la línea se corta en el último hito. */}
          <div className="relative mb-6 h-4" aria-hidden>
            {i !== last ? (
              <span className="absolute -right-6 left-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-fire-500/70 via-line-2 to-line-2 lg:-right-8" />
            ) : null}
            <span
              className={cn(
                "absolute left-0 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-ink-0",
                i === last ? "border-fire-500" : "border-line-2",
              )}
            >
              {i === last ? <span className="h-1.5 w-1.5 rounded-full bg-fire-500" /> : null}
            </span>
          </div>
          <Heading as="p" size="display-md" tone="fire" balance={false}>
            {m.year}
          </Heading>
          <h3 className="mt-3 text-title text-text-1">{m.title}</h3>
          <Text size="body-sm" tone="2" className="mt-2 lg:pr-4">
            {m.desc}
          </Text>
        </RevealItem>
      ))}
    </Reveal>
  );
}
