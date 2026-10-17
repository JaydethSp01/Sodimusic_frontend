import { Reveal } from "@/components/shared/reveal";
import { RevealItem } from "@/components/shared/reveal-item";

/**
 * Envoltorios de revelado del home (y de /tienda, /canales): antes `motion.*` + `whileInView` de
 * framer-motion; ahora `Reveal`/`RevealItem` (IntersectionObserver + CSS, ver `components/shared/reveal.tsx`).
 * Sin "use client": `RevealItem` se renderiza en servidor y solo `Reveal` lleva JS.
 */
export { RevealNoScriptFallback } from "@/components/shared/reveal-item";

export function HomeFadeSection({
  className,
  children,
  id,
  "aria-labelledby": ariaLabelledBy,
  "aria-label": ariaLabel,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
}) {
  return (
    <Reveal as="section" className={className} id={id} aria-labelledby={ariaLabelledBy} aria-label={ariaLabel}>
      {children}
    </Reveal>
  );
}

export function HomeFigureMotion({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="figure" variant="figure" className={className}>
      {children}
    </Reveal>
  );
}

export function HomeStagger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal variant="stagger" className={className}>
      {children}
    </Reveal>
  );
}

export function HomeStaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <RevealItem className={className}>{children}</RevealItem>;
}
