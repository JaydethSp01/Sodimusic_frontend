import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { BentoGrid } from "@/components/ds/bento-grid";
import { ListRow } from "@/components/ds/list-row";
import { MediaCard } from "@/components/ds/media-card";
import { MediaFrame } from "@/components/ds/media-frame";
import { cn } from "@/lib/utils";
import { ArtistMonogram } from "@/features/artists/components/artist-monogram";
import { SectionHeader } from "@/components/ds/section-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { GenreTag } from "@/components/shared/genre-tag";
import { artistPlatforms, fetchArtist, fetchArtists, spotifyArtistId } from "@/features/artists/api";
import { bentoCellProps, bentoPattern } from "@/features/artists/bento";
import { ArtistPlatformLinks } from "@/features/artists/components/artist-platform-links";
import { ArtistSpotifyEmbed } from "@/features/artists/components/artist-spotify-embed";
import { ArtistVideos } from "@/features/artists/components/artist-videos";
import { artistHref } from "@/features/artists/hrefs";
import { ProductionCard } from "@/features/productions/components/production-card";
import { SmartLinks } from "@/app/(public)/releases/_components/smart-links";
import { getSiteContent } from "@/lib/site-config-server";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await fetchArtist(params.slug);
  if (!detail) return { title: "Artista" };
  const { artist } = detail;
  const title = `${artist.name} · Sodimusic`;
  const description = artist.shortBio?.trim() || artist.bio?.split(/\n\n+/)[0]?.trim() || `${artist.name}, ${artist.role.toLowerCase()} de Sodimusic.`;
  const image = artist.photoUrl?.trim() ? resolveMediaUrl(artist.photoUrl) : undefined;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: artistHref(artist.slug) },
    openGraph: { title, description, type: "profile", ...(image ? { images: [{ url: image, alt: `Foto de ${artist.name}` }] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, ...(image ? { images: [image] } : {}) },
  };
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/**
 * Ficha de artista: hero con foto 3/4 (duotono que el hover revela) a la izquierda y, a la derecha, rol · ciudad,
 * nombre display-lg, géneros, plataformas como botones de marca y CTA. Debajo, cada sección solo si hay datos:
 * Bio · Temas (bento de producciones) · Lanzamientos · Videos (diálogo de YouTube) · Spotify (iframe perezoso).
 */
export default async function ArtistDetailPage({ params }: Props) {
  const detail = await fetchArtist(params.slug);
  if (!detail) notFound();
  const { artist, productions, releases, posts } = detail;
  const site = await getSiteContent();

  const photo = artist.photoUrl?.trim() ? resolveMediaUrl(artist.photoUrl) : null;
  const cover = artist.coverUrl?.trim() ? resolveMediaUrl(artist.coverUrl) : null;
  const paragraphs = (artist.bio ?? "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const lead = artist.shortBio?.trim() || "";
  const platforms = artistPlatforms(artist);
  const spotifyId = spotifyArtistId(artist.spotifyUrl);
  const pattern = bentoPattern(productions.length);
  const eyebrow = [artist.role, artist.city].filter((x) => x?.trim()).join(" · ");

  const others = (await fetchArtists()).filter((a) => a.id !== artist.id).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": artist.role === "Productor principal" || artist.role === "Artista" ? "Person" : "MusicGroup",
    name: artist.name,
    url: `${SITE_URL}${artistHref(artist.slug)}`,
    ...(photo ? { image: photo } : {}),
    ...(lead || paragraphs[0] ? { description: lead || paragraphs[0] } : {}),
    ...(artist.genres.length ? { genre: artist.genres } : {}),
    ...(artist.city ? { homeLocation: { "@type": "Place", name: artist.city } } : {}),
    ...(platforms.length ? { sameAs: platforms.map((p) => p.url) } : {}),
    memberOf: { "@type": "Organization", name: "Sodimusic", url: SITE_URL },
  };

  return (
    <article className="pb-16 lg:pb-24">
      <Script id={`ld-artist-${artist.id}`} type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>

      {/* Hero */}
      <header className="relative isolate overflow-hidden bg-ink-1 pb-12 pt-20 lg:pb-16 lg:pt-24" aria-labelledby="artist-title">
        {cover ? (
          <div className="media-veil pointer-events-none absolute inset-0 -z-10" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" className="h-full w-full object-cover object-center opacity-50 grayscale-[0.4]" />
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_0%_0%,rgb(var(--fire-500-rgb)/0.14),transparent)]" aria-hidden />
        )}
        <div className="section-divider absolute inset-x-0 bottom-0 z-10" aria-hidden />
        <div className="container-page relative z-10">
          <Button asChild variant="ghost" size="sm" className="-ml-4 text-label text-text-2 hover:text-fire-300">
            <Link href="/artists">
              <ArrowLeft aria-hidden />
              Artistas
            </Link>
          </Button>

          <div className={photo ? "mt-6 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16" : "mt-6 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12"}>
            {photo ? (
              <div className="lg:col-span-5">
                <MediaFrame
                  src={photo}
                  alt={`Foto de ${artist.name}`}
                  aspect="3/4"
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="shadow-card"
                  badges={artist.featured ? <Badge tone="gold" variant="solid">Destacado</Badge> : undefined}
                />
              </div>
            ) : (
              <div className="flex items-start gap-4 lg:col-span-2 lg:justify-end">
                <ArtistMonogram name={artist.name} size="lg" />
              </div>
            )}
            <div className={photo ? "min-w-0 lg:col-span-7" : "min-w-0 lg:col-span-10"}>
              {eyebrow ? (
                <Eyebrow tone="serif" size="lg" className="flex flex-wrap items-center gap-x-2">
                  <span>{artist.role}</span>
                  {artist.city ? (
                    <>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-gold-400" strokeWidth={1.75} aria-hidden />
                        {artist.city}
                      </span>
                    </>
                  ) : null}
                </Eyebrow>
              ) : null}
              <Heading as="h1" size="display-lg" id="artist-title" className={cn("relative z-10 mt-3 lg:text-balance", photo && "lg:-ml-[18%]")}>
                {artist.name}
              </Heading>
              {artist.genres.length ? (
                <ul className="mt-6 flex flex-wrap gap-2" aria-label="Géneros">
                  {artist.genres.map((g) => (
                    <li key={g}>
                      <GenreTag genre={g} />
                    </li>
                  ))}
                </ul>
              ) : null}
              {lead ? (
                <Text size="body-lg" tone="2" className="container-prose mt-6 text-balance">
                  {lead}
                </Text>
              ) : null}
              <ArtistPlatformLinks artist={artist} className="mt-8" />
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" withArrow>
                  <Link href={site.nav.ctaHref}>Agendar sesión</Link>
                </Button>
                {posts.length ? (
                  <Button asChild size="lg" variant="outline">
                    <a href="#artist-videos">Ver videos</a>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bio */}
      {paragraphs.length ? (
        <section className="container-page py-section" aria-labelledby="artist-bio">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeader kicker="01" eyebrow="Bio" title="Historia" id="artist-bio" size="display-sm" className="mb-0" />
            </div>
            <div className="container-prose lg:col-span-8">
              {paragraphs.map((p, i) => (
                <Text key={i} size="body-lg" tone={i === 0 ? "1" : "2"} className={i > 0 ? "mt-6" : undefined}>
                  {p}
                </Text>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Temas */}
      {productions.length ? (
        <section className="relative bg-ink-1 py-section" aria-labelledby="artist-tracks">
          <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
          <div className="container-page">
            <SectionHeader
              kicker="02"
              eyebrow="Temas"
              title={`Producciones de ${artist.name}`}
              id="artist-tracks"
              lead={`${productions.length} ${productions.length === 1 ? "tema producido" : "temas producidos"} con el sello.`}
              action={
                <Button asChild variant="outline" withArrow>
                  <Link href="/productions">Ver todas las producciones</Link>
                </Button>
              }
            />
            <BentoGrid pattern={pattern}>
              {productions.map((p, i) => (
                <ProductionCard key={p.id} production={p} priority={i < 2} {...bentoCellProps(pattern[i])} />
              ))}
            </BentoGrid>
          </div>
        </section>
      ) : null}

      {/* Lanzamientos */}
      {releases.length ? (
        <section className="container-page py-section" aria-labelledby="artist-releases">
          <SectionHeader kicker="03" eyebrow="Lanzamientos" title="Escúchalo donde quieras" accent="donde" id="artist-releases" />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5" aria-label={`Lanzamientos de ${artist.name}`}>
            {releases.map((r) => (
              <MediaCard
                key={r.id}
                as="li"
                aspect="1/1"
                src={r.coverUrl ? resolveMediaUrl(r.coverUrl) : null}
                alt={r.coverUrl ? `Portada de ${r.title}` : ""}
                fallbackSeed={r.artistName}
                fallbackLabel={r.artistName}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                href={`/releases/${r.slug}`}
                title={r.title}
                meta={
                  <>
                    {r.genre ? <GenreTag genre={r.genre} /> : null}
                    <span className="font-mono text-label text-text-3">{r.releaseYear}</span>
                    {/* Botonera en su propia fila (basis-full): `meta` es un div flex-wrap, nunca un <p>. */}
                    <SmartLinks release={r} size="sm" iconOnly className="mt-2 basis-full" />
                  </>
                }
              />
            ))}
          </ul>
        </section>
      ) : null}

      {/* Videos */}
      {posts.length ? (
        <section id="artist-videos" className="relative scroll-mt-[var(--nav-h,72px)] bg-ink-1 py-section" aria-labelledby="artist-videos-title">
          <div className="section-divider absolute inset-x-0 top-0" aria-hidden />
          <div className="container-page">
            <SectionHeader
              kicker="04"
              eyebrow="Videos"
              title="Lo último en video"
              accent="último"
              id="artist-videos-title"
              action={
                <Button asChild variant="outline" withArrow>
                  <Link href="/novedades">Ver novedades</Link>
                </Button>
              }
            />
            <ArtistVideos posts={posts} />
          </div>
        </section>
      ) : null}

      {/* Spotify */}
      {spotifyId ? (
        <section className="container-page py-section" aria-labelledby="artist-spotify">
          <SectionHeader kicker="05" eyebrow="Spotify" title="En Spotify" id="artist-spotify" size="display-sm" className="mb-6" />
          <ArtistSpotifyEmbed artistId={spotifyId} artistName={artist.name} />
        </section>
      ) : null}

      {/* Más artistas */}
      {others.length ? (
        <section className="container-page border-t border-line-1 pt-12 lg:pt-16" aria-labelledby="more-artists">
          <SectionHeader eyebrow="También" title="Más del sello" id="more-artists" size="display-sm" className="mb-6" />
          <ul className="border-t border-line-1">
            {others.map((a) => (
              <ListRow
                key={a.id}
                as="li"
                href={artistHref(a.slug)}
                media={<Avatar name={a.name} src={a.photoUrl ? resolveMediaUrl(a.photoUrl) : null} size={56} />}
                title={a.name}
                meta={<span>{[a.role, a.city].filter(Boolean).join(" · ")}</span>}
                data={a.genres.slice(0, 2).join(" · ")}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
