import Image from "next/image";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type { SiteContact } from "@/types/site-content";

type Props = {
  contactPage: SiteContact;
  businessName: string;
};

/**
 * `/uploads/...` vive en el backend; otras rutas relativas (`/logosodi.jpeg`) son assets del frontend.
 * Devuelve la URL final y si `next/image` puede optimizarla (solo locales y uploads del backend).
 */
function mediaSrc(pathOrUrl: string): { src: string; unoptimized: boolean } {
  const v = pathOrUrl.trim();
  if (v.startsWith("/uploads/")) return { src: resolveMediaUrl(v), unoptimized: false };
  if (v.startsWith("/")) return { src: v, unoptimized: false };
  return { src: v, unoptimized: true };
}

/** Bloque EPK: bio corta, logo descargable, fotos de prensa y kit completo (PDF/ZIP). */
export function PressKit({ contactPage, businessName }: Props) {
  const logo = contactPage.pressLogoUrl?.trim() ? mediaSrc(contactPage.pressLogoUrl) : null;
  const photos = (contactPage.pressPhotoUrls ?? []).map((u) => u.trim()).filter(Boolean).map(mediaSrc);
  const kitUrl = contactPage.pressKitUrl?.trim() ? mediaSrc(contactPage.pressKitUrl).src : null;

  return (
    <section aria-labelledby="press-kit-title" className="card-surface p-6 sm:p-8">
      <p className="eyebrow">EPK</p>
      <h2 id="press-kit-title" className="display-title mt-3 text-4xl text-foreground sm:text-5xl">
        {contactPage.pressTitle}
      </h2>
      {contactPage.pressBody ? (
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">{contactPage.pressBody}</p>
      ) : null}

      {logo ? (
        <div className="mt-6 flex items-center gap-4 rounded-lg border border-border bg-background-secondary/60 p-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-black">
            <Image
              src={logo.src}
              alt={`Logo de ${businessName}`}
              fill
              sizes="80px"
              quality={70}
              unoptimized={logo.unoptimized}
              className="object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Logo oficial</p>
            <p className="text-xs text-[var(--text-muted)]">Úsalo sin deformar ni cambiar colores.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href={logo.src} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" aria-hidden /> Descargar
            </a>
          </Button>
        </div>
      ) : null}

      {photos.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-medium text-foreground">Fotos de prensa</p>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p, i) => {
              return (
                <li key={`${p.src}-${i}`}>
                  <a
                    href={p.src}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded-md border border-border bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`Descargar foto de prensa ${i + 1}`}
                  >
                    <Image
                      src={p.src}
                      alt={`Foto de prensa ${i + 1} de ${businessName}`}
                      fill
                      sizes="(min-width: 640px) 160px, 45vw"
                      quality={70}
                      unoptimized={p.unoptimized}
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Download className="h-3 w-3" aria-hidden /> Descargar
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {kitUrl ? (
        <Button asChild size="lg" className="mt-6 h-12 w-full sm:w-auto">
          <a href={kitUrl} target="_blank" rel="noopener noreferrer">
            <FileText className="h-4 w-4" aria-hidden /> Descargar kit de prensa completo
          </a>
        </Button>
      ) : null}
    </section>
  );
}
