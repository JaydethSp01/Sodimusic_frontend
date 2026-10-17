import { Reveal } from "@/components/shared/reveal";
import { RevealItem } from "@/components/shared/reveal-item";

export type StoryMilestone = { year: string; title: string; desc: string };

export function HomeStoryTimeline({ milestones }: { milestones: StoryMilestone[] }) {
  return (
    <>
      {/* Desktop: hitos en fila sobre una línea de tiempo */}
      <div className="relative mt-12 hidden lg:block">
        <div
          className="absolute left-0 right-0 top-[22px] h-px bg-gradient-to-r from-primary/60 via-primary/30 to-transparent"
          aria-hidden
        />
        <Reveal as="ol" variant="stagger" className="relative grid grid-cols-4 gap-8">
          {milestones.map((m, i) => (
            <RevealItem as="li" key={m.year} className="relative pt-12">
              <span
                className="absolute left-0 top-[14px] z-[1] flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-background shadow-[0_0_0_6px_rgba(8,8,8,1)]"
                aria-hidden
              >
                {i === milestones.length - 1 ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
              </span>
              <p className="display-title text-4xl text-primary">{m.year}</p>
              <h3 className="mt-3 font-body text-base font-semibold uppercase tracking-wider text-foreground">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{m.desc}</p>
            </RevealItem>
          ))}
        </Reveal>
      </div>

      {/* Móvil/tablet: lista vertical */}
      <Reveal variant="stagger" className="relative mt-10 lg:hidden">
        <div className="absolute bottom-2 left-[7px] top-3 w-px bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" aria-hidden />
        <ol className="space-y-9 pl-9">
          {milestones.map((m) => (
            <RevealItem as="li" key={m.year} className="relative">
              <span
                className="absolute -left-9 top-1.5 z-[1] h-4 w-4 rounded-full border-2 border-primary bg-background shadow-[0_0_0_5px_rgba(8,8,8,1)]"
                aria-hidden
              />
              <p className="display-title text-3xl text-primary">{m.year}</p>
              <h3 className="mt-2 font-body text-base font-semibold uppercase tracking-wider text-foreground">{m.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{m.desc}</p>
            </RevealItem>
          ))}
        </ol>
      </Reveal>
    </>
  );
}
