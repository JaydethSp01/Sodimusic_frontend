import Image from "next/image";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
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

/** Bloque EPK como tarjeta ink-2: bio corta, logo descargable, fotos de prensa y kit completo (PDF/ZIP). */
export function PressKit({ contactPage, businessName }: Props) {
  const logo = contactPage.pressLogoUrl?.trim() ? mediaSrc(contactPage.pressLogoUrl) : null;
  const photos = (contactPage.pressPhotoUrls ?? []).map((u) => u.trim()).filter(Boolean).map(mediaSrc);
  const kitUrl = contactPage.pressKitUrl?.trim() ? mediaSrc(contactPage.pressKitUrl).src : null;

  return (
    <section aria-labelledby="press-kit-title" className="rounded-lg border border-line-1 bg-ink-2 p-5 shadow-card sm:p-6">
      <div className="flex items-start gap-5">
        {logo ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-line-1 bg-ink-0">
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
        ) : null}
        <div className="min-w-0">
          <Eyebrow>EPK</Eyebrow>
          <Heading as="h2" size="display-sm" id="press-kit-title" className="mt-3">
            {contactPage.pressTitle}
          </Heading>
        </div>
      </div>
      {contactPage.pressBody ? (
        <Text as="p" size="body-sm" tone="2" className="mt-4">
          {contactPage.pressBody}
        </Text>
      ) : null}

      {logo ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line-1 pt-5">
          <div className="min-w-0">
            <Text as="p" size="body-sm" tone="1" className="font-medium">
              Logo oficial
            </Text>
            <Text as="p" size="body-sm" tone="3">
              Úsalo sin deformar ni cambiar colores.
            </Text>
          </div>
          <Button asChild variant="outline" size="sm" className="min-h-11 shrink-0">
            <a href={logo.src} download target="_blank" rel="noopener noreferrer">
              <Download aria-hidden /> Descargar
            </a>
          </Button>
        </div>
      ) : null}

      {photos.length > 0 ? (
        <div className="mt-5 border-t border-line-1 pt-5">
          <Text as="p" size="body-sm" tone="1" className="font-medium">
            Fotos de prensa
          </Text>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((p, i) => {
              return (
                <li key={`${p.src}-${i}`}>
                  <a
                    href={p.src}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded border border-line-1 bg-ink-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500"
                    aria-label={`Descargar foto de prensa ${i + 1}`}
                  >
                    <Image
                      src={p.src}
                      alt={`Foto de prensa ${i + 1} de ${businessName}`}
                      fill
                      sizes="(min-width: 640px) 160px, 45vw"
                      quality={70}
                      unoptimized={p.unoptimized}
                      className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-[linear-gradient(180deg,transparent,rgba(5,4,4,0.85))] p-2 text-label-sm text-text-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Download className="h-3.5 w-3.5" aria-hidden /> Descargar
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {kitUrl ? (
        <Button asChild size="lg" className="mt-6 w-full">
          <a href={kitUrl} target="_blank" rel="noopener noreferrer">
            <FileText aria-hidden /> Descargar kit de prensa completo
          </a>
        </Button>
      ) : null}
    </section>
  );
}
