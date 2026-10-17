import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
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
        <section className="relative overflow-hidden px-4 py-24 sm:py-32 lg:px-8">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,107,0,0.14),transparent)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="eyebrow mx-auto justify-center text-primary">Error 404</p>
            <h1 className="display-title mt-4 text-[clamp(56px,14vw,120px)] leading-[0.9] text-foreground">
              Esa pista no existe
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--text-secondary)]">
              La página que buscas no está en nuestro catálogo o cambió de dirección. Vuelve al inicio o explora lo que sí
              está sonando.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Volver al inicio
              </Link>
              <Link
                href="/contacto"
                className="inline-flex min-h-12 items-center gap-2 rounded-md border border-border px-6 font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Compass className="h-4 w-4" aria-hidden />
                Escríbenos
              </Link>
            </div>
            <nav aria-label="Secciones" className="mt-14">
              <ul className="flex flex-wrap items-center justify-center gap-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-11 items-center rounded-full border border-border px-4 font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {l.label}
                    </Link>
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
