const copFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** `65000` → `$ 65.000` (pesos colombianos, sin decimales). */
export function formatCOP(n: number): string {
  const value = Number.isFinite(n) ? Math.round(n) : 0;
  return `$ ${copFormatter.format(value)}`;
}
