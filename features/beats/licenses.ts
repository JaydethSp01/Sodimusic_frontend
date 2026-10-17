import type { Beat, BeatLicenseType } from "@/types/models";

export interface BeatLicenseOption {
  type: BeatLicenseType;
  label: string;
  /** Explicación en una línea */
  summary: string;
  priceCOP: number;
}

const LICENSE_META: Record<BeatLicenseType, { label: string; summary: string }> = {
  MP3: { label: "MP3", summary: "Archivo MP3 320 kbps. Uso no exclusivo para demos, redes y streaming limitado." },
  WAV: { label: "WAV", summary: "WAV 24 bits sin compresión. Uso no exclusivo con mejor calidad para lanzar." },
  STEMS: { label: "Stems", summary: "Pistas separadas (stems) en WAV para mezclar a tu gusto. Uso no exclusivo." },
  EXCLUSIVE: { label: "Exclusiva", summary: "Derechos exclusivos: el beat se retira del catálogo y queda solo para ti." },
};

function priceOf(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Licencias con precio definido para un beat (las que no tienen precio se omiten).
 * Si el backend aún no envía precios por licencia, se usa `priceCOP` como MP3
 * (y como Exclusiva cuando el beat es exclusivo).
 */
export function beatLicenses(beat: Beat): BeatLicenseOption[] {
  const explicit: Array<[BeatLicenseType, number | null]> = [
    ["MP3", priceOf(beat.priceMp3COP)],
    ["WAV", priceOf(beat.priceWavCOP)],
    ["STEMS", priceOf(beat.priceStemsCOP)],
    ["EXCLUSIVE", priceOf(beat.priceExclusiveCOP)],
  ];
  const hasAny = explicit.some(([, p]) => p != null);
  const rows = hasAny
    ? explicit
    : beat.exclusive || beat.status === "EXCLUSIVE"
      ? ([["EXCLUSIVE", priceOf(beat.priceCOP)]] as Array<[BeatLicenseType, number | null]>)
      : ([["MP3", priceOf(beat.priceCOP)]] as Array<[BeatLicenseType, number | null]>);
  return rows
    .filter((r): r is [BeatLicenseType, number] => r[1] != null)
    .map(([type, priceCOP]) => ({ type, priceCOP, ...LICENSE_META[type] }));
}

/** Precio "desde": el menor entre licencias, o `priceCOP` si no hay desglose. */
export function beatPriceFrom(beat: Beat): number {
  const list = beatLicenses(beat);
  if (!list.length) {
    return beat.priceCOP;
  }
  return Math.min(...list.map((l) => l.priceCOP));
}

export function licenseLabel(type: BeatLicenseType): string {
  return LICENSE_META[type].label;
}
