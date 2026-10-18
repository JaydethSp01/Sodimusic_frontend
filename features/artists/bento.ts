/**
 * Patrón editorial 8/4 · 4/4/4 · 6/6 (7 celdas por ciclo), mismo criterio que /productions: el resto se
 * descompone en filas completas para que nunca quede una celda sola a media fila.
 */
const CYCLE = [8, 4, 4, 4, 4, 6, 6] as const;
const TAIL: Record<number, readonly number[]> = { 0: [], 1: [8], 2: [8, 4], 3: [4, 4, 4], 4: [8, 4, 6, 6], 5: [8, 4, 4, 4, 4], 6: [8, 4, 6, 6, 8, 4] };

export function bentoPattern(count: number): number[] {
  const out: number[] = [];
  let n = count;
  while (n >= CYCLE.length) {
    out.push(...CYCLE);
    n -= CYCLE.length;
  }
  out.push(...TAIL[n]);
  return out;
}

/** Props de `ProductionCard` según el ancho de celda: la ancha (8) y las medias (6) van 16/9; en móvil todas 16/9. */
export function bentoCellProps(span: number) {
  if (span === 8) {
    return { aspect: "16/9" as const, titleSize: "display-md" as const, sizes: "(max-width: 1024px) 100vw, 66vw" };
  }
  if (span === 6) {
    return { aspect: "16/9" as const, titleSize: "display-sm" as const, sizes: "(max-width: 640px) 100vw, 50vw" };
  }
  return { aspect: "4/5" as const, titleSize: "display-sm" as const, sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw", mediaClassName: "max-sm:aspect-video" };
}
