import type { ReactNode } from "react";
import { LegalNav } from "./legal-nav";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-16">
      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
        <aside className="mb-8 lg:sticky lg:top-24 lg:mb-0 lg:self-start">
          <LegalNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
