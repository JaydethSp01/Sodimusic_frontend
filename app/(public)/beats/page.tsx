import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { BeatsStore } from "@/features/beats/components/beats-store";
import { fetchPublic } from "@/lib/api";
import { getSiteContent } from "@/lib/site-config-server";
import { replaceCatalogTemplate } from "@/lib/site-template";
import type { Beat } from "@/types/models";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: site.beatsPage.metaTitle,
    description: site.beatsPage.metaDescription,
  };
}

export default async function BeatsPage() {
  const site = await getSiteContent();
  const res = await fetchPublic("/api/beats?pageSize=48");
  const availableRes = await fetchPublic("/api/beats?onlyAvailable=1&pageSize=1");
  const data = res.ok
    ? ((await res.json()) as { items: Beat[]; availableCount: number })
    : { items: [] as Beat[], availableCount: 0 };
  const avail = availableRes.ok ? ((await availableRes.json()) as { availableCount: number }).availableCount : 0;
  const heroDescription = replaceCatalogTemplate(site.beatsPage.heroDescriptionTemplate, { count: avail });

  return (
    <div>
      <PageHero
        eyebrow={site.beatsPage.heroEyebrow}
        title={site.beatsPage.heroTitle}
        description={heroDescription}
        backgroundImageUrl={site.beatsPage.heroImageUrl}
      />
      <BeatsStore initialItems={data.items} />
    </div>
  );
}
