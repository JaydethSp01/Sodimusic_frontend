/**
 * Paleta de géneros compartida (home, booking, chips).
 * Cada `fg` cumple ≥ 4.5:1 sobre `--background` (#080808) y `--background-card` (#161616):
 * Champeta 5.7 / 5.2 · Trap 7.0 / 6.3 · Reggaeton 7.3 / 6.6 · Afrobeat 8.4 / 7.6 · Dancehall 7.7 / 6.3.
 */
export type GenreColor = { bg: string; fg: string; border: string };

export const GENRE_COLORS: Record<string, GenreColor> = {
  Champeta: { fg: "#E85D04", bg: "rgba(232, 93, 4, 0.08)", border: "rgba(232, 93, 4, 0.28)" },
  Trap: { fg: "#d9a62a", bg: "rgba(217, 166, 42, 0.07)", border: "rgba(217, 166, 42, 0.28)" },
  Reggaeton: { fg: "#B98BD1", bg: "rgba(185, 139, 209, 0.07)", border: "rgba(185, 139, 209, 0.28)" },
  Afrobeat: { fg: "#D4A017", bg: "rgba(212, 160, 23, 0.07)", border: "rgba(212, 160, 23, 0.28)" },
  Dancehall: { fg: "#3CC878", bg: "rgba(60, 200, 120, 0.07)", border: "rgba(60, 200, 120, 0.28)" },
  Otro: { fg: "#B8B2A8", bg: "rgba(255, 255, 255, 0.04)", border: "rgba(255, 255, 255, 0.14)" },
};

const normalize = (genre: string): string =>
  genre
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const LOOKUP: Record<string, GenreColor> = Object.fromEntries(
  Object.entries(GENRE_COLORS).map(([k, v]) => [normalize(k), v]),
);

/** Color del género (insensible a mayúsculas/acentos); `Otro` como respaldo. */
export function genreColor(genre: string | null | undefined): GenreColor {
  if (!genre) {
    return GENRE_COLORS.Otro;
  }
  return LOOKUP[normalize(genre)] ?? GENRE_COLORS.Otro;
}
