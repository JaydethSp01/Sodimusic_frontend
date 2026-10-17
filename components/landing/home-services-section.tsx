import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCOP } from "@/lib/format-cop";
import { serviceIcon } from "@/lib/service-icons";
import { Reveal } from "@/components/shared/reveal";
import { RevealItem } from "@/components/shared/reveal-item";
import type { SiteContent } from "@/types/site-content";

type Service = SiteContent["booking"]["services"][number];

function priceLine(s: Service): string | null {
  if (typeof s.priceFromCOP !== "number" || !(s.priceFromCOP > 0)) {
    return null;
  }
  const note = s.priceNote?.trim();
  return `Desde ${formatCOP(s.priceFromCOP)}${note ? ` · ${note}` : ""}`;
}

export function HomeServicesSection({
  services,
  ctaHref,
  ctaLabel = "Agendar",
}: {
  services: Service[];
  ctaHref: string;
  ctaLabel?: string;
}) {
  if (!services.length) {
    return null;
  }

  return (
    <Reveal as="ul" variant="stagger" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => {
        const n = String(i + 1).padStart(2, "0");
        const Icon = serviceIcon(s.type);
        const price = priceLine(s);
        return (
          <RevealItem as="li" key={`${s.type}-${s.title}`} className="h-full">
            <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background-card/70 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background-card">
              <span
                className="pointer-events-none absolute -right-3 -top-5 font-display text-[112px] leading-none text-white/[0.04] transition-colors duration-300 group-hover:text-primary/10"
                aria-hidden
              >
                {n}
              </span>
              <div className="relative flex flex-1 flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-[var(--primary-foreground)]">
                  <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="display-title mt-5 text-2xl text-foreground md:text-[28px]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{s.desc}</p>
                {price ? (
                  <p className="mt-3 font-mono text-xs uppercase tracking-wider text-[var(--gold)]">{price}</p>
                ) : null}
                <Link
                  href={ctaHref}
                  className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-sm font-medium text-foreground transition-colors hover:text-primary"
                  aria-label={`${ctaLabel}: ${s.title}`}
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>
            </article>
          </RevealItem>
        );
      })}
    </Reveal>
  );
}
