import type { SiteTheme } from "@/types/site-content";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-defaults";

/**
 * Tema → variables CSS. Se inyecta en `app/layout.tsx` como `<style id="site-theme">:root{…}</style>`
 * (SSR, sin parpadeo) y se reutiliza en la tarjeta del admin para la vista previa scoped.
 *
 * Derivaciones (sin dependencias; HSL propio):
 * - ink-0 = background, ink-2 = surface, ink-1 = mezcla 50/50, ink-3/ink-4 = surface aclarado +3,5 / +7,5 pt de L.
 * - fire-on: `textOnAccent` "auto" elige entre texto oscuro y claro por contraste WCAG; el oscuro es un
 *   negro teñido con el matiz del acento (hsl(h, 80 %, 7 %)) → #201704 sobre oro, #04201e sobre turquesa.
 * - duotone-b (luces del tratamiento de imagen) = acento con saturación ×0,75 y L ≤ 50 % para que las
 *   fotos no queden demasiado frías/saturadas con acentos vivos.
 */

const HEX_RE = /^#[0-9a-f]{6}$/i;

export function isHex(v: unknown): v is string {
  return typeof v === "string" && HEX_RE.test(v);
}

/** Normaliza a `#rrggbb` minúsculas; acepta `#rgb`; si no es válido devuelve `fallback`. */
export function normalizeHex(v: unknown, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const s = v.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  if (/^#[0-9a-f]{3}$/.test(s)) return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  return fallback;
}

export type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb {
  const h = normalizeHex(hex, "#000000").slice(1);
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Tripleta "r g b" para `rgb(var(--x-rgb) / <alpha>)`. */
export function hexToTriplet(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

export type Hsl = { h: number; s: number; l: number };

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rr) h = (gg - bb) / d + (gg < bb ? 6 : 0);
  else if (max === gg) h = (bb - rr) / d + 2;
  else h = (rr - gg) / d + 4;
  return { h: h * 60, s, l };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hh = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 60) [r, g, b] = [c, x, 0];
  else if (hh < 120) [r, g, b] = [x, c, 0];
  else if (hh < 180) [r, g, b] = [0, c, x];
  else if (hh < 240) [r, g, b] = [0, x, c];
  else if (hh < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** Aclara (o oscurece con `delta` negativo) en puntos de luminosidad HSL (0–1). */
export function lighten(hex: string, delta: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb({ ...hsl, l: clamp01(hsl.l + delta) }));
}

/** Mezcla lineal en RGB (`t` = 0 → a, 1 → b). */
export function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex({ r: A.r + (B.r - A.r) * t, g: A.g + (B.g - A.g) * t, b: A.b + (B.b - A.b) * t });
}

/** Luminancia relativa WCAG 2.x. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Ratio de contraste WCAG (≥ 4.5 para texto normal). */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export const LIGHT_ON_ACCENT = "#f3efe8";

/** Negro teñido con el matiz del acento: texto oscuro sobre el acento. */
export function darkOnAccent(accent: string): string {
  const { h } = rgbToHsl(hexToRgb(accent));
  return rgbToHex(hslToRgb({ h, s: 0.8, l: 0.07 }));
}

/** Color de texto sobre un acento según `textOnAccent` ("auto" = el de mayor contraste WCAG). */
export function textOnColor(accent: string, mode: SiteTheme["textOnAccent"]): string {
  const dark = darkOnAccent(accent);
  if (mode === "dark") return dark;
  if (mode === "light") return LIGHT_ON_ACCENT;
  return contrast(accent, dark) >= contrast(accent, LIGHT_ON_ACCENT) ? dark : LIGHT_ON_ACCENT;
}

/** Luces del duotono: acento desaturado (×0,75) con L ≤ 50 %. */
export function duotoneLight(accent: string): string {
  const hsl = rgbToHsl(hexToRgb(accent));
  return rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s * 0.75, l: Math.min(hsl.l, 0.5) }));
}

const TEXT_ON_MODES: SiteTheme["textOnAccent"][] = ["auto", "dark", "light"];

/** Tema saneado: cada hex inválido vuelve a su valor por defecto (el CSS inyectado nunca lleva texto libre). */
export function sanitizeTheme(theme: Partial<SiteTheme> | null | undefined): SiteTheme {
  const d = SITE_CONTENT_DEFAULTS.theme;
  const t = theme ?? {};
  const preset = t.preset;
  return {
    preset: preset === "oro" || preset === "naranja" || preset === "mar" || preset === "coral" || preset === "custom" ? preset : d.preset,
    accent: normalizeHex(t.accent, d.accent),
    accentLight: normalizeHex(t.accentLight, d.accentLight),
    accentHover: normalizeHex(t.accentHover, d.accentHover),
    accentDark: normalizeHex(t.accentDark, d.accentDark),
    secondary: normalizeHex(t.secondary, d.secondary),
    secondaryLight: normalizeHex(t.secondaryLight, d.secondaryLight),
    background: normalizeHex(t.background, d.background),
    surface: normalizeHex(t.surface, d.surface),
    footerBackground: normalizeHex(t.footerBackground, d.footerBackground),
    textOnAccent: TEXT_ON_MODES.includes(t.textOnAccent as SiteTheme["textOnAccent"]) ? (t.textOnAccent as SiteTheme["textOnAccent"]) : d.textOnAccent,
  };
}

/** Variables CSS derivadas del tema (sin `--`-prefijo en las claves: se añade al serializar). */
export function themeToVars(input: Partial<SiteTheme> | null | undefined): Record<string, string> {
  const t = sanitizeTheme(input);
  const ink0 = t.background;
  const ink2 = t.surface;
  const ink1 = mix(ink0, ink2, 0.5);
  const ink3 = lighten(ink2, 0.035);
  const ink4 = lighten(ink2, 0.075);
  const fireOn = textOnColor(t.accent, t.textOnAccent);
  const seaOn = textOnColor(t.secondary, "auto");
  const hexVars: Record<string, string> = {
    "ink-0": ink0,
    "ink-1": ink1,
    "ink-2": ink2,
    "ink-3": ink3,
    "ink-4": ink4,
    "fire-300": t.accentLight,
    "fire-400": t.accentHover,
    "fire-500": t.accent,
    "fire-600": t.accentDark,
    "fire-on": fireOn,
    "sea-400": t.secondaryLight,
    "sea-500": t.secondary,
    "sea-on": seaOn,
    "footer-bg": t.footerBackground,
  };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(hexVars)) {
    out[k] = v;
    out[`${k}-rgb`] = hexToTriplet(v);
  }
  out["duotone-b"] = duotoneLight(t.accent);
  out["line-fire"] = `rgb(${out["fire-500-rgb"]} / 0.35)`;
  out["primary-muted"] = `rgb(${out["fire-500-rgb"]} / 0.14)`;
  out["border-accent"] = `rgb(${out["fire-500-rgb"]} / 0.18)`;
  return out;
}

/** `:root{--fire-500:#…;--fire-500-rgb:25 179 166;…}` listo para `<style id="site-theme">`. */
export function themeToCss(input: Partial<SiteTheme> | null | undefined): string {
  const vars = themeToVars(input);
  const body = Object.entries(vars)
    .map(([k, v]) => `--${k}:${v}`)
    .join(";");
  return `:root{${body}}`;
}

/** Mismas variables como objeto `style` de React (`{"--fire-500": "#…"}`) para previsualizar en un contenedor. */
export function themeToStyle(input: Partial<SiteTheme> | null | undefined): Record<string, string> {
  const vars = themeToVars(input);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars)) out[`--${k}`] = v;
  return out;
}
