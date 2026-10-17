import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Youtube } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { ChannelCategoryChips } from "@/features/channels/components/channel-category-chips";
import { ChannelsGrid } from "@/features/channels/components/channels-grid";
import { ChannelsPagination } from "@/features/channels/components/channels-pagination";
import { ChannelsSearchForm } from "@/features/channels/components/channels-search-form";
import { CHANNELS_PAGE_SIZE, fetchChannels } from "@/features/channels/api";
import { buildChannelsHref } from "@/features/channels/hrefs";
import { getSiteContent } from "@/lib/site-config-server";

export const revalidate = 300;

type Search = { q?: string; category?: string; page?: string };

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const title = site.youtube.pageTitle?.trim() || "Canales de YouTube";
  const description = site.youtube.pageDescription?.trim() || site.youtube.sectionSubtitle;
  return {
    title,
    description,
    alternates: { canonical: "/canales" },
    openGraph: { title, description },
  };
}

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default async function ChannelsPage({ searchParams }: { searchParams: Search }) {
  const site = await getSiteContent();
  const q = searchParams.q?.trim() || undefined;
  const category = searchParams.category?.trim() || undefined;
  const page = parsePage(searchParams.page);

  const data = await fetchChannels({ q, category, page, pageSize: CHANNELS_PAGE_SIZE });
  // Las chips muestran siempre las categorías globales (y el total de «Todos»),
  // aunque el filtro actual no tenga resultados.
  const overview = q || category ? await fetchChannels({ pageSize: 1 }) : data;
  const categories = overview.categories.length ? overview.categories : data.categories;
  const totalPages = Math.max(1, Math.ceil(data.total / Math.max(1, data.pageSize || CHANNELS_PAGE_SIZE)));
  if (page > totalPages && data.total > 0) {
    redirect(buildChannelsHref({ q, category, page: totalPages }));
  }
  const filtered = Boolean(q || category);
  const youtube = site.youtube;

  return (
    <div>
      <PageHero
        eyebrow={youtube.sectionEyebrow}
        title={youtube.pageTitle?.trim() || "Canales de YouTube"}
        description={youtube.pageDescription?.trim() || undefined}
      >
        <ChannelsSearchForm initialQuery={q ?? ""} category={category} />
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8" aria-label="Listado de canales">
        {categories.length > 1 ? (
          <div className="mb-8">
            <ChannelCategoryChips
              categories={categories}
              active={category}
              q={q}
              totalAll={overview.total}
              totalActive={category ? data.total : undefined}
            />
          </div>
        ) : null}

        {data.items.length === 0 ? (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-lg border border-dashed border-border bg-background-card/50 px-6 py-14 text-center">
            <Youtube className="h-10 w-10 text-[var(--text-muted)]" aria-hidden />
            <p className="text-[var(--text-secondary)]">
              {filtered
                ? `No encontramos canales${q ? ` para «${q}»` : ""}${category ? ` en «${category}»` : ""}.`
                : "Todavía no hay canales publicados. Vuelve pronto."}
            </p>
            {filtered ? (
              <Button asChild variant="outline" className="h-11">
                <a href={buildChannelsHref({})}>Ver todos los canales</a>
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
                {data.total} {data.total === 1 ? "canal" : "canales"}
                {category ? ` · ${category}` : ""}
                {q ? ` · «${q}»` : ""}
              </p>
              {totalPages > 1 ? (
                <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
                  Página {Math.min(page, totalPages)} de {totalPages}
                </p>
              ) : null}
            </div>
            <ChannelsGrid channels={data.items} subscribeLabel={youtube.subscribeLabel} variant="grid" />
            <ChannelsPagination page={data.page} totalPages={totalPages} q={q} category={category} className="mt-12" />
          </>
        )}
      </section>
    </div>
  );
}
