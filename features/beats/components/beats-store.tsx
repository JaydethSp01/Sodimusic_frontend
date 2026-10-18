"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Music2 } from "lucide-react";
import type { Beat, BeatLicenseType } from "@/types/models";
import type { SiteLegal } from "@/types/site-content";
import { EmptyState } from "@/components/ds/empty-state";
import { FilterBar, FilterGroup } from "@/components/ds/filter-bar";
import { LazyToaster } from "@/components/shared/lazy-toaster";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { GENRE_FILTER_VALUES } from "@/lib/constants";
import { BeatCard } from "@/features/beats/components/beat-card";
import { BeatRow } from "@/features/beats/components/beat-row";
import { BeatLicenseModal } from "@/features/beats/components/beat-license-modal";
import { BeatsViewToggle, useBeatsView } from "@/features/beats/components/beats-view-toggle";
import { beatToTrack } from "@/features/beats/components/use-beat-playback";
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

/**
 * Catálogo de beats: `FilterBar` sticky (género, mood, BPM, solo disponibles) con toggle lista/grilla
 * persistido, vista lista (`BeatRow`) o grilla (`BeatCard`), modal de licencia y formulario de interés.
 * La cola de la barra global son los beats visibles con preview, en el orden de la lista.
 */
export function BeatsStore({ initialItems, legal }: BeatsStoreProps) {
  const [genre, setGenre] = useState<string>(ALL);
  const [bpmMin, setBpmMin] = useState(60);
  const [bpmMax, setBpmMax] = useState(200);
  const [mood, setMood] = useState<string>(ALL);
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [licenseBeat, setLicenseBeat] = useState<Beat | null>(null);
  const [interest, setInterest] = useState<{ beat: Beat; licenseType: BeatLicenseType } | null>(null);
  const [view, setView] = useBeatsView();

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
  const hasFilters = genre !== ALL || mood !== ALL || onlyAvail || bpmMin !== 60 || bpmMax !== 200;

  function resetFilters() {
    setGenre(ALL);
    setMood(ALL);
    setOnlyAvail(false);
    setBpmMin(60);
    setBpmMax(200);
  }

  return (
    <div>
      <LazyToaster />
      <FilterBar
        label="Filtros de beats"
        /* Sticky solo desde lg: en móvil la barra (4 filas) taparía media pantalla. */
        className="lg:sticky lg:top-[var(--nav-h,72px)] lg:z-40 lg:bg-ink-0/85 lg:backdrop-blur-md"
        end={
          <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
            <p className="font-mono text-label text-text-3" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "beat" : "beats"}
              {ivaIncluded ? " · IVA incluido" : ""}
            </p>
            <BeatsViewToggle view={view} onChange={setView} />
          </div>
        }
      >
        <FilterGroup as="nav" label="Género" showLabel>
          <li>
            <Chip selected={genre === ALL} count={initialItems.length} onClick={() => setGenre(ALL)}>
              Todos
            </Chip>
          </li>
          {genres.map((g) => (
            <li key={g}>
              <Chip selected={genre === g} count={counts.get(g) ?? 0} onClick={() => setGenre(g)}>
                {g}
              </Chip>
            </li>
          ))}
        </FilterGroup>
        {moods.length ? (
          <FilterGroup as="nav" label="Mood" showLabel>
            <li>
              <Chip selected={mood === ALL} onClick={() => setMood(ALL)}>
                Cualquier mood
              </Chip>
            </li>
            {moods.map((m) => (
              <li key={m}>
                <Chip selected={mood === m} onClick={() => setMood(m)}>
                  {m}
                </Chip>
              </li>
            ))}
          </FilterGroup>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="hidden text-label text-text-3 lg:inline">BPM</span>
          <div className="flex items-center gap-2">
            <Label htmlFor="bpm-min" className="sr-only">
              BPM mín
            </Label>
            <Input
              id="bpm-min"
              type="number"
              inputMode="numeric"
              aria-label="BPM mín"
              className="h-11 w-20 font-mono tabular-nums"
              value={bpmMin}
              min={60}
              max={200}
              onChange={(e) => setBpmMin(Number(e.target.value) || 60)}
            />
            <span className="text-label text-text-3" aria-hidden>
              —
            </span>
            <Label htmlFor="bpm-max" className="sr-only">
              BPM máx
            </Label>
            <Input
              id="bpm-max"
              type="number"
              inputMode="numeric"
              aria-label="BPM máx"
              className="h-11 w-20 font-mono tabular-nums"
              value={bpmMax}
              min={60}
              max={200}
              onChange={(e) => setBpmMax(Number(e.target.value) || 200)}
            />
            <span className="text-label text-text-3 lg:hidden">BPM</span>
          </div>
          <label htmlFor="only-avail" className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-text-1">
            <Checkbox id="only-avail" checked={onlyAvail} onCheckedChange={(v) => setOnlyAvail(v === true)} />
            Solo disponibles
          </label>
          {hasFilters ? (
            <Button type="button" variant="link" size="sm" onClick={resetFilters}>
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      </FilterBar>

      <section className="container-page py-10 lg:py-14" aria-label="Catálogo de beats">
        {filtered.length ? (
          view === "list" ? (
            <ul className="border-t border-line-1">
              {filtered.map((beat, i) => (
                <BeatRow key={beat.id} beat={beat} ivaIncluded={ivaIncluded} priority={i < 4} queue={queue} onChooseLicense={() => setLicenseBeat(beat)} />
              ))}
            </ul>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((beat, i) => (
                <BeatCard key={beat.id} beat={beat} ivaIncluded={ivaIncluded} priority={i < 4} queue={queue} onChooseLicense={() => setLicenseBeat(beat)} />
              ))}
            </div>
          )
        ) : (
          <EmptyState
            icon={Music2}
            title="Sin beats con esos filtros"
            description="Prueba otro género o mood, o pide un beat a medida."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button type="button" variant="outline" onClick={resetFilters}>
                  Quitar filtros
                </Button>
                <Button asChild withArrow>
                  <Link href="/booking">Pedir un beat a medida</Link>
                </Button>
              </div>
            }
          />
        )}

        <Text size="body-sm" tone="3" className="mt-10 text-center">
          Condiciones de uso en la{" "}
          <Link href="/legal/licencia-beats" className="link-sweep text-fire-400">
            Licencia de beats
          </Link>
          .
        </Text>
      </section>

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
