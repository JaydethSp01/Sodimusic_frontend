import type { Metadata } from "next";
import Link from "next/link";
import { FeatureRow } from "@/components/ds/feature-row";
import { HeroPage } from "@/components/ds/hero-page";
import { SectionHeader } from "@/components/ds/section-header";
import { StatItem } from "@/components/ds/stat-item";
import { FaqSection } from "@/components/shared/faq-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { BEATS_FAQ } from "@/content/faq";
import { BeatsStore } from "@/features/beats/components/beats-store";
import { beatLicenses, licenseLabel } from "@/features/beats/licenses";
import { fetchPublic } from "@/lib/api";
import { getSiteContent } from "@/lib/site-config-server";
import { replaceCatalogTemplate } from "@/lib/site-template";
import type { Beat, BeatLicenseType } from "@/types/models";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: site.beatsPage.metaTitle,
    description: site.beatsPage.metaDescription,
  };
}

const LICENSE_ORDER: BeatLicenseType[] = ["MP3", "WAV", "STEMS", "EXCLUSIVE"];

/** Precio «desde» por tipo de licencia entre los beats no vendidos (para los badges del hero). */
function licenseFloor(items: Beat[]): Array<{ type: BeatLicenseType; from: number }> {
  const min = new Map<BeatLicenseType, number>();
  for (const b of items) {
    if (b.status === "SOLD") continue;
    for (const l of beatLicenses(b)) {
      min.set(l.type, Math.min(min.get(l.type) ?? Infinity, l.priceCOP));
    }
  }
  return LICENSE_ORDER.filter((t) => min.has(t)).map((t) => ({ type: t, from: min.get(t) as number }));
}

const HOW_IT_WORKS = [
  { title: "Elige tu beat", description: "Escucha el preview completo, filtra por género, mood o BPM y compara las licencias de cada beat." },
  { title: "Paga el anticipo por WhatsApp", description: "Te escribimos para confirmar la licencia y recibes el enlace de pago. Sin intermediarios: el cierre es directo con el sello." },
  { title: "Recibe los archivos", description: "MP3, WAV o stems en tu correo en menos de 24 h, con el contrato de licencia y los créditos que debes poner." },
];

export default async function BeatsPage() {
  const site = await getSiteContent();
  const res = await fetchPublic("/api/beats?pageSize=48");
  const availableRes = await fetchPublic("/api/beats?onlyAvailable=1&pageSize=1");
  const data = res.ok
    ? ((await res.json()) as { items: Beat[]; availableCount: number })
    : { items: [] as Beat[], availableCount: 0 };
  const avail = availableRes.ok ? ((await availableRes.json()) as { availableCount: number }).availableCount : 0;
  const heroDescription = replaceCatalogTemplate(site.beatsPage.heroDescriptionTemplate, { count: avail });
  const floors = licenseFloor(data.items);

  return (
    <div>
      <HeroPage
        eyebrow={site.beatsPage.heroEyebrow}
        title={site.beatsPage.heroTitle}
        description={heroDescription}
        backgroundImageUrl={site.beatsPage.heroImageUrl}
        aside={
          <div className="flex flex-col gap-6 lg:items-end">
            <StatItem value={avail} label={avail === 1 ? "Beat disponible" : "Beats disponibles"} orientation="left" className="lg:border-l-0 lg:border-r lg:pl-0 lg:pr-4 lg:text-right" />
            {floors.length ? (
              <ul className="flex flex-col gap-2 lg:items-end" aria-label="Licencias y precio desde">
                {floors.map((f) => (
                  <li key={f.type} className="flex items-center gap-3">
                    <Badge tone={f.type === "EXCLUSIVE" ? "gold" : "fire"} size="md">
                      {licenseLabel(f.type)}
                    </Badge>
                    <Price amount={f.from} size="sm" prefix="desde" />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        }
      />
      <BeatsStore
        initialItems={data.items}
        legal={{
          businessName: site.legal?.businessName ?? "Sodimusic Company",
          policyVersion: site.legal?.policyVersion ?? "2026-10-17",
          ivaIncluded: site.legal?.ivaIncluded ?? true,
        }}
      />

      <section className="relative bg-ink-1 py-section" aria-labelledby="how-title">
        <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeader
              kicker="02"
              eyebrow="Cómo funciona"
              title="Del preview a tus archivos en tres pasos"
              accent="tres pasos"
              id="how-title"
              lead="Licencias claras, precios en COP con IVA incluido y entrega directa del sello."
              className="mb-0"
              action={
                <Button asChild variant="outline" withArrow>
                  <Link href="/legal/licencia-beats">Leer la licencia</Link>
                </Button>
              }
            />
          </div>
          <div className="border-t border-line-1 lg:col-span-7">
            {HOW_IT_WORKS.map((step, i) => (
              <FeatureRow key={step.title} index={i + 1} title={step.title} description={step.description} />
            ))}
          </div>
        </div>
      </section>

      <FaqSection
        items={BEATS_FAQ}
        subtitle="Licencias MP3, WAV, Stems y exclusiva, entrega, créditos y lo que puedes hacer con cada beat."
      />
    </div>
  );
}
