"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Beat, BeatLicenseType } from "@/types/models";
import type { SiteLegal } from "@/types/site-content";
import { FilterChips } from "@/components/shared/filter-chips";
import { LazyToaster } from "@/components/shared/lazy-toaster";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GENRE_FILTER_VALUES } from "@/lib/constants";
import { BeatCard, beatToTrack } from "@/features/beats/components/beat-card";
import { BeatLicenseModal } from "@/features/beats/components/beat-license-modal";
import { usePlayerStore, type PlayerTrack } from "@/features/beats/stores/player-store";

/** Formulario "Me interesa" (zod + react-hook-form): se descarga solo al elegir licencia. */
const BeatInterestModal = dynamic(
  () => import("@/features/beats/components/beat-interest-modal").then((m) => m.BeatInterestModal),
  { ssr: false },
);

const ALL = "";

interface BeatsStoreProps {
  initialItems: Beat[];
  legal: Pick<SiteLegal, "businessName" | "policyVersion" | "ivaIncluded">;
}

export function BeatsStore({ initialItems, legal }: BeatsStoreProps) {
  const [genre, setGenre] = useState<string>(ALL);
  const [bpmMin, setBpmMin] = useState(60);
  const [bpmMax, setBpmMax] = useState(200);
  const [mood, setMood] = useState<string>(ALL);
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [licenseBeat, setLicenseBeat] = useState<Beat | null>(null);
  const [interest, setInterest] = useState<{ beat: Beat; licenseType: BeatLicenseType } | null>(null);

  const genres = useMemo(() => {
    const s = new Set<string>(GENRE_FILTER_VALUES);
    for (const b of initialItems) {
      if (b.genre) {
        s.add(b.genre);
      }
    }
    return Array.from(s);
  }, [initialItems]);

  const moods = useMemo(() => {
    const s = new Set<string>();
    for (const b of initialItems) {
      if (b.mood) {
        s.add(b.mood);
      }
    }
    return Array.from(s).sort();
  }, [initialItems]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of initialItems) {
      m.set(b.genre, (m.get(b.genre) ?? 0) + 1);
    }
    return m;
  }, [initialItems]);

  const filtered = useMemo(() => {
    return initialItems.filter((b) => {
      if (genre !== ALL && b.genre !== genre) {
        return false;
      }
      if (onlyAvail && b.status === "SOLD") {
        return false;
      }
      if (mood !== ALL && b.mood !== mood) {
        return false;
      }
      if (b.bpm != null && (b.bpm < bpmMin || b.bpm > bpmMax)) {
        return false;
      }
      return true;
    });
  }, [initialItems, genre, bpmMin, bpmMax, mood, onlyAvail]);

  /** Cola de la barra global: los beats visibles con preview, en el orden de la lista. */
  const queue = useMemo(() => filtered.map(beatToTrack).filter((t): t is PlayerTrack => t !== null), [filtered]);

  /* "Elegir licencia" desde la barra global abre el modal aquí (sin navegar). */
  useEffect(() => {
    const { setChooseLicenseHandler } = usePlayerStore.getState();
    setChooseLicenseHandler((id) => {
      const beat = initialItems.find((b) => b.id === id);
      if (beat && beat.status !== "SOLD") {
        setLicenseBeat(beat);
      }
    });
    return () => setChooseLicenseHandler(undefined);
  }, [initialItems]);

  /* Enlace `/beats?licencia=<id>` (p. ej. desde la barra en otra ruta): abre el modal y limpia la URL. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("licencia");
    if (!id) {
      return;
    }
    const beat = initialItems.find((b) => b.id === id);
    if (beat && beat.status !== "SOLD") {
      setLicenseBeat(beat);
    }
    params.delete("licencia");
    const qs = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
  }, [initialItems]);

  const ivaIncluded = legal.ivaIncluded ?? true;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <LazyToaster />
      <div className="mb-8 space-y-5">
        <FilterChips
          label="Género"
          chips={[{ value: ALL, label: "Todos", count: initialItems.length }, ...genres.map((g) => ({ value: g, label: g, count: counts.get(g) ?? 0 }))]}
          active={genre}
          onSelect={setGenre}
        />
        {moods.length ? (
          <FilterChips
            label="Mood"
            chips={[{ value: ALL, label: "Cualquier mood" }, ...moods.map((m) => ({ value: m, label: m }))]}
            active={mood}
            onSelect={setMood}
          />
        ) : null}
        <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-background-card p-4">
          <div className="flex gap-3">
            <div>
              <Label htmlFor="bpm-min">BPM mín</Label>
              <Input
                id="bpm-min"
                type="number"
                inputMode="numeric"
                className="mt-1 h-11 w-24"
                value={bpmMin}
                min={60}
                max={200}
                onChange={(e) => setBpmMin(Number(e.target.value) || 60)}
              />
            </div>
            <div>
              <Label htmlFor="bpm-max">BPM máx</Label>
              <Input
                id="bpm-max"
                type="number"
                inputMode="numeric"
                className="mt-1 h-11 w-24"
                value={bpmMax}
                min={60}
                max={200}
                onChange={(e) => setBpmMax(Number(e.target.value) || 200)}
              />
            </div>
          </div>
          <label htmlFor="only-avail" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground">
            <Checkbox id="only-avail" checked={onlyAvail} onCheckedChange={(v) => setOnlyAvail(v === true)} className="h-5 w-5" />
            Solo disponibles
          </label>
          <p className="ml-auto font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "beat" : "beats"}
            {ivaIncluded ? " · IVA incluido" : ""}
          </p>
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {filtered.map((beat, i) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              ivaIncluded={ivaIncluded}
              priority={i < 3}
              queue={queue}
              onChooseLicense={() => setLicenseBeat(beat)}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border px-6 py-14 text-center text-[var(--text-secondary)]">
          No hay beats con esos filtros. Prueba otro género o{" "}
          <Link href="/booking" className="text-primary underline underline-offset-2">
            pide un beat a medida
          </Link>
          .
        </p>
      )}

      <p className="mt-10 text-center text-xs leading-relaxed text-[var(--text-muted)]">
        Condiciones de uso en la{" "}
        <Link href="/legal/licencia-beats" className="text-primary underline underline-offset-2">
          Licencia de beats
        </Link>
        .
      </p>

      {licenseBeat ? (
        <BeatLicenseModal
          beat={licenseBeat}
          ivaIncluded={ivaIncluded}
          onClose={() => setLicenseBeat(null)}
          onChoose={(licenseType) => {
            setInterest({ beat: licenseBeat, licenseType });
            setLicenseBeat(null);
          }}
        />
      ) : null}
      {interest ? (
        <BeatInterestModal beat={interest.beat} licenseType={interest.licenseType} legal={legal} onClose={() => setInterest(null)} />
      ) : null}
    </div>
  );
}
