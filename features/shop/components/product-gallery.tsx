"use client";

import Image from "next/image";
import { useState } from "react";
import { MediaFrame } from "@/components/ds/media-frame";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

/** Galería 1/1 (sin duotono: el color del producto manda) con miniaturas de 64/80 px. */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const list = images.filter((u) => typeof u === "string" && u.trim());
  const [active, setActive] = useState(0);
  const current = list[active] ?? list[0];

  return (
    <div className="space-y-3">
      <MediaFrame
        key={current ?? "placeholder"}
        src={current ? resolveMediaUrl(current) : null}
        alt={list.length > 1 ? `${name} — imagen ${active + 1} de ${list.length}` : name}
        aspect="1/1"
        treatment="none"
        priority
        quality={80}
        sizes="(max-width: 1024px) 100vw, 50vw"
        fallbackSeed={name}
        className="shadow-card"
      />
      {list.length > 1 ? (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1" role="tablist" aria-label={`Imágenes de ${name}`}>
          {list.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Ver imagen ${i + 1} de ${list.length}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded border bg-ink-2 transition-[border-color,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0 sm:h-20 sm:w-20",
                i === active ? "border-fire-500" : "border-line-1 opacity-70 hover:opacity-100",
              )}
            >
              <Image src={resolveMediaUrl(img)} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
