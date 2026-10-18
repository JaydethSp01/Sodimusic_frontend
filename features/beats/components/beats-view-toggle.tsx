"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

export type BeatsView = "list" | "grid";

const STORAGE_KEY = "sodimusic:beats-view";

/**
 * Vista persistida en localStorage. Sin preferencia guardada: lista en ≥ lg (densidad, BPM y precio a
 * la vista) y grilla en móvil (portada grande, play de 56 px siempre visible). SSR pinta la lista.
 */
export function useBeatsView(): [BeatsView, (v: BeatsView) => void] {
  const [view, setView] = useState<BeatsView>("list");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* almacenamiento bloqueado: usamos el valor automático */
    }
    if (stored === "list" || stored === "grid") {
      setView(stored);
    } else if (!window.matchMedia("(min-width: 1024px)").matches) {
      setView("grid");
    }
  }, []);

  function update(next: BeatsView) {
    setView(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* sin persistencia */
    }
  }

  return [view, update];
}

export function BeatsViewToggle({ view, onChange }: { view: BeatsView; onChange: (v: BeatsView) => void }) {
  return (
    <div role="group" aria-label="Vista" className="flex items-center gap-1 rounded border border-line-1 bg-ink-2 p-0.5">
      <IconButton
        aria-label="Ver en lista"
        aria-pressed={view === "list"}
        variant={view === "list" ? "secondary" : "ghost"}
        size="sm"
        pill={false}
        onClick={() => onChange("list")}
      >
        <List />
      </IconButton>
      <IconButton
        aria-label="Ver en grilla"
        aria-pressed={view === "grid"}
        variant={view === "grid" ? "secondary" : "ghost"}
        size="sm"
        pill={false}
        onClick={() => onChange("grid")}
      >
        <LayoutGrid />
      </IconButton>
    </div>
  );
}
