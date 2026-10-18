import type { Metadata } from "next";
import { Archivo, DM_Sans, Instrument_Serif, Syne_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { getSiteContent } from "@/lib/site-config-server";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-defaults";
import { themeToCss } from "@/lib/theme-css";

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
  // Código de verificación de Google Search Console (método «Etiqueta HTML»): variable de entorno en Vercel.
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
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

/**
 * Tema del sitio (Admin → Sitio → «Tema y colores»). `getSiteContent()` ya respeta el borrador cuando hay
 * sesión y cookie `site_preview=draft`, así que la vista previa también cambia los colores. Si el backend
 * no responde, se inyectan los valores por defecto (los mismos que `:root` en globals.css).
 */
async function siteThemeCss(): Promise<string> {
  try {
    const site = await getSiteContent();
    return themeToCss(site.theme);
  } catch {
    return themeToCss(SITE_CONTENT_DEFAULTS.theme);
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeCss = await siteThemeCss();
  return (
    <html lang="es" className="dark">
      <body
        className={`${archivo.variable} ${instrumentSerif.variable} ${dmSans.variable} ${syneMono.variable} min-h-screen`}
      >
        {/* SSR: las variables llegan con el HTML, sin parpadeo. El contenido está saneado (solo hex/tripletas). */}
        <style id="site-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />
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
