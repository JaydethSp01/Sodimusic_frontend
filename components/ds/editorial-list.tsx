"use client";

import * as React from "react";
import Image from "next/image";
import { FeatureRow, type FeatureRowProps } from "@/components/ds/feature-row";
import { cn } from "@/lib/utils";

/**
 * Lista editorial: filas `FeatureRow` con líneas y, en escritorio con puntero fino, una imagen flotante
 * (320×400) que sigue al cursor y cambia según la fila bajo el ratón. En móvil solo las filas.
 * `prefers-reduced-motion` desactiva el seguimiento (la imagen aparece fija a la derecha).
 */
export interface EditorialListItem extends Omit<FeatureRowProps, "as" | "className"> {
  id: string;
  imageUrl?: string | null;
  imageAlt?: string;
}

export function EditorialList({ items, className, as = "ul" }: { items: EditorialListItem[]; className?: string; as?: "ul" | "ol" | "div" }) {
  const Tag = as;
  const Row = as === "div" ? "div" : "li";
  const [active, setActive] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const target = React.useRef({ x: 0, y: 0 });
  const pos = React.useRef({ x: 0, y: 0 });
  const raf = React.useRef<number | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const host = ref.current;
    if (!host) return;
    const r = host.getBoundingClientRect();
    target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (raf.current == null) {
      const tick = () => {
        pos.current.x += (target.current.x - pos.current.x) * 0.16;
        pos.current.y += (target.current.y - pos.current.y) * 0.16;
        const img = host.querySelector<HTMLElement>("[data-float]");
        if (img) img.style.transform = `translate(${pos.current.x + 24}px, ${pos.current.y - 200}px)`;
        raf.current = Math.abs(target.current.x - pos.current.x) > 0.5 || Math.abs(target.current.y - pos.current.y) > 0.5 ? requestAnimationFrame(tick) : null;
      };
      raf.current = requestAnimationFrame(tick);
    }
  };

  React.useEffect(() => () => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
  }, []);

  const current = items.find((i) => i.id === active && i.imageUrl);
  return (
    <div ref={ref} className={cn("relative", className)} onMouseMove={onMove} onMouseLeave={() => setActive(null)}>
      <Tag className="divide-y-0">
        {items.map(({ id, imageUrl, imageAlt, ...row }) => (
          <Row key={id} onMouseEnter={() => setActive(id)} onFocus={() => setActive(id)} className="list-none">
            <FeatureRow as="div" {...row} />
          </Row>
        ))}
      </Tag>
      {/* Imagen flotante: solo escritorio con puntero fino. */}
      <div
        data-float
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-20 hidden h-[400px] w-[320px] overflow-hidden rounded-lg shadow-card transition-opacity duration-200 ease-out motion-reduce:left-auto motion-reduce:right-0 motion-reduce:top-0 motion-reduce:!transform-none lg:[@media(pointer:fine)]:block",
          current ? "opacity-100" : "opacity-0",
        )}
      >
        {items
          .filter((i) => i.imageUrl)
          .map((i) => (
            <div key={i.id} className={cn("media-duotone absolute inset-0 transition-opacity duration-200", i.id === active ? "opacity-100" : "opacity-0")}>
              <Image src={i.imageUrl as string} alt={i.imageAlt ?? ""} fill sizes="320px" quality={60} className="object-cover" />
            </div>
          ))}
      </div>
    </div>
  );
}
