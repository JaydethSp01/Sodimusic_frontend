/** Debe coincidir con CALENDAR_TZ del backend (America/Bogota por defecto). */
export const DEFAULT_CALENDAR_TIMEZONE = "America/Bogota";

export function instantToCalendarDateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${d}`;
}

export function formatCalendarDayKey(
  dayKey: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
  locale = "es",
): string {
  const d = new Date(`${dayKey}T12:00:00.000Z`);
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(d);
}

/** Suma o resta meses a `YYYY-MM` sin depender de la zona horaria del navegador. */
export function shiftCalendarMonthYm(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return ym;
  const d = new Date(Date.UTC(y, m - 1 + delta, 1, 12, 0, 0));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
