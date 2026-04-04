import type { ReactNode } from "react";

export function SectionCallout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-[var(--text-secondary)]">
      {children}
    </div>
  );
}

