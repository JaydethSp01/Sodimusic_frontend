import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublic } from "@/lib/api";
import { getSiteContent } from "@/lib/site-config-server";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { GenreTag } from "@/components/shared/genre-tag";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import type { Release } from "@/types/models";
import { stringToHue } from "@/lib/string-to-hue";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { COVER_IMAGE_PROPS } from "@/lib/image-blur";
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
  const more = listData.items.filter((x) => x.slug !== r.slug).slice(0, 2);

  const hue = stringToHue(`${r.title}-${r.artistName}`);
  const hue2 = (hue + 40) % 360;
  const tint = `linear-gradient(135deg, hsl(${hue}, 70%, 12%) 0%, hsl(${hue2}, 45%, 6%) 100%)`;

  const releaseDate = parseReleaseDate(r);
  const future = isFutureRelease(r);

  return (
    <article className="relative overflow-hidden px-4 py-12 lg:px-8 lg:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-40 blur-3xl" style={{ background: tint }} aria-hidden />
      <div className="relative mx-auto max-w-4xl">
        {r.upcoming ? (
          <p className="mb-6 inline-flex items-center gap-2 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-[var(--gold)]">
            {d.upcomingBadge}
          </p>
        ) : null}
        <div className="grid gap-8 md:grid-cols-[minmax(0,400px)_1fr] md:items-start">
          <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-lg border border-border bg-background-card shadow-xl">
            <div className="relative aspect-square w-full">
              {r.coverUrl ? (
                <Image
                  src={resolveMediaUrl(r.coverUrl)}
                  alt={`Portada de ${r.title} de ${r.artistName}`}
                  fill
                  priority
                  {...COVER_IMAGE_PROPS}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              ) : (
                <PlaceholderCover seed={r.artistName} className="absolute inset-0" />
              )}
            </div>
          </div>
          <div>
            <h1 className="font-display text-4xl tracking-wide text-foreground md:text-5xl">{r.title}</h1>
            <p className="mt-2 text-lg text-[var(--text-secondary)]">{r.artistName}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <GenreTag genre={r.genre} />
              {releaseDate ? (
                <span className="inline-flex items-center gap-1.5 font-mono text-sm text-[var(--text-secondary)]">
                  <CalendarDays className="h-4 w-4 text-[var(--text-muted)]" aria-hidden />
                  <span className="sr-only">{future ? "Sale el" : "Publicado el"} </span>
                  <time dateTime={releaseDate.toISOString()}>{formatReleaseDate(releaseDate)}</time>
                </span>
              ) : (
                <span className="font-mono text-sm text-[var(--text-muted)]">{r.upcoming ? `Previsto · ${r.releaseYear}` : r.releaseYear}</span>
              )}
            </div>
            {future && r.releaseDate ? <ReleaseCountdown target={r.releaseDate} className="mt-5" /> : null}
            {r.description ? <p className="mt-6 max-w-prose leading-relaxed text-[var(--text-secondary)]">{r.description}</p> : null}
            <SmartLinks
              release={r}
              labels={{ spotifyUrl: d.spotifyCtaLabel, youtubeUrl: r.upcoming ? d.youtubeCtaUpcoming : d.youtubeCtaReleased }}
              className="mt-8"
            />
          </div>
        </div>

        {more.length > 0 ? (
          <section className="mt-16 border-t border-primary/10 pt-12" aria-labelledby="more-releases">
            <h2 id="more-releases" className="font-display text-2xl tracking-wide text-foreground md:text-3xl">
              {d.moreSectionTitle}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {more.map((item) => {
                const itemDate = parseReleaseDate(item);
                return (
                  <li key={item.id}>
                    <Link
                      href={`/releases/${item.slug}`}
                      className="flex gap-4 rounded-lg border border-border bg-background-card/80 p-3 transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
                        {item.coverUrl ? (
                          <Image src={resolveMediaUrl(item.coverUrl)} alt="" fill {...COVER_IMAGE_PROPS} className="object-cover" sizes="80px" />
                        ) : (
                          <PlaceholderCover seed={item.artistName} className="h-full w-full" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-body font-semibold text-foreground">{item.title}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{item.artistName}</p>
                        <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
                          {itemDate ? formatReleaseDate(itemDate, "short") : item.releaseYear}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
