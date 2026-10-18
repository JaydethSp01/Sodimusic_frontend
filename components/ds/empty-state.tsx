import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/** Estado vacío: icono grande, Heading sm, texto y acción. */
export function EmptyState({
  icon: IconComp,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-lg border border-dashed border-line-2 px-6 py-14 text-center", className)}>
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line-1 bg-ink-2 text-fire-400">
        <IconComp className="h-7 w-7" strokeWidth={1.5} aria-hidden />
      </span>
      <Heading as="p" size="display-sm" className="mt-6">
        {title}
      </Heading>
      {description ? (
        <Text size="body" tone="2" className="mt-3 container-prose">
          {description}
        </Text>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
