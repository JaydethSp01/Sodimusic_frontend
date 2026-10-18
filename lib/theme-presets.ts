import type { SiteTheme, SiteThemePreset } from "@/types/site-content";

/**
 * Presets de color del sitio (Admin → Sitio → «Tema y colores»). Los comparten la tarjeta del admin y
 * el inyector (`lib/theme-css.ts`). Las claves se guardan en el CMS (`theme.preset`); «custom» es
 * cualquier combinación que no coincida con un preset.
 */
export type ThemePresetValues = Omit<SiteTheme, "preset" | "textOnAccent">;

export const THEME_PRESETS: Record<Exclude<SiteThemePreset, "custom">, { label: string; hint: string; values: ThemePresetValues }> = {
  mar: {
    label: "Mar Caribe",
    hint: "Turquesa con coral de apoyo. Paleta por defecto.",
    values: {
      accent: "#19b3a6",
      accentLight: "#8fe3db",
      accentHover: "#4fd1c5",
      accentDark: "#12867c",
      secondary: "#ff7a59",
      secondaryLight: "#ff9c82",
      background: "#050404",
      surface: "#131110",
      footerBackground: "#0e100f",
    },
  },
  oro: {
    label: "Oro",
    hint: "Dorado cálido con turquesa de apoyo (paleta original).",
    values: {
      accent: "#d9a62a",
      accentLight: "#f0cf7a",
      accentHover: "#e6b83a",
      accentDark: "#b3861b",
      secondary: "#19b3a6",
      secondaryLight: "#4fd1c5",
      background: "#050404",
      surface: "#131110",
      footerBackground: "#0b0a09",
    },
  },
  naranja: {
    label: "Naranja",
    hint: "Naranja pico con turquesa de apoyo.",
    values: {
      accent: "#ff6b00",
      accentLight: "#ffb380",
      accentHover: "#ff8c33",
      accentDark: "#d95a00",
      secondary: "#19b3a6",
      secondaryLight: "#4fd1c5",
      background: "#050404",
      surface: "#131110",
      footerBackground: "#0b0a09",
    },
  },
  coral: {
    label: "Coral",
    hint: "Coral tostado con turquesa de apoyo.",
    values: {
      accent: "#e85d3a",
      accentLight: "#f7a58f",
      accentHover: "#f07a5c",
      accentDark: "#c44a2b",
      secondary: "#19b3a6",
      secondaryLight: "#4fd1c5",
      background: "#050404",
      surface: "#131110",
      footerBackground: "#0b0a09",
    },
  },
};

export const THEME_PRESET_ORDER: Exclude<SiteThemePreset, "custom">[] = ["mar", "oro", "naranja", "coral"];

export const THEME_FIELD_KEYS = Object.keys(THEME_PRESETS.mar.values) as (keyof ThemePresetValues)[];

/** Devuelve el preset cuyos valores coinciden exactamente (ignorando mayúsculas) o «custom». */
export function detectThemePreset(values: ThemePresetValues): SiteThemePreset {
  for (const key of THEME_PRESET_ORDER) {
    const v = THEME_PRESETS[key].values;
    if (THEME_FIELD_KEYS.every((k) => v[k].toLowerCase() === (values[k] ?? "").toLowerCase())) return key;
  }
  return "custom";
}
