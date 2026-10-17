import type { Release } from "@/types/models";
import { cn } from "@/lib/utils";

type Platform = {
  key: keyof Pick<Release, "spotifyUrl" | "appleUrl" | "youtubeUrl" | "deezerUrl" | "amazonUrl" | "tidalUrl" | "soundcloudUrl">;
  label: string;
  color: string;
  icon: React.ReactNode;
};

const ICON = "h-5 w-5 shrink-0";

const PLATFORMS: Platform[] = [
  {
    key: "spotifyUrl",
    label: "Spotify",
    color: "#1DB954",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.62.62 0 0 1-.86.2c-2.35-1.43-5.3-1.76-8.78-.96a.62.62 0 1 1-.28-1.21c3.8-.87 7.07-.5 9.7 1.11.3.18.39.57.22.86zm1.22-2.72a.78.78 0 0 1-1.07.26c-2.69-1.65-6.78-2.13-9.96-1.17a.78.78 0 0 1-.45-1.49c3.63-1.1 8.14-.57 11.23 1.33.37.22.48.7.25 1.07zm.1-2.83C14.7 8.94 9.37 8.76 6.3 9.7a.94.94 0 0 1-.54-1.8c3.53-1.07 9.4-.86 13.1 1.33a.94.94 0 0 1-.95 1.62z" />
      </svg>
    ),
  },
  {
    key: "appleUrl",
    label: "Apple Music",
    color: "#FA2D48",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden>
        <path d="M16.5 2.5v11.3a3.2 3.2 0 1 1-2-2.97V6.1L9 7.4v8.4a3.2 3.2 0 1 1-2-2.97V5.2a1 1 0 0 1 .76-.97l7.5-1.9a1 1 0 0 1 1.24.97z" />
      </svg>
    ),
  },
  {
    key: "youtubeUrl",
    label: "YouTube",
    color: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden>
        <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .6 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.3-1.6.4-3.2.4-4.8s-.1-3.2-.4-4.8zM9.8 15.1V8.9L15.6 12l-5.8 3.1z" />
      </svg>
    ),
  },
  {
    key: "deezerUrl",
    label: "Deezer",
    color: "#A238FF",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden>
        <path d="M18.8 4h4.2v2.4h-4.2zM18.8 7.6h4.2V10h-4.2zM12.9 7.6h4.2V10h-4.2zM18.8 11.2h4.2v2.4h-4.2zM12.9 11.2h4.2v2.4h-4.2zM7 11.2h4.2v2.4H7zM18.8 14.8h4.2v2.4h-4.2zM12.9 14.8h4.2v2.4h-4.2zM7 14.8h4.2v2.4H7zM1 14.8h4.2v2.4H1zM18.8 18.4h4.2v2.4h-4.2zM12.9 18.4h4.2v2.4h-4.2zM7 18.4h4.2v2.4H7zM1 18.4h4.2v2.4H1z" />
      </svg>
    ),
  },
  {
    key: "amazonUrl",
    label: "Amazon Music",
    color: "#25D1DA",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 15c3.5 2.8 8.5 4 13.5 2.6 1.6-.5 3-1.2 4.5-2.3" />
        <path d="M18.5 15.5c.9-.1 2 .1 2.5.6-.1.9-.6 2-1.3 2.6" />
        <path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V11" />
        <path d="M8 8.5h3" />
        <path d="M13 11V4.5l3 1v5.5" />
      </svg>
    ),
  },
  {
    key: "tidalUrl",
    label: "Tidal",
    color: "#E6E6E6",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden>
        <path d="M4 7.3 7.3 4l3.4 3.3L7.3 10.7zM11.6 7.3 15 4l3.3 3.3-3.3 3.4zM18.3 7.3 21.6 4 24 6.4l-3.3 3.3zM7.3 10.7l3.4 3.3-3.4 3.3L4 14zM11.6 14l3.4-3.3 3.3 3.3-3.3 3.3z" transform="translate(-1 1.4)" />
      </svg>
    ),
  },
  {
    key: "soundcloudUrl",
    label: "SoundCloud",
    color: "#FF5500",
    icon: (
      <svg viewBox="0 0 24 24" className={ICON} fill="currentColor" aria-hidden>
        <path d="M1.2 13.2a.3.3 0 0 0-.3.3v2.3a.3.3 0 0 0 .6 0v-2.3a.3.3 0 0 0-.3-.3zm2 -1a.3.3 0 0 0-.3.3v4.3a.3.3 0 0 0 .6 0v-4.3a.3.3 0 0 0-.3-.3zm2-1.3a.3.3 0 0 0-.3.3v6.9a.3.3 0 0 0 .6 0v-6.9a.3.3 0 0 0-.3-.3zm2 .3a.3.3 0 0 0-.3.3v6.3a.3.3 0 0 0 .6 0v-6.3a.3.3 0 0 0-.3-.3zm2-1.5a.3.3 0 0 0-.3.3v8.1a.3.3 0 0 0 .6 0v-8.1a.3.3 0 0 0-.3-.3zm1.9-1.2a.4.4 0 0 0-.4.4V18a.4.4 0 0 0 .4.4h8.4a3.2 3.2 0 0 0 .5-6.4h-.3A5 5 0 0 0 11.1 8.5z" />
      </svg>
    ),
  },
];

interface SmartLinksProps {
  release: Release;
  /** Etiqueta personalizada para Spotify/YouTube (CMS) */
  labels?: Partial<Record<Platform["key"], string>>;
  className?: string;
}

/** Botonera de smart links: solo renderiza las plataformas con URL. */
export function SmartLinks({ release, labels, className }: SmartLinksProps) {
  const available = PLATFORMS.filter((p) => {
    const url = release[p.key];
    return typeof url === "string" && /^https?:\/\//i.test(url.trim());
  });
  if (!available.length) {
    return null;
  }
  return (
    <nav aria-label="Escuchar en plataformas" className={className}>
      <ul className="flex flex-wrap gap-3">
        {available.map((p) => {
          const url = (release[p.key] as string).trim();
          return (
            <li key={p.key}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex min-h-12 items-center gap-2.5 rounded-md border px-4 py-2.5 text-sm font-medium transition-all",
                  "hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                )}
                style={{
                  color: p.color,
                  borderColor: `color-mix(in srgb, ${p.color} 40%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${p.color} 10%, transparent)`,
                }}
                aria-label={`${labels?.[p.key] ?? p.label}: ${release.title} (se abre en una pestaña nueva)`}
              >
                {p.icon}
                {labels?.[p.key] ?? p.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
