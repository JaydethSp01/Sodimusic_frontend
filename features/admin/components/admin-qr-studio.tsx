"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Copy, Download, ExternalLink, Printer, QrCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCallout } from "@/components/shared/section-callout";
import { cn } from "@/lib/utils";

const SIZES = [256, 512, 1024, 2048] as const;
type QrSize = (typeof SIZES)[number];

type QrPreset = { id: string; label: string; fg: string; bg: string };

const CLASSIC_PRESET: QrPreset = { id: "classic", label: "Negro sobre blanco", fg: "#000000", bg: "#ffffff" };

/** Preset con el acento del tema vigente (CMS → `<style id="site-theme">` → `--fire-500`). */
function buildPresets(accent: string): QrPreset[] {
  return [CLASSIC_PRESET, { id: "sodimusic", label: "Acento Sodimusic", fg: accent, bg: "#080808" }];
}

/** Lee `--fire-500` del documento (en SSR devuelve el respaldo). */
function readAccent(): string {
  if (typeof document === "undefined") return "#19b3a6";
  const v = getComputedStyle(document.documentElement).getPropertyValue("--fire-500").trim();
  return normalizeHex(v, "#19b3a6");
}

const nativeSelectClass =
  "flex h-10 w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function normalizeHex(v: string, fallback: string): string {
  const s = v.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{6}$/.test(s)) return `#${s}`;
  if (/^[0-9a-f]{3}$/.test(s)) return `#${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`;
  return fallback;
}

function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function buildQrUrl(params: {
  url: string;
  size: number;
  format: "png" | "svg";
  fg: string;
  bg: string;
  margin: number;
  download?: boolean;
}): string {
  const q = new URLSearchParams();
  q.set("url", params.url);
  q.set("size", String(params.size));
  q.set("format", params.format);
  q.set("fg", params.fg.replace(/^#/, ""));
  q.set("bg", params.bg.replace(/^#/, ""));
  q.set("margin", String(params.margin));
  if (params.download) q.set("download", "1");
  return `/api/qr?${q.toString()}`;
}

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/** Hoja de impresión: solo visible en @media print (string constante para evitar desajustes de hidratación). */
const PRINT_SHEET_CSS = `
        #sodimusic-qr-print-sheet { position: absolute; left: -99999px; top: 0; width: 1px; height: 1px; overflow: hidden; }
        @media print {
          @page { margin: 16mm; }
          body * { visibility: hidden !important; }
          #sodimusic-qr-print-sheet, #sodimusic-qr-print-sheet * { visibility: visible !important; }
          #sodimusic-qr-print-sheet {
            position: fixed; left: 0; top: 0; right: 0; bottom: 0; width: auto; height: auto; overflow: visible;
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18pt;
            background: #ffffff; color: #000000; text-align: center;
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          }
          #sodimusic-qr-print-sheet .qr-print-logo { font-size: 34pt; font-weight: 800; letter-spacing: 0.22em; }
          #sodimusic-qr-print-sheet .qr-print-label { font-size: 13pt; color: #333333; letter-spacing: 0.08em; text-transform: uppercase; }
          #sodimusic-qr-print-sheet img { width: 120mm; height: 120mm; object-fit: contain; }
          #sodimusic-qr-print-sheet .qr-print-url { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12pt; word-break: break-all; max-width: 150mm; }
        }
`;

export function AdminQrStudio({
  siteUrl,
  configuredTargetUrl,
  qrLabel,
}: {
  siteUrl: string;
  configuredTargetUrl: string;
  qrLabel?: string;
}) {
  const [url, setUrl] = useState(configuredTargetUrl || siteUrl);
  const [size, setSize] = useState<QrSize>(1024);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [margin, setMargin] = useState(2);
  const [printing, setPrinting] = useState(false);
  const [accent, setAccent] = useState("#19b3a6");
  useEffect(() => {
    setAccent(readAccent());
  }, []);
  const PRESETS = useMemo(() => buildPresets(accent), [accent]);

  const debouncedUrl = useDebounced(url.trim(), 350);
  const effectiveUrl = debouncedUrl.length ? debouncedUrl : siteUrl;
  const urlValid = isHttpUrl(effectiveUrl);

  const previewSrc = useMemo(
    () => buildQrUrl({ url: effectiveUrl, size: 512, format: "svg", fg, bg, margin }),
    [effectiveUrl, fg, bg, margin],
  );
  const printSrc = useMemo(
    () => buildQrUrl({ url: effectiveUrl, size: 1024, format: "png", fg, bg, margin }),
    [effectiveUrl, fg, bg, margin],
  );
  const pngDownload = buildQrUrl({ url: effectiveUrl, size, format: "png", fg, bg, margin, download: true });
  const svgDownload = buildQrUrl({ url: effectiveUrl, size, format: "svg", fg, bg, margin, download: true });

  const activePreset = PRESETS.find((p) => p.fg === fg && p.bg === bg)?.id ?? null;

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(effectiveUrl);
      toast.success("URL copiada al portapapeles");
    } catch {
      toast.error("No se pudo copiar. Selecciona y copia la URL manualmente.");
    }
  }

  async function print() {
    if (printing) return;
    setPrinting(true);
    try {
      const img = new Image();
      img.src = printSrc;
      await img.decode().catch(() => undefined);
      window.print();
    } finally {
      setPrinting(false);
    }
  }

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: PRINT_SHEET_CSS }} />

      <SectionCallout>
        El QR lleva a la URL indicada abajo. Si quieres cambiar la URL que usa el sitio público, edítala en{" "}
        <Link href="/admin/dashboard/site#site-section-qr" className="text-primary underline underline-offset-2">
          Sitio web → Código QR
        </Link>{" "}
        y publica: el pie de página la usará automáticamente.
      </SectionCallout>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Ajustes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--text-secondary)]">URL destino</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={siteUrl} inputMode="url" />
              {!urlValid ? (
                <p className="text-xs text-red-400">Escribe una URL completa que empiece por http:// o https://</p>
              ) : (
                <p className="text-[11px] text-[var(--text-muted)]">
                  Vacío = URL del sitio ({siteUrl}).
                  {configuredTargetUrl ? " Precargada desde «Sitio web → Código QR»." : ""}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-[var(--text-secondary)]">Presets rápidos</Label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setFg(p.fg);
                      setBg(p.bg);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                      activePreset === p.id
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border bg-background-secondary text-[var(--text-secondary)] hover:bg-background-elevated",
                    )}
                  >
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-white/10"
                      style={{ backgroundColor: p.bg }}
                      aria-hidden
                    >
                      <QrCode className="h-3.5 w-3.5" style={{ color: p.fg }} />
                    </span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Color del código (frontal)" value={fg} onChange={setFg} fallback="#000000" />
              <ColorField label="Color de fondo" value={bg} onChange={setBg} fallback="#ffffff" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--text-secondary)]">Tamaño de descarga (px)</Label>
                <select className={nativeSelectClass} value={size} onChange={(e) => setSize(Number(e.target.value) as QrSize)}>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s} × {s}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[var(--text-muted)]">Para impresión usa 1024 o 2048 (o SVG, que es vectorial).</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[var(--text-secondary)]">Margen (módulos): {margin}</Label>
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={1}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                  aria-label="Margen del código"
                />
                <p className="text-[11px] text-[var(--text-muted)]">Deja al menos 2 para que los lectores lo detecten bien.</p>
              </div>
            </div>

            {fg.toLowerCase() === bg.toLowerCase() ? (
              <p className="text-xs text-red-400">Los dos colores son iguales: el QR no se podrá leer.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Vista previa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-border"
              style={{
                backgroundColor: "#9a9a9a",
                backgroundImage:
                  "linear-gradient(45deg, rgba(255,255,255,0.18) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.18) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.18) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.18) 75%)",
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              }}
            >
              {urlValid ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={previewSrc}
                  src={previewSrc}
                  alt={`Código QR hacia ${effectiveUrl}`}
                  className="h-[85%] w-[85%] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                />
              ) : (
                <p className="px-6 text-center text-sm text-black/70">Introduce una URL válida para ver el QR.</p>
              )}
            </div>

            <p className="break-all font-mono text-[11px] text-[var(--text-muted)]">{effectiveUrl}</p>

            <div className="grid grid-cols-2 gap-2">
              <Button asChild className={cn(!urlValid && "pointer-events-none opacity-50")}>
                <a href={pngDownload} download="sodimusic-qr.png" aria-disabled={!urlValid}>
                  <Download className="h-4 w-4" aria-hidden />
                  Descargar PNG
                </a>
              </Button>
              <Button variant="secondary" asChild className={cn(!urlValid && "pointer-events-none opacity-50")}>
                <a href={svgDownload} download="sodimusic-qr.svg" aria-disabled={!urlValid}>
                  <Download className="h-4 w-4" aria-hidden />
                  Descargar SVG
                </a>
              </Button>
              <Button type="button" variant="outline" onClick={() => void copyUrl()}>
                <Copy className="h-4 w-4" aria-hidden />
                Copiar enlace
              </Button>
              <Button type="button" variant="outline" disabled={!urlValid || printing} onClick={() => void print()}>
                <Printer className="h-4 w-4" aria-hidden />
                {printing ? "Preparando…" : "Imprimir"}
              </Button>
            </div>

            <a
              href={effectiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] underline-offset-2 hover:text-primary hover:underline"
            >
              Abrir la URL destino
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </CardContent>
        </Card>
      </div>

      <div id="sodimusic-qr-print-sheet" aria-hidden>
        <div className="qr-print-logo">SODIMUSIC</div>
        {qrLabel ? <div className="qr-print-label">{qrLabel}</div> : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={printSrc} alt="" />
        <div className="qr-print-url">{effectiveUrl}</div>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  fallback,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  fallback: string;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-[var(--text-secondary)]">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-background-secondary p-1"
          aria-label={label}
        />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => onChange(normalizeHex(text, fallback))}
          onKeyDown={(e) => {
            if (e.key === "Enter") onChange(normalizeHex(text, fallback));
          }}
          className="font-mono"
          maxLength={7}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
