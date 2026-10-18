import type { CSSProperties } from "react";
import { ExternalLink, Facebook, Instagram, Music2, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

/** Botón outline con icono de plataforma; en hover/foco toma el color de marca de `platform`. */
export type SmartLinkPlatform =
  | "spotify"
  | "apple"
  | "youtube"
  | "deezer"
  | "amazon"
  | "tidal"
  | "soundcloud"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "other";

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.504 17.307a.75.75 0 0 1-1.031.249c-2.825-1.727-6.381-2.118-10.57-1.161a.75.75 0 1 1-.334-1.462c4.584-1.047 8.516-.596 11.686 1.342a.75.75 0 0 1 .249 1.032zm1.469-3.268a.937.937 0 0 1-1.289.309c-3.234-1.988-8.164-2.564-11.99-1.403a.938.938 0 1 1-.545-1.794c4.371-1.327 9.805-.684 13.515 1.597a.937.937 0 0 1 .309 1.291zm.126-3.403C15.23 8.332 8.83 8.12 5.127 9.244a1.125 1.125 0 1 1-.653-2.153c4.25-1.29 11.315-1.041 15.78 1.61a1.125 1.125 0 0 1-1.155 1.935z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.417 2.1-1.25 2.88-.9.86-1.98 1.35-3.1 1.26-.05-1.1.4-2.14 1.22-2.93.83-.8 2.02-1.3 3.13-1.21zM20.9 17.2c-.5 1.17-.74 1.69-1.39 2.72-.9 1.44-2.18 3.24-3.76 3.25-1.4.01-1.77-.92-3.67-.91-1.9.01-2.3.93-3.71.91-1.58-.02-2.79-1.63-3.7-3.07C2.1 16.17 1.83 11.4 3.4 8.85c1.12-1.8 2.88-2.86 4.54-2.86 1.69 0 2.75.93 4.15.93 1.36 0 2.19-.93 4.15-.93 1.48 0 3.04.8 4.15 2.19-3.65 2-3.06 7.2.51 9.02z" />
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-1.99 6.13-1.59.02 1.48-.04 2.96-.04 4.44-.98-.32-2.13-.23-2.99.37-.62.41-1.1 1.03-1.34 1.73-.2.5-.14 1.06-.13 1.59.24 1.62 1.8 2.98 3.46 2.83 1.1-.01 2.16-.65 2.73-1.59.19-.33.39-.66.4-1.05.1-1.78.06-3.55.07-5.33.01-4.01-.01-8.01.02-12.01z" />
    </svg>
  );
}

const BRAND: Record<SmartLinkPlatform, { label: string; color: string; Icon: (p: { className?: string }) => JSX.Element }> = {
  spotify: { label: "Spotify", color: "#1db954", Icon: SpotifyIcon },
  apple: { label: "Apple Music", color: "#fa5c7c", Icon: AppleIcon },
  youtube: { label: "YouTube", color: "#ff3b3b", Icon: ({ className }) => <Youtube className={className} aria-hidden /> },
  deezer: { label: "Deezer", color: "#c084fc", Icon: ({ className }) => <Music2 className={className} aria-hidden /> },
  amazon: { label: "Amazon Music", color: "#46c3d6", Icon: ({ className }) => <Music2 className={className} aria-hidden /> },
  tidal: { label: "Tidal", color: "#f3efe8", Icon: ({ className }) => <Music2 className={className} aria-hidden /> },
  soundcloud: { label: "SoundCloud", color: "#ff7a1a", Icon: ({ className }) => <Music2 className={className} aria-hidden /> },
  instagram: { label: "Instagram", color: "#e1306c", Icon: ({ className }) => <Instagram className={className} aria-hidden /> },
  tiktok: { label: "TikTok", color: "#69c9d0", Icon: TiktokIcon },
  facebook: { label: "Facebook", color: "#1877f2", Icon: ({ className }) => <Facebook className={className} aria-hidden /> },
  other: { label: "Escuchar", color: "#f0cf7a", Icon: ({ className }) => <ExternalLink className={className} aria-hidden /> },
};

export interface SmartLinkButtonProps {
  platform: SmartLinkPlatform;
  href: string;
  label?: string;
  size?: "sm" | "md";
  /** Solo icono (con `aria-label`). */
  iconOnly?: boolean;
  className?: string;
}

export function SmartLinkButton({ platform, href, label, size = "md", iconOnly = false, className }: SmartLinkButtonProps) {
  const brand = BRAND[platform];
  const text = label ?? brand.label;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={iconOnly ? `${text} (se abre en otra pestaña)` : undefined}
      style={{ "--brand": brand.color } as CSSProperties}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded border border-line-2 bg-ink-2/60 font-body font-semibold text-text-1 transition-[border-color,color,background-color] duration-150 ease-out hover:border-[var(--brand)] hover:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0",
        size === "sm" ? "h-9 text-body-sm" : "h-11 text-body",
        iconOnly ? (size === "sm" ? "w-9 px-0" : "w-11 px-0") : size === "sm" ? "px-3.5" : "px-4",
        className,
      )}
    >
      <brand.Icon className={cn("shrink-0", size === "sm" ? "h-4 w-4" : "h-5 w-5")} />
      {iconOnly ? null : <span>{text}</span>}
    </a>
  );
}
