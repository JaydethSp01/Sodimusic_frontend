import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/**
 * Fila de lista editorial: número serif + título + texto + icono/flecha, con línea inferior;
 * el hover revela una línea fire. Servicios, géneros, "cómo funciona".
 */
export interface FeatureRowProps {
  index?: number | string;
  title: ReactNode;
  titleAs?: "h3" | "h4" | "p" | "span";
  description?: ReactNode;
  icon?: LucideIcon;
  href?: string;
  /** Contenido a la derecha (Price, Badge, botón). */
  aside?: ReactNode;
  withArrow?: boolean;
  as?: "li" | "div" | "article";
  /** Tamaño del título: title (defecto) o display-sm (géneros). */
  size?: "title" | "display-sm";
  selected?: boolean;
  className?: string;
}

export function FeatureRow({
  index,
  title,
  titleAs: TitleTag = "h3",
  description,
  icon,
  href,
  aside,
  withArrow = Boolean(href),
  as: Tag = "div",
  size = "title",
  selected = false,
  className,
}: FeatureRowProps) {
  const number = typeof index === "number" ? String(index).padStart(2, "0") : index;
  return (
    <Tag
      className={cn(
        "group relative grid grid-cols-[auto_1fr_auto] items-start gap-x-4 border-b border-line-1 py-6 after:absolute after:bottom-[-1px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-fire-500 after:transition-transform after:duration-200 after:ease-out after:content-[''] hover:after:scale-x-100 sm:gap-x-6",
        selected && "after:scale-x-100",
        href && "cursor-pointer",
        className,
      )}
    >
      {number ? (
        <span aria-hidden className="text-accent w-10 pt-1 text-display-sm leading-none text-fire-500/80 sm:w-14">
          {number}
        </span>
      ) : icon ? (
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line-1 bg-ink-2 text-fire-400">
          <Icon icon={icon} size={20} />
        </span>
      ) : (
        <span className="hidden" />
      )}
      <div className="min-w-0">
        <TitleTag
          className={cn(
            size === "display-sm" ? "font-display font-extrabold text-display-sm" : "text-title",
            "text-text-1 transition-colors duration-150 group-hover:text-fire-300",
          )}
        >
          {href ? (
            <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {title}
            </Link>
          ) : (
            title
          )}
        </TitleTag>
        {description ? (
          <Text size="body" tone="2" className="mt-2 container-prose">
            {description}
          </Text>
        ) : null}
      </div>
      <div className="relative z-10 flex shrink-0 items-center gap-3 pt-1">
        {aside}
        {withArrow ? (
          <ArrowRight
            className="h-5 w-5 text-text-3 transition-[transform,color] duration-150 ease-out group-hover:translate-x-1 group-hover:text-fire-400"
            strokeWidth={1.75}
            aria-hidden
          />
        ) : null}
      </div>
    </Tag>
  );
}
