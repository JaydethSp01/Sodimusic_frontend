import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import { BentoGrid } from "@/components/ds/bento-grid";
import { EmptyState } from "@/components/ds/empty-state";
import { HeroPage } from "@/components/ds/hero-page";
import { StatItem } from "@/components/ds/stat-item";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { ProductionCard } from "@/features/productions/components/production-card";
import { ProductionFilters } from "@/features/productions/components/production-filters";
import { ProductionPagination } from "@/features/productions/components/production-pagination";
import { fetchProductionFacets } from "@/features/productions/facets";
import { fetchPublic } from "@/lib/api";
import { getSiteContent } from "@/lib/site-config-server";
import { replaceCatalogTemplate } from "@/lib/site-template";
import type { Production } from "@/types/models";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: site.productionsPage.metaTitle,
    description: site.productionsPage.metaDescription,
  };
}

type SearchParams = Record<string, string | undefined>;

/**
 * Patrón editorial 8/4 · 4/4/4 · 6/6 (7 celdas por ciclo). El resto se descompone en filas completas
 * para que nunca quede una celda sola a media fila: 1 → [8] · 2 → [8,4] · 3 → [4,4,4] · 4 → [8,4,6,6] ·
 * 5 → [8,4,4,4,4] · 6 → [8,4,6,6,8,4].
 */
const CYCLE = [8, 4, 4, 4, 4, 6, 6] as const;
const TAIL: Record<number, readonly number[]> = { 0: [], 1: [8], 2: [8, 4], 3: [4, 4, 4], 4: [8, 4, 6, 6], 5: [8, 4, 4, 4, 4], 6: [8, 4, 6, 6, 8, 4] };
function bentoPattern(count: number): number[] {
  const out: number[] = [];
  let n = count;
  while (n >= CYCLE.length) {
    out.push(...CYCLE);
    n -= CYCLE.length;
  }
  out.push(...TAIL[n]);
  return out;
}

/** Props de la tarjeta según el ancho de celda: la ancha (8) y las medias (6) van 16/9; en móvil todas 16/9. */
function cellProps(span: number) {
  if (span === 8) {
    return { aspect: "16/9" as const, titleSize: "display-md" as const, sizes: "(max-width: 1024px) 100vw, 66vw" };
  }
  if (span === 6) {
    return { aspect: "16/9" as const, titleSize: "display-sm" as const, sizes: "(max-width: 640px) 100vw, 50vw" };
  }
  return { aspect: "4/5" as const, titleSize: "display-sm" as const, sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw", mediaClassName: "max-sm:aspect-video" };
}

async function ProductionGrid({ searchParams, catalogCountLineTemplate }: { searchParams: SearchParams; catalogCountLineTemplate: string }) {
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", "12");
  if (searchParams.genre) {
    params.set("genre", searchParams.genre);
  }
  if (searchParams.year) {
    params.set("year", searchParams.year);
  }
  if (searchParams.country) {
    params.set("country", searchParams.country);
  }

  const res = await fetchPublic(`/api/productions?${params.toString()}`, { next: { revalidate: 30 } });
  if (!res.ok) {
    return <EmptyState icon={Disc3} title="No se pudieron cargar las producciones" description="Inténtalo de nuevo en un momento." />;
  }
  const data = (await res.json()) as { items: Production[]; total: number; page: number; pageSize: number };

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const catalogLine = replaceCatalogTemplate(catalogCountLineTemplate, { total: data.total });
  const hasFilters = !!(searchParams.genre || searchParams.year || searchParams.country);
  const pattern = bentoPattern(data.items.length);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-label text-text-3">{catalogLine}</p>
      </div>

      {data.items.length ? (
        <BentoGrid pattern={pattern}>
          {data.items.map((p, i) => (
            <ProductionCard key={p.id} production={p} priority={page === 1 && i < 3} {...cellProps(pattern[i])} />
          ))}
        </BentoGrid>
      ) : (
        <EmptyState
          icon={Disc3}
          title="Sin resultados"
          description={hasFilters ? "Prueba con otro género, año o país." : "Pronto verás aquí nuevas producciones."}
          action={
            hasFilters ? (
              <Button asChild variant="outline">
                <Link href="/productions">Quitar filtros</Link>
              </Button>
            ) : undefined
          }
        />
      )}

      <ProductionPagination page={page} pageCount={totalPages} filters={{ genre: searchParams.genre, year: searchParams.year, country: searchParams.country }} className="mt-12" />
    </>
  );
}

export default async function ProductionsPage({ searchParams }: { searchParams: SearchParams }) {
  const [site, countRes, facets] = await Promise.all([
    getSiteContent(),
    fetchPublic("/api/productions/count", { next: { revalidate: 60 } }),
    fetchProductionFacets(),
  ]);
  const countData = countRes.ok ? ((await countRes.json()) as { total: number }) : { total: 0 };
  const heroDescription = replaceCatalogTemplate(site.productionsPage.heroDescriptionTemplate, { total: countData.total });

  return (
    <div>
      <HeroPage
        eyebrow="Catálogo"
        title={site.productionsPage.heroTitle}
        description={heroDescription}
        backgroundImageUrl={site.productionsPage.heroImageUrl}
        aside={
          <div className="grid grid-cols-2 gap-6 lg:flex lg:flex-col lg:items-end lg:gap-4">
            <StatItem value={countData.total} label="Producciones" orientation="left" className="lg:border-l-0 lg:border-r lg:pl-0 lg:pr-4 lg:text-right" />
            <StatItem value={facets.years.length ? `${Math.min(...facets.years)}–${String(Math.max(...facets.years)).slice(-2)}` : "—"} label="Años" orientation="left" className="lg:border-l-0 lg:border-r lg:pl-0 lg:pr-4 lg:text-right" />
          </div>
        }
      />
      <Suspense fallback={null}>
        <ProductionFilters years={facets.years} countries={facets.countries} />
      </Suspense>
      <section className="container-page py-12 lg:py-16" aria-label="Listado de producciones">
        <Suspense fallback={<LoadingSkeleton />}>
          <ProductionGrid searchParams={searchParams} catalogCountLineTemplate={site.productionsPage.catalogCountLineTemplate} />
        </Suspense>
      </section>
    </div>
  );
}
