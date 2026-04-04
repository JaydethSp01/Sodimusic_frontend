import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/shared/page-hero";
import { ProductionCard } from "@/features/productions/components/production-card";
import { ProductionFilters } from "@/features/productions/components/production-filters";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { fetchPublic } from "@/lib/api";
import { getSiteContent } from "@/lib/site-config-server";
import { replaceCatalogTemplate } from "@/lib/site-template";
import type { Production } from "@/types/models";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  return {
    title: site.productionsPage.metaTitle,
    description: site.productionsPage.metaDescription,
  };
}

async function ProductionGrid({
  searchParams,
  catalogCountLineTemplate,
}: {
  searchParams: Record<string, string | undefined>;
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
    return <p className="text-center text-[var(--text-secondary)]">No se pudieron cargar las producciones.</p>;
  }
  const data = (await res.json()) as {
    items: Production[];
    total: number;
    page: number;
    pageSize: number;
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const catalogLine = replaceCatalogTemplate(catalogCountLineTemplate, { total: data.total });

  return (
    <>
      <p className="mb-8 text-center font-mono text-sm text-[var(--text-muted)]">{catalogLine}</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((p) => (
          <ProductionCard key={p.id} production={p} />
        ))}
      </div>
      <div className="mt-10 flex justify-center gap-4">
        {page > 1 ? (
          <Button asChild variant="outline">
            <Link href={`/productions?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}>
              Anterior
            </Link>
          </Button>
        ) : null}
        {page < totalPages ? (
          <Button asChild variant="outline">
            <Link href={`/productions?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}>
              Siguiente
            </Link>
          </Button>
        ) : null}
      </div>
    </>
  );
}

export default async function ProductionsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const site = await getSiteContent();
  const countRes = await fetchPublic("/api/productions/count", { next: { revalidate: 60 } });
  const countData = countRes.ok ? ((await countRes.json()) as { total: number }) : { total: 0 };
  const heroDescription = replaceCatalogTemplate(site.productionsPage.heroDescriptionTemplate, {
    total: countData.total,
  });

  return (
    <div>
      <PageHero
        title={site.productionsPage.heroTitle}
        description={heroDescription}
        backgroundImageUrl={site.productionsPage.heroImageUrl}
      />
      <ProductionFilters />
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8" aria-label="Listado de producciones">
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
