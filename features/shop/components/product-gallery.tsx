"use client";

import Image from "next/image";
import { useState } from "react";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const list = images.filter((u) => typeof u === "string" && u.trim());
  const [active, setActive] = useState(0);
  const current = list[active] ?? list[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-background-card">
        {current ? (
          <Image
            key={current}
            src={resolveMediaUrl(current)}
            alt={list.length > 1 ? `${name} — imagen ${active + 1} de ${list.length}` : name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <PlaceholderCover seed={name} className="absolute inset-0" />
        )}
      </div>
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
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border transition-all sm:h-20 sm:w-20",
                i === active ? "border-primary ring-2 ring-primary/40" : "border-border opacity-70 hover:opacity-100",
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
