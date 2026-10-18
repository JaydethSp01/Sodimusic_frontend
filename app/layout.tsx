import type { Metadata } from "next";
import { Archivo, DM_Sans, Instrument_Serif, Syne_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

/**
 * Fuentes del sistema (docs/superpowers/specs/2026-10-18-sodimusic-design-language-v4.md §2.2):
 * - Display: Archivo variable con eje `wdth` (62–125) y `wght` (100–900). Se usa en mayúsculas,
 *   wdth 125 / wght 800 (`.text-display-*`). next/font no permite acotar el rango de pesos de una
 *   variable: se sirve el eje completo (un solo archivo woff2).
 * - Acento: Instrument Serif 400 regular + italic (eyebrows editoriales, citas, `<em>` en titulares).
 * - Cuerpo: DM Sans 400/500/600. Mono: Syne Mono 400 (datos).
 * Solo se hace `preload` de display y cuerpo (LCP); acento y mono se descargan sin bloquear.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-accent",
  display: "swap",
  preload: false,
});

const dmSans = DM_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const syneMono = Syne_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Sodimusic Company — Sello Urbano Afro-Caribeño | Colombia",
    template: "%s | Sodimusic Company",
  },
  description:
    "Sello discográfico independiente desde 2016 en María La Baja, Bolívar. Trap, afrobeat, reggaeton y dancehall con raíces afrocolombianas.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${archivo.variable} ${instrumentSerif.variable} ${dmSans.variable} ${syneMono.variable} min-h-screen`}
      >
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-toast focus:rounded focus:bg-fire-500 focus:px-4 focus:py-2 focus:text-fire-on"
        >
          Saltar al contenido
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
