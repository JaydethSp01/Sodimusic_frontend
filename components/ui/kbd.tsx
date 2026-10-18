import { cn } from "@/lib/utils";

/** Tecla (mono, radio 4). */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn("inline-flex h-6 min-w-6 items-center justify-center rounded-sm border border-line-2 bg-ink-3 px-1.5 font-mono text-label-sm text-text-2", className)}>
      {children}
    </kbd>
  );
}
