import { cn } from "@/lib/utils";

/** Esqueleto de carga. `shape`: text (línea), media (bloque con `aspect`), circle. */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: "text" | "media" | "circle";
  aspect?: "1/1" | "4/5" | "16/9" | "3/4";
}

const ASPECT = { "1/1": "aspect-square", "4/5": "aspect-[4/5]", "16/9": "aspect-video", "3/4": "aspect-[3/4]" } as const;

function Skeleton({ className, shape = "text", aspect = "4/5", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-ink-3",
        shape === "text" && "h-4 rounded-sm",
        shape === "media" && cn("w-full rounded-lg", ASPECT[aspect]),
        shape === "circle" && "h-10 w-10 rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
