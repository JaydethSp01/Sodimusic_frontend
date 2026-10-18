import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Fila con media 56–64 px, título, meta, datos mono a la derecha y acción.
 * Beats en escritorio, canales, admin. Con `href` el título enlaza y cubre la fila.
 */
export interface ListRowProps {
  media?: ReactNode;
  title: ReactNode;
  titleAs?: "h3" | "h4" | "p" | "span";
  meta?: ReactNode;
  /** Datos en mono (BPM, fecha, precio) alineados a la derecha. */
  data?: ReactNode;
  action?: ReactNode;
  href?: string;
  as?: "li" | "div" | "article";
  /** Fila atenuada (vendido, inactivo). */
  muted?: boolean;
  /** Fondo ink-2 (destacado). */
  highlighted?: boolean;
  /** Marca la fila como activa (p. ej. beat en reproducción). */
  active?: boolean;
  className?: string;
}

export function ListRow({
  media,
  title,
  titleAs: TitleTag = "h3",
  meta,
  data,
  action,
  href,
  as: Tag = "div",
  muted = false,
  highlighted = false,
  active = false,
  className,
}: ListRowProps) {
  return (
    <Tag
      className={cn(
        "group relative grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-x-4 border-b border-line-1 px-2 py-3 transition-colors duration-150",
        href && "cursor-pointer hover:bg-ink-2/70",
        highlighted && "bg-ink-2",
        active && "bg-fire-500/[0.06]",
        muted && "opacity-60",
        className,
      )}
      aria-current={active ? "true" : undefined}
    >
      <div className={cn("relative z-10 shrink-0", !media && "hidden")}>{media}</div>
      <div className={cn("min-w-0", !media && "col-span-2")}>
        <TitleTag className="truncate text-body font-semibold text-text-1">
          {href ? (
            <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              <span className="link-sweep">{title}</span>
            </Link>
          ) : (
            title
          )}
        </TitleTag>
        {meta ? <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-text-2">{meta}</div> : null}
      </div>
      <div className="relative z-10 flex shrink-0 items-center gap-3 sm:gap-5">
        {data ? <div className="hidden font-mono text-body-sm tabular-nums text-text-2 sm:block">{data}</div> : null}
        {action}
      </div>
    </Tag>
  );
}
