import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { ProductionCard } from "@/features/productions/components/production-card";
import { ProductionFilters } from "@/features/productions/components/production-filters";
import { fetchProductionFacets } from "@/features/productions/facets";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
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

function pageHref(searchParams: SearchParams, page: number): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v && k !== "page") {
      next.set(k, v);
    }
  }
  if (page > 1) {
    next.set("page", String(page));
  }
  const qs = next.toString();
  return qs ? `/productions?${qs}` : "/productions";
}

async function ProductionGrid({
  searchParams,
  catalogCountLineTemplate,
}: {
  searchParams: SearchParams;
  catalogCountLineTemplate: string;
}) {
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
    return (
      <p className="rounded-lg border border-dashed border-border px-6 py-12 text-center text-[var(--text-secondary)]">
        No se pudieron cargar las producciones.
      </p>
    );
  }
  const data = (await res.json()) as {
    items: Production[];
    total: number;
    page: number;
    pageSize: number;
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const catalogLine = replaceCatalogTemplate(catalogCountLineTemplate, { total: data.total });
  const hasFilters = !!(searchParams.genre || searchParams.year || searchParams.country);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{catalogLine}</p>
        {totalPages > 1 ? (
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Página {page} de {totalPages}
          </p>
        ) : null}
      </div>

      {data.items.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((p, i) => (
            <ProductionCard key={p.id} production={p} priority={page === 1 && i < 3} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border px-6 py-14 text-center">
          <p className="display-title text-3xl text-foreground">Sin resultados</p>
          <p className="mt-2 text-[var(--text-secondary)]">
            {hasFilters ? "Prueba con otro género, año o país." : "Pronto verás aquí nuevas producciones."}
          </p>
          {hasFilters ? (
            <Button asChild variant="outline" className="mt-6 h-11">
              <Link href="/productions">Quitar filtros</Link>
            </Button>
          ) : null}
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Paginación">
          <Button asChild variant="outline" className="h-11">
            {page > 1 ? (
              <Link href={pageHref(searchParams, page - 1)} rel="prev">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Anterior
              </Link>
            ) : (
              <span aria-disabled className="pointer-events-none opacity-40">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Anterior
              </span>
            )}
          </Button>
          <Button asChild variant="outline" className="h-11">
            {page < totalPages ? (
              <Link href={pageHref(searchParams, page + 1)} rel="next">
                Siguiente
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <span aria-disabled className="pointer-events-none opacity-40">
                Siguiente
                <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            )}
          </Button>
        </nav>
      ) : null}
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
  const heroDescription = replaceCatalogTemplate(site.productionsPage.heroDescriptionTemplate, {
    total: countData.total,
  });

  return (
    <div>
      <PageHero
        eyebrow="Catálogo"
        title={site.productionsPage.heroTitle}
        description={heroDescription}
        backgroundImageUrl={site.productionsPage.heroImageUrl}
      />
      <Suspense fallback={null}>
        <ProductionFilters years={facets.years} countries={facets.countries} />
      </Suspense>
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16" aria-label="Listado de producciones">
        <Suspense fallback={<LoadingSkeleton />}>
          <ProductionGrid
            searchParams={searchParams}
            catalogCountLineTemplate={site.productionsPage.catalogCountLineTemplate}
          />
        </Suspense>
      </section>
    </div>
  );
}
