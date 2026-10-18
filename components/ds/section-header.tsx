import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading, type HeadingSize } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/**
 * Cabecera de sección: Kicker opcional + Eyebrow + Heading + lead + acción a la derecha (escritorio)
 * o debajo (móvil). Sustituye a `SectionTitle` en todas las secciones.
 */
export interface SectionHeaderProps {
  kicker?: string;
  eyebrow?: string;
  eyebrowTone?: "fire" | "serif";
  title: ReactNode;
  /** Palabra del título que va en serif itálica. */
  accent?: string;
  id?: string;
  as?: "h1" | "h2" | "h3";
  size?: HeadingSize;
  lead?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  kicker,
  eyebrow,
  eyebrowTone = "fire",
  title,
  accent,
  id,
  as = "h2",
  size = "display-md",
  lead,
  action,
  align = "left",
  className,
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-12 flex flex-col gap-6",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("min-w-0", centered && "flex flex-col items-center")}>
        {kicker ? <Kicker className="mb-3">{kicker}</Kicker> : null}
        {eyebrow ? <Eyebrow tone={eyebrowTone} align={align}>{eyebrow}</Eyebrow> : null}
        <Heading as={as} size={size} id={id} accent={accent} className={cn((eyebrow || kicker) && "mt-4")}>
          {title}
        </Heading>
        {lead ? (
          <Text size="body-lg" tone="2" className={cn("mt-5 container-prose", centered && "mx-auto")}>
            {lead}
          </Text>
        ) : null}
      </div>
      {action ? <div className={cn("shrink-0", !centered && "md:mb-1")}>{action}</div> : null}
    </div>
  );
}
