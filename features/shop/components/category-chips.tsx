import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  categories: string[];
  active?: string;
}

export function CategoryChips({ categories, active }: CategoryChipsProps) {
  if (!categories.length) {
    return null;
  }
  const chips = [{ value: "", label: "Todos" }, ...categories.map((c) => ({ value: c, label: c }))];
  return (
    <nav aria-label="Categorías" className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      <ul className="flex w-max gap-2 lg:w-auto lg:flex-wrap">
        {chips.map((c) => {
          const isActive = (active ?? "") === c.value;
          return (
            <li key={c.value || "__all"}>
              <Link
                href={c.value ? `/tienda?category=${encodeURIComponent(c.value)}` : "/tienda"}
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-4 font-mono text-xs uppercase tracking-wider transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-[var(--text-secondary)] hover:border-primary/40 hover:text-foreground",
                )}
              >
                {c.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
