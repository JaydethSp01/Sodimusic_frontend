import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { ListRow } from "@/components/ds/list-row";
import { MediaFrame } from "@/components/ds/media-frame";
import { SectionHeader } from "@/components/ds/section-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { GenreTag } from "@/components/shared/genre-tag";
import { fetchPublic } from "@/lib/api";
import { getSiteContent } from "@/lib/site-config-server";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type { Release } from "@/types/models";
import { SmartLinks } from "../_components/smart-links";
import { ReleaseCountdown } from "../_components/release-countdown";
import { formatReleaseDate, isFutureRelease, parseReleaseDate } from "../_components/release-date";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await fetchPublic(`/api/releases/by-slug/${params.slug}`, { next: { revalidate: 120 } });
  if (!res.ok) {
    return { title: "Lanzamiento" };
  }
  const r = (await res.json()) as Release;
  const upcoming = r.upcoming === true;
  return {
    title: upcoming ? `${r.title} — Próximo lanzamiento` : r.title,
    description: r.description ?? (upcoming ? `Adelanto y previa: ${r.title} — ${r.artistName}` : `${r.title} — ${r.artistName}`),
    openGraph: r.coverUrl ? { images: [{ url: resolveMediaUrl(r.coverUrl) }] } : undefined,
  };
}

/**
 * Detalle de lanzamiento: portada 1/1 (duotono que el hover revela) pegajosa a la izquierda; a la derecha
 * eyebrow, H1 display-lg, artista, fecha en mono, cuenta regresiva si es futuro, descripción y smart links.
 */
export default async function ReleaseDetailPage({ params }: Props) {
  const site = await getSiteContent();
  const res = await fetchPublic(`/api/releases/by-slug/${params.slug}`);
  if (!res.ok) {
    notFound();
  }
  const r = (await res.json()) as Release;
  const d = site.releaseDetail;

  const listRes = await fetchPublic("/api/releases?pageSize=24", { next: { revalidate: 60 } });
  const listData = listRes.ok ? ((await listRes.json()) as { items: Release[] }) : { items: [] as Release[] };
  const more = listData.items.filter((x) => x.slug !== r.slug).slice(0, 3);

  const releaseDate = parseReleaseDate(r);
  const future = isFutureRelease(r);

  return (
    <article className="relative overflow-hidden pb-16 pt-24 lg:pb-24 lg:pt-28">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_0%_0%,rgb(var(--fire-500-rgb)/0.12),transparent)]" aria-hidden />
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <MediaFrame
              src={r.coverUrl ? resolveMediaUrl(r.coverUrl) : null}
              alt={r.coverUrl ? `Portada de ${r.title} de ${r.artistName}` : ""}
              aspect="1/1"
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              fallbackSeed={r.artistName}
              className="lg:sticky lg:top-[calc(var(--nav-h,72px)+1.5rem)]"
              badges={
                r.upcoming ? (
                  <Badge tone="gold" variant="solid">
                    {d.upcomingBadge}
                  </Badge>
                ) : undefined
              }
            />
          </div>
          <div className="lg:col-span-7">
            <Eyebrow tone="serif" size="lg">
              {future ? "Próximo lanzamiento" : "Lanzamiento"}
            </Eyebrow>
            <Heading as="h1" size="display-lg" className="mt-3">
              {r.title}
            </Heading>
            <Text size="body-lg" tone="2" className="mt-4">
              {r.artistName}
            </Text>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <GenreTag genre={r.genre} />
              {releaseDate ? (
                <span className="inline-flex items-center gap-2 font-mono text-label text-text-2">
                  <CalendarDays className="h-4 w-4 text-gold-400" strokeWidth={1.75} aria-hidden />
                  <span className="sr-only">{future ? "Sale el" : "Publicado el"} </span>
                  <time dateTime={releaseDate.toISOString()}>{formatReleaseDate(releaseDate)}</time>
                </span>
              ) : (
                <span className="font-mono text-label text-text-3">{r.upcoming ? `Previsto · ${r.releaseYear}` : r.releaseYear}</span>
              )}
            </div>
            {future && r.releaseDate ? <ReleaseCountdown target={r.releaseDate} className="mt-8" /> : null}
            {r.description ? (
              <Text size="body-lg" tone="2" prose className="mt-8">
                {r.description}
              </Text>
            ) : null}
            <SmartLinks
              release={r}
              labels={{ spotifyUrl: d.spotifyCtaLabel, youtubeUrl: r.upcoming ? d.youtubeCtaUpcoming : d.youtubeCtaReleased }}
              className="mt-10"
            />
          </div>
        </div>

        {more.length > 0 ? (
          <section className="mt-16 border-t border-line-1 pt-12 lg:mt-24" aria-labelledby="more-releases">
            <SectionHeader eyebrow="También" title={d.moreSectionTitle} id="more-releases" size="display-sm" className="mb-6" />
            <ul className="border-t border-line-1">
              {more.map((item) => {
                const itemDate = parseReleaseDate(item);
                return (
                  <ListRow
                    key={item.id}
                    as="li"
                    href={`/releases/${item.slug}`}
                    media={<Avatar name={item.artistName} src={item.coverUrl ? resolveMediaUrl(item.coverUrl) : null} size={56} square />}
                    title={item.title}
                    meta={<span>{item.artistName}</span>}
                    data={itemDate ? formatReleaseDate(itemDate, "short") : String(item.releaseYear)}
                  />
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
