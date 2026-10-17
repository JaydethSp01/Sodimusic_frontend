import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionCallout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-[var(--border-accent)] bg-primary/[0.06] px-4 py-3 text-sm leading-relaxed text-[var(--text-secondary)]",
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
