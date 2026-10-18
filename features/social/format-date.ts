const DAY_MS = 86_400_000;

const absoluteFmt = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Bogota" });

function relativeFormatter(): Intl.RelativeTimeFormat | null {
  try {
    return typeof Intl !== "undefined" && typeof Intl.RelativeTimeFormat === "function"
      ? new Intl.RelativeTimeFormat("es", { numeric: "auto" })
      : null;
  } catch {
    return null;
  }
}

/** Fecha absoluta corta en español ("17 oct 2026"); devuelve "" si la fecha no es válida. */
export function formatSocialAbsolute(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return absoluteFmt.format(d);
}

/**
 * Fecha relativa en español: "hoy", "ayer", "hace 2 días", "hace 3 semanas",
 * "hace 2 meses". A partir de un año (o sin `Intl.RelativeTimeFormat`) devuelve
 * la fecha absoluta. Fechas futuras (desfase de reloj) se tratan como "hoy".
 */
export function formatSocialRelative(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const rtf = relativeFormatter();
  if (!rtf) return formatSocialAbsolute(iso);

  const diffDays = Math.floor((now.getTime() - d.getTime()) / DAY_MS);
  if (diffDays <= 0) return rtf.format(0, "day"); // "hoy"
  if (diffDays === 1) return rtf.format(-1, "day"); // "ayer"
  if (diffDays < 7) return rtf.format(-diffDays, "day");
  if (diffDays < 30) return rtf.format(-Math.floor(diffDays / 7), "week");
  if (diffDays < 365) return rtf.format(-Math.max(1, Math.floor(diffDays / 30)), "month");
  return formatSocialAbsolute(iso);
}
