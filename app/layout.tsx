import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans, Syne_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const syneMono = Syne_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Sodimusic Company — Sello Urbano Afro-Caribeño | Colombia",
    template: "%s | Sodimusic Company",
  },
  description:
    "Sello discográfico independiente desde 2016 en María La Baja, Bolívar. Trap, afrobeat, reggaeton y dancehall con raíces afrocolombianas.",
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
