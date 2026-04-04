"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

const genres = ["Todos", "Trap", "Reggaeton", "Afrobeat", "Dancehall"];
const years = ["Todos", "2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016"];
const countries = ["Todos", "Colombia", "México", "Otro"];

function PillRow({
  label,
  options,
  current,
  onPick,
  ariaLabel,
}: {
  label: string;
  options: string[];
  current: string;
  onPick: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel}>
        {options.map((opt) => {
          const active = current === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onPick(opt)}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono text-xs transition-colors duration-200",
                active
                  ? "border-primary bg-primary text-white"
                  : "border-white/10 bg-white/5 text-[var(--text-secondary)] hover:border-primary/40 hover:text-foreground",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProductionFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(sp.toString());
      if (value === "Todos" || !value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      next.delete("page");
      router.push(`/productions?${next.toString()}`);
    },
    [router, sp],
  );

  const genre = sp.get("genre") ?? "Todos";
  const year = sp.get("year") ?? "Todos";
  const country = sp.get("country") ?? "Todos";

  return (
    <div className="sticky top-[56px] z-30 border-b border-white/5 bg-black/55 py-4 backdrop-blur-md md:top-0">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 lg:px-8">
        <PillRow
          label="Género"
          options={genres}
          current={genre}
          onPick={(v) => setParam("genre", v)}
          ariaLabel="Filtrar por género"
        />
        <PillRow label="Año" options={years} current={year} onPick={(v) => setParam("year", v)} ariaLabel="Filtrar por año" />
        <PillRow
          label="País"
          options={countries}
          current={country}
          onPick={(v) => setParam("country", v)}
          ariaLabel="Filtrar por país"
        />
      </div>
    </div>
  );
}
