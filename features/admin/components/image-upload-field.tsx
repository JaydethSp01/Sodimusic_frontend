"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldHint } from "@/components/ui/field-hint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";
import { uploadAdminFile } from "@/app/actions/admin-upload";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;

const ASPECT_CLASS = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
} as const;

export type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  aspect?: keyof typeof ASPECT_CLASS;
  hint?: string;
  /** Placeholder del input URL */
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * Campo reutilizable de imagen: previsualización, URL manual, subida de archivo (uploadAdminFile) y botón quitar.
 * Acepta URLs absolutas o rutas `/uploads/...`.
 */
export function ImageUploadField({
  label,
  value,
  onChange,
  aspect = "video",
  hint,
  placeholder = "https://… o /uploads/…",
  className,
  disabled,
}: ImageUploadFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [broken, setBroken] = useState(false);

  const trimmed = value.trim();
  const previewSrc = trimmed.length ? resolveMediaUrl(trimmed) : null;
  const busy = uploading || disabled;

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Formato no admitido: usa JPG, PNG, WebP o GIF");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("La imagen supera los 4,5 MB");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await uploadAdminFile(fd);
      if (!r.ok || !r.url) {
        toast.error(r.error ?? "No se pudo subir la imagen");
        return;
      }
      setBroken(false);
      onChange(r.url);
      toast.success("Imagen subida (guarda para conservarla)");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={`${id}-url`}>{label}</Label>

      <div className="grid gap-3 sm:grid-cols-[132px_minmax(0,1fr)]">
        <div className={cn("relative w-full overflow-hidden rounded border border-line-1 bg-ink-1", ASPECT_CLASS[aspect], aspect === "video" && "sm:w-[132px]")}>
          {previewSrc && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={previewSrc} src={previewSrc} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-text-3">
              <ImagePlus className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              <span className="text-label-sm">{broken ? "No se pudo cargar" : "Sin imagen"}</span>
            </div>
          )}
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-0/70 text-body-sm text-fire-400" role="status">
              Subiendo…
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Input
            id={`${id}-url`}
            value={value}
            placeholder={placeholder}
            disabled={busy}
            onChange={(e) => {
              setBroken(false);
              onChange(e.target.value);
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" aria-label={`Subir archivo para ${label}`} onChange={(e) => void onFile(e)} />
            <Button type="button" size="sm" variant="secondary" disabled={busy} loading={uploading} onClick={() => inputRef.current?.click()}>
              {uploading ? null : <Upload aria-hidden />}
              {uploading ? "Subiendo…" : "Subir archivo"}
            </Button>
            {trimmed.length ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busy}
                className="text-danger hover:text-danger"
                onClick={() => {
                  setBroken(false);
                  onChange("");
                }}
              >
                <Trash2 aria-hidden />
                Quitar
              </Button>
            ) : null}
          </div>
          <FieldHint className="mt-0">{hint ?? "JPG, PNG, WebP o GIF · máximo 4,5 MB."}</FieldHint>
        </div>
      </div>
    </div>
  );
}
