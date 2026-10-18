"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { Check } from "lucide-react";
import type { SiteTheme, SiteThemePreset } from "@/types/site-content";
import { Input } from "@/components/ui/input";
import { AdminNativeSelect } from "@/features/admin/components/admin-primitives";
import { THEME_PRESETS, THEME_PRESET_ORDER, detectThemePreset, type ThemePresetValues } from "@/lib/theme-presets";
import { contrast, isHex, themeToStyle, themeToVars } from "@/lib/theme-css";
import { cn } from "@/lib/utils";
import { EditorHint, EditorNote, EditorSection, Field, SubsectionTitle } from "./editor-field";

type Props = {
  theme: SiteTheme;
  onChange: (patch: Partial<SiteTheme>) => void;
};

const FIELDS: { key: keyof ThemePresetValues; label: string; hint?: string }[] = [
  { key: "accent", label: "Acento principal", hint: "Botones, estado activo, subrayados (fire-500)." },
  { key: "accentHover", label: "Acento hover", hint: "Hover de botones y enlaces (fire-400)." },
  { key: "accentLight", label: "Acento claro", hint: "Texto de acento sobre fondo oscuro (fire-300)." },
  { key: "accentDark", label: "Acento oscuro", hint: "Degradados y bordes (fire-600)." },
  { key: "secondary", label: "Color de apoyo", hint: "Uso puntual (≤ 10 %): etiquetas, iconos, luz de fondo." },
  { key: "secondaryLight", label: "Apoyo claro" },
  { key: "background", label: "Fondo de página" },
  { key: "surface", label: "Fondo de tarjetas", hint: "Las superficies intermedias y elevadas se derivan solas." },
  { key: "footerBackground", label: "Fondo del pie" },
];

const TEXT_ON_OPTIONS: { value: SiteTheme["textOnAccent"]; label: string }[] = [
  { value: "auto", label: "Automático (mayor contraste)" },
  { value: "dark", label: "Oscuro" },
  { value: "light", label: "Claro" },
];

/** Selector de color: `<input type="color">` + hex editable. El hex solo se aplica cuando es `#rrggbb` válido. */
function ColorField({ id, label, hint, value, onChange }: { id: string; label: string; hint?: string; value: string; onChange: (hex: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => {
    setText(value);
  }, [value]);
  const valid = isHex(text);
  const safe = isHex(value) ? value.toLowerCase() : "#000000";
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body-sm font-medium leading-none text-text-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} — selector`}
          value={safe}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          className="h-11 w-11 shrink-0 cursor-pointer rounded border border-line-2 bg-ink-3 p-1"
        />
        <Input
          id={id}
          value={text}
          spellCheck={false}
          maxLength={7}
          aria-invalid={valid ? undefined : true}
          className={cn("font-mono", !valid && "border-danger")}
          onChange={(e) => {
            const v = e.target.value.trim();
            setText(v);
            if (isHex(v)) onChange(v.toLowerCase());
          }}
        />
      </div>
      {hint ? <span className="block text-body-sm text-text-3">{hint}</span> : null}
    </div>
  );
}

/** Card «Tema y colores»: presets, colores individuales, texto sobre el acento y vista previa en vivo. */
export function ThemeCard({ theme, onChange }: Props) {
  const uid = useId();
  const style = themeToStyle(theme) as CSSProperties;
  const vars = themeToVars(theme);
  const ratio = contrast(vars["fire-500"], vars["fire-on"]);
  const ratioOk = ratio >= 4.5;

  function setField(key: keyof ThemePresetValues, hex: string) {
    const next = { ...theme, [key]: hex };
    onChange({ [key]: hex, preset: detectThemePreset(next) });
  }

  function applyPreset(key: Exclude<SiteThemePreset, "custom">) {
    onChange({ ...THEME_PRESETS[key].values, preset: key });
  }

  return (
    <EditorSection
      id="site-section-theme"
      title="Tema y colores"
      description="Paleta del sitio público y del admin: acento, color de apoyo y fondos. Se aplica al publicar; con «Vista previa» se ve el borrador."
      contentClassName="space-y-6"
    >
      <EditorNote>
        Elige un preset o ajusta cada color. El contraste del texto sobre el acento se calcula solo (modo «Automático»); el sistema avisa si
        baja de 4.5:1 (AA).
      </EditorNote>

      <div className="space-y-3">
        <SubsectionTitle>Presets</SubsectionTitle>
        <div role="group" aria-label="Presets de color" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {THEME_PRESET_ORDER.map((key) => {
            const p = THEME_PRESETS[key];
            const active = theme.preset === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => applyPreset(key)}
                className={cn(
                  "flex min-h-11 flex-col items-start gap-2 rounded border p-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-2",
                  active ? "border-fire-500/60 bg-fire-500/[0.08]" : "border-line-1 bg-ink-1/60 hover:border-line-2",
                )}
              >
                <span className="flex items-center gap-1.5" aria-hidden>
                  {[p.values.accent, p.values.accentLight, p.values.secondary, p.values.surface].map((hex, i) => (
                    <span key={i} className="h-6 w-6 rounded-full border border-white/10" style={{ backgroundColor: hex }} />
                  ))}
                  {active ? <Check className="ml-1 h-4 w-4 text-fire-400" strokeWidth={2.5} /> : null}
                </span>
                <span className="text-body-sm font-semibold text-text-1">{p.label}</span>
                <span className="text-body-sm text-text-3">{p.hint}</span>
              </button>
            );
          })}
        </div>
        <EditorHint>
          Preset actual: <span className="font-mono text-text-2">{theme.preset === "custom" ? "personalizado" : THEME_PRESETS[theme.preset].label}</span>. Al
          cambiar cualquier color pasa a «personalizado».
        </EditorHint>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="space-y-4">
          <SubsectionTitle>Colores</SubsectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <ColorField key={f.key} id={`${uid}-${f.key}`} label={f.label} hint={f.hint} value={theme[f.key]} onChange={(hex) => setField(f.key, hex)} />
            ))}
          </div>
          <Field label="Texto sobre el acento" hint="«Automático» elige oscuro o claro según el contraste WCAG con el acento principal.">
            <AdminNativeSelect value={theme.textOnAccent} onChange={(e) => onChange({ textOnAccent: e.target.value as SiteTheme["textOnAccent"] })}>
              {TEXT_ON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </AdminNativeSelect>
          </Field>
        </div>

        {/* Vista previa en vivo: las variables del formulario se aplican solo dentro de este contenedor. */}
        <div className="space-y-3">
          <SubsectionTitle>Vista previa</SubsectionTitle>
          <div data-testid="theme-preview" style={style} className="overflow-hidden rounded-lg border border-line-1 bg-ink-0 text-text-1 shadow-card">
            <div className="space-y-4 p-5">
              <p className="text-label text-fire-500">Lo último</p>
              <p className="font-display text-xl font-extrabold uppercase leading-tight tracking-display">
                Raíz en champeta, <em className="font-accent font-normal normal-case italic text-fire-300">sonido sin fronteras</em>
              </p>
              <p className="text-body-sm text-text-2">Texto secundario sobre el fondo de página.</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-11 items-center rounded bg-fire-500 px-5 font-body font-semibold text-fire-on shadow-fire">Agenda tu sesión</span>
                <span className="inline-flex h-11 items-center rounded border border-line-2 px-5 font-body font-semibold text-text-1">Ver producciones</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line-1 bg-ink-2 p-4">
                <div>
                  <p className="text-body-sm text-text-3">Beat · exclusivo</p>
                  <p className="font-mono text-lg text-fire-300">$ 350.000</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-fire-500/60 bg-fire-500/[0.14] px-3 py-1 text-body-sm text-fire-300">Trap</span>
                  <span className="rounded-full border border-line-2 px-3 py-1 text-body-sm text-text-2">Afrobeat</span>
                  <span className="rounded-full bg-sea-500 px-3 py-1 text-body-sm font-semibold text-sea-on">Nuevo</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line-1 bg-footer px-5 py-4">
              <span className="font-display font-extrabold tracking-wordmark text-text-1">SODIMUSIC</span>
              <span className="text-body-sm text-text-3">© 2026 · Pie de página</span>
            </div>
          </div>
          <p className={cn("text-body-sm", ratioOk ? "text-text-3" : "text-danger")} role="status">
            Contraste texto/acento: <span className="font-mono">{ratio.toFixed(1)}:1</span> {ratioOk ? "· cumple AA" : "· por debajo de 4.5:1, cambia el acento o el modo de texto"}
          </p>
        </div>
      </div>
    </EditorSection>
  );
}
