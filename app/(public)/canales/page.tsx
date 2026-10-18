import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Youtube } from "lucide-react";
import { EmptyState } from "@/components/ds/empty-state";
import { HeroPage } from "@/components/ds/hero-page";
import { StatItem } from "@/components/ds/stat-item";
import { Button } from "@/components/ui/button";
import { ChannelCategoryChips } from "@/features/channels/components/channel-category-chips";
import { ChannelsList } from "@/features/channels/components/channels-list";
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
  const countLine = `${data.total} ${data.total === 1 ? "canal" : "canales"}${category ? ` · ${category}` : ""}${q ? ` · «${q}»` : ""}`;

  return (
    <div>
      <HeroPage
        eyebrow={youtube.sectionEyebrow}
        title={youtube.pageTitle?.trim() || "Canales de YouTube"}
        description={youtube.pageDescription?.trim() || undefined}
        aside={
          overview.total ? (
            <StatItem value={overview.total} label={overview.total === 1 ? "Canal activo" : "Canales activos"} orientation="left" className="lg:border-l-0 lg:border-r lg:pl-0 lg:pr-4 lg:text-right" />
          ) : undefined
        }
      >
        <ChannelsSearchForm initialQuery={q ?? ""} category={category} />
      </HeroPage>

      {categories.length > 1 ? (
        <ChannelCategoryChips
          categories={categories}
          active={category}
          q={q}
          totalAll={overview.total}
          totalActive={category ? data.total : undefined}
        />
      ) : null}

      <section className="container-page py-12 lg:py-16" aria-label="Listado de canales">
        {data.items.length === 0 ? (
          <EmptyState
            icon={Youtube}
            title={filtered ? "Sin canales con ese filtro" : "Todavía no hay canales"}
            description={
              filtered
                ? `No encontramos canales${q ? ` para «${q}»` : ""}${category ? ` en «${category}»` : ""}.`
                : "Todavía no hay canales publicados. Vuelve pronto."
            }
            action={
              filtered ? (
                <Button asChild variant="outline">
                  <a href={buildChannelsHref({})}>Ver todos los canales</a>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-label text-text-3">{countLine}</p>
              {totalPages > 1 ? (
                <p className="font-mono text-label text-text-3">
                  Página {Math.min(page, totalPages)} de {totalPages}
                </p>
              ) : null}
            </div>
            <ChannelsList channels={data.items} subscribeLabel={youtube.subscribeLabel} />
            <ChannelsPagination page={data.page} totalPages={totalPages} q={q} category={category} className="mt-12" />
          </>
        )}
      </section>
    </div>
  );
}
