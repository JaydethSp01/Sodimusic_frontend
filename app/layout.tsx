import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans, Syne_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

/**
 * Fuentes: `display: "swap"` en todas y solo los pesos usados en el código
 * (Bebas Neue y Syne Mono solo existen en 400; DM Sans se usa con
 * font-normal/medium/semibold → 400/500/600). Solo se hace `preload` de la
 * display principal (titulares/LCP); el resto se descarga sin bloquear.
 */
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const dmSans = DM_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: false,
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
      <body className={`${bebasNeue.variable} ${dmSans.variable} ${syneMono.variable} min-h-screen`}>
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
