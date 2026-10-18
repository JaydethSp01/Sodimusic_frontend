import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { getSiteContent } from "@/lib/site-config-server";

export const metadata: Metadata = {
  title: "Página no encontrada · Sodimusic",
  description: "La página que buscas no existe o fue movida.",
  robots: { index: false, follow: false },
};

/** 404 con la marca del sitio (navbar + footer) en lugar de la página genérica de Next. */
export default async function NotFound() {
  const site = await getSiteContent();
  const links = [
    { href: "/productions", label: "Producciones" },
    { href: "/beats", label: "Beats" },
    { href: "/tienda", label: site.shop.navLabel || "Tienda" },
    { href: "/canales", label: "Canales" },
    { href: "/contacto", label: "Contacto" },
  ];
  return (
    <>
      <Navbar site={site} />
      <main id="contenido-principal" className="relative z-[2]">
        <section className="relative isolate overflow-hidden bg-ink-1 py-section" aria-labelledby="not-found-title">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgb(var(--fire-500-rgb)/0.14),transparent)]"
            aria-hidden
          />
          <span
            className="text-accent pointer-events-none absolute top-4 left-1/2 -z-10 -translate-x-1/2 text-display-xl text-fire-500/10"
            aria-hidden
          >
            404
          </span>
          <div className="container-page flex flex-col items-center text-center">
            <Eyebrow align="center">Error 404</Eyebrow>
            <Heading as="h1" size="display-xl" id="not-found-title" accent="pista" className="mt-5">
              Esa pista no existe
            </Heading>
            <Text as="p" size="body-lg" tone="2" prose className="mt-6">
              La página que buscas no está en nuestro catálogo o cambió de dirección. Vuelve al inicio o explora lo que sí está
              sonando.
            </Text>
            <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
              <Button asChild size="lg">
                <Link href="/">
                  <ArrowLeft aria-hidden />
                  Volver al inicio
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contacto">
                  <Compass aria-hidden />
                  Escríbenos
                </Link>
              </Button>
            </div>
            <nav aria-label="Secciones" className="mt-14">
              <ul className="flex flex-wrap items-center justify-center gap-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Chip href={l.href} scroll>
                      {l.label}
                    </Chip>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>
      </main>
      <Footer site={site} />
    </>
  );
}
