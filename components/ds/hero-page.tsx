import type { ReactNode } from "react";
import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";

/**
 * Hero compacto de página interior (pt 96 / pb 48): eyebrow, H1 display-lg, lead y un slot derecho
 * (`aside`) para datos: contador, chips, acción. Sin imagen de fondo salvo `backgroundImageUrl`
 * (entonces `media-veil`). `children` va bajo el lead (CTA, chips) y `aside` a la derecha en ≥ lg.
 */
export interface HeroPageProps {
  eyebrow?: string;
  eyebrowTone?: "fire" | "serif";
  title: ReactNode;
  accent?: string;
  description?: ReactNode;
  backgroundImageUrl?: string;
  aside?: ReactNode;
  children?: ReactNode;
  titleId?: string;
  className?: string;
}

export function HeroPage({
  eyebrow,
  eyebrowTone = "fire",
  title,
  accent,
  description,
  backgroundImageUrl,
  aside,
  children,
  titleId = "page-hero-title",
  className,
}: HeroPageProps) {
  const bg = backgroundImageUrl?.trim() ? resolveMediaUrl(backgroundImageUrl) : null;
  return (
    <section
      aria-labelledby={titleId}
      className={cn("relative isolate overflow-hidden pb-10 pt-16 lg:pt-20", bg ? "media-veil" : "bg-ink-1", className)}
    >
      {bg ? (
        <Image src={bg} alt="" fill priority quality={60} sizes="100vw" className="-z-10 object-cover object-center opacity-80 grayscale-[0.35]" />
      ) : (
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_0%_0%,rgba(255,107,0,0.12),transparent)]"
          aria-hidden
        />
      )}
      <div className="section-divider absolute inset-x-0 bottom-0 z-10" aria-hidden />
      <div className="container-page relative z-10 grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className={cn("min-w-0", aside ? "lg:col-span-8" : "lg:col-span-10")}>
          {eyebrow ? <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow> : null}
          <Heading as="h1" size="display-lg" id={titleId} accent={accent} className={cn(eyebrow && "mt-4")}>
            {title}
          </Heading>
          {description ? (
            <Text size="body-lg" tone="2" className="container-prose mt-5 text-balance">
              {description}
            </Text>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
        {aside ? <div className="min-w-0 lg:col-span-4 lg:justify-self-end">{aside}</div> : null}
      </div>
    </section>
  );
}
