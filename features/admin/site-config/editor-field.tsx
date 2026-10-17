"use client";

import type { ReactNode } from "react";

export const SECTION_CARD = "scroll-mt-36 md:scroll-mt-28";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-[var(--text-muted)]">{hint}</span> : null}
    </label>
  );
}

export function SubsectionTitle({ children }: { children: ReactNode }) {
  return <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">{children}</p>;
}
