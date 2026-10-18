import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { MediaFrame, type MediaFrameProps } from "@/components/ds/media-frame";
import { cn } from "@/lib/utils";

/**
 * MediaFrame + título + meta + acción. `layout`: vertical (defecto), horizontal (fila con media a la
 * izquierda: móvil/listas) u overlay (texto sobre la imagen). Con `href` el título es el enlace y cubre
 * toda la tarjeta (`after:absolute after:inset-0`); las acciones quedan por encima (`relative z-10`).
 */
export interface MediaCardProps extends Omit<MediaFrameProps, "children" | "overlay" | "className"> {
  title: ReactNode;
  titleAs?: "h2" | "h3" | "h4" | "p";
  /** Línea de badges / datos bajo (o sobre) el título. */
  meta?: ReactNode;
  description?: ReactNode;
  /** Acción a la derecha del pie (Price, Button sm…). */
  action?: ReactNode;
  href?: string;
  layout?: "vertical" | "horizontal" | "overlay";
  as?: "article" | "li" | "div";
  className?: string;
  mediaClassName?: string;
  /** Tamaño del título en overlay (display-sm por defecto). */
  overlayTitleSize?: "display-sm" | "display-md" | "title";
}

export function MediaCard({
  title,
  titleAs = "h3",
  meta,
  description,
  action,
  href,
  layout = "vertical",
  as: Tag = "article",
  className,
  mediaClassName,
  overlayTitleSize = "display-sm",
  ...media
}: MediaCardProps) {
  const titleNode = href ? (
    <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
      <span className="link-sweep">{title}</span>
    </Link>
  ) : (
    title
  );

  if (layout === "overlay") {
    return (
      <Tag className={cn("group relative isolate overflow-hidden rounded-lg", href && "cursor-pointer", className)}>
        <MediaFrame
          {...media}
          rounded="lg"
          zoom={media.zoom ?? true}
          className={cn("h-full", mediaClassName)}
          overlay={
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                {meta ? <div className="mb-2 flex flex-wrap gap-1.5">{meta}</div> : null}
                <Heading as={titleAs} size={overlayTitleSize} className="text-text-1">
                  {titleNode}
                </Heading>
                {description ? (
                  <Text size="body-sm" tone="2" className="mt-1.5 line-clamp-2">
                    {description}
                  </Text>
                ) : null}
              </div>
              {action ? <div className="relative z-10 shrink-0">{action}</div> : null}
            </div>
          }
        />
        {href ? (
          <ArrowUpRight
            className="pointer-events-none absolute right-4 top-4 z-10 h-5 w-5 text-text-1 opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden
          />
        ) : null}
      </Tag>
    );
  }

  const horizontal = layout === "horizontal";
  return (
    <Tag
      className={cn(
        "group relative flex",
        horizontal ? "flex-row items-center gap-4" : "flex-col",
        href && "cursor-pointer",
        className,
      )}
    >
      <MediaFrame
        {...media}
        zoom={media.zoom ?? true}
        className={cn(horizontal ? "w-24 shrink-0 sm:w-28" : "w-full", mediaClassName)}
      />
      <div className={cn("flex min-w-0 flex-1 items-start justify-between gap-4", horizontal ? "" : "mt-4")}>
        <div className="min-w-0">
          <Heading as={titleAs} size="title" balance={false} className="text-text-1 transition-colors duration-150 group-hover:text-fire-300">
            {titleNode}
          </Heading>
          {meta ? <div className="mt-2 flex flex-wrap items-center gap-1.5">{meta}</div> : null}
          {description ? (
            <Text size="body-sm" tone="2" className="mt-2 line-clamp-2">
              {description}
            </Text>
          ) : null}
        </div>
        {action ? <div className="relative z-10 shrink-0">{action}</div> : null}
      </div>
    </Tag>
  );
}
