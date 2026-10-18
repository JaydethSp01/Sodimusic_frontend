import Link from "next/link";
import { FeatureRow } from "@/components/ds/feature-row";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Reveal } from "@/components/shared/reveal";
import { RevealItem } from "@/components/shared/reveal-item";
import { serviceIcon } from "@/lib/service-icons";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/types/site-content";

type Service = SiteContent["booking"]["services"][number];

/**
 * Servicios como `FeatureRow` ×6 en dos columnas (escritorio): icono Lucide por tipo, título,
 * descripción, precio «desde» si existe y acción «Agendar» (44 px). El hover revela la línea fire.
 */
export function HomeServicesSection({
  services,
  ctaHref,
  ctaLabel = "Agendar",
  className,
}: {
  services: Service[];
  ctaHref: string;
  ctaLabel?: string;
  className?: string;
}) {
  if (!services.length) {
    return null;
  }

  return (
    <Reveal as="ul" variant="stagger" className={cn("grid border-t border-line-1 md:grid-cols-2 md:gap-x-12", className)}>
      {services.map((s) => {
        const hasPrice = typeof s.priceFromCOP === "number" && s.priceFromCOP > 0;
        return (
          <RevealItem as="li" key={`${s.type}-${s.title}`} className="list-none">
            <FeatureRow
              as="article"
              icon={serviceIcon(s.type)}
              title={s.title}
              description={
                <>
                  {s.desc}
                  {hasPrice ? (
                    <span className="mt-2 block">
                      <Price amount={s.priceFromCOP as number} prefix="desde" note={s.priceNote?.trim() || undefined} size="sm" />
                    </span>
                  ) : null}
                </>
              }
              className="h-full"
              aside={
                <Button asChild variant="ghost" size="md" withArrow className="-mr-3 px-3 text-text-2 hover:text-fire-300">
                  <Link href={ctaHref} aria-label={`${ctaLabel}: ${s.title}`}>
                    {ctaLabel}
                  </Link>
                </Button>
              }
            />
          </RevealItem>
        );
      })}
    </Reveal>
  );
}
