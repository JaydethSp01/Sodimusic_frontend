import type { Release } from "@/types/models";

/** Fecha de lanzamiento parseada; `null` si no existe o es inválida. */
export function parseReleaseDate(r: Pick<Release, "releaseDate">): Date | null {
  if (!r.releaseDate) {
    return null;
  }
  const d = new Date(r.releaseDate);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isFutureRelease(r: Pick<Release, "releaseDate">, now = new Date()): boolean {
  const d = parseReleaseDate(r);
  return d != null && d.getTime() > now.getTime();
}

/** Fechas guardadas como medianoche UTC (solo día) se formatean en UTC; el resto en hora de Colombia. */
function zoneFor(d: Date): string {
  const dayOnly = d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0;
  return dayOnly ? "UTC" : "America/Bogota";
}

export function formatReleaseDate(d: Date, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: zoneFor(d),
  }).format(d);
}
