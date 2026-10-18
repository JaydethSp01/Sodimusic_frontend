import type { ReactNode } from "react";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

/**
 * Banda a sangre de llamada a la acción. `tone="fire"`: degradado naranja con texto oscuro;
 * `tone="ink"`: ink-1 con línea fire arriba. Titular display-md + acciones (+ `aside` para redes).
 */
export interface CtaBandProps {
  title: ReactNode;
  accent?: string;
  lead?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  tone?: "fire" | "ink";
  id?: string;
  className?: string;
}

export function CtaBand({ title, accent, lead, actions, aside, tone = "fire", id, className }: CtaBandProps) {
  const fire = tone === "fire";
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "relative isolate overflow-hidden py-16 lg:py-24",
        fire
          ? "bg-[linear-gradient(120deg,#b3861b_0%,#d9a62a_55%,#e6b83a_100%)] text-fire-on"
          : "border-t border-fire-500/40 bg-ink-1 text-text-1",
        className,
      )}
    >
      {fire ? (
        <div className="grain pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(217,166,42,0.14),transparent)]" aria-hidden />
      )}
      <div className="container-page relative z-10 grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="min-w-0 lg:col-span-7">
          <Heading
            as="h2"
            size="display-md"
            id={id}
            accent={accent}
            className={cn(fire ? "text-fire-on [&_em]:text-fire-on/80" : "text-text-1")}
          >
            {title}
          </Heading>
          {lead ? <p className={cn("mt-5 text-body-lg container-prose", fire ? "text-fire-on/80" : "text-text-2")}>{lead}</p> : null}
        </div>
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-5 lg:items-end">
          {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">{actions}</div> : null}
          {aside ? <div className="flex flex-wrap gap-2 lg:justify-end">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
