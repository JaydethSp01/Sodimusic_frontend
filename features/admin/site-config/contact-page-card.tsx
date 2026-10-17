"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";
import type { SiteContact, SiteContactSubject } from "@/types/site-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionCallout } from "@/components/shared/section-callout";
import { ImageUploadField } from "@/features/admin/components/image-upload-field";
import { Field, SECTION_CARD, SubsectionTitle } from "./editor-field";

type Props = {
  contactPage: SiteContact;
  onChange: (patch: Partial<SiteContact>) => void;
};

const MAX_PRESS_PHOTOS = 6;

function slugValue(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase()
    .slice(0, 32);
}

/** Card "Contacto y prensa": textos de /contacto, asuntos del formulario y kit de prensa (EPK). */
export function ContactPageCard({ contactPage, onChange }: Props) {
  const subjects = contactPage.subjects ?? [];
  const photos = contactPage.pressPhotoUrls ?? [];

  function updateSubject(i: number, patch: Partial<SiteContactSubject>) {
    const next = subjects.map((s, j) => (j === i ? { ...s, ...patch } : s));
    onChange({ subjects: next });
  }
  function moveSubject(i: number, dir: -1 | 1) {
    const t = i + dir;
    if (t < 0 || t >= subjects.length) return;
    const next = [...subjects];
    [next[i], next[t]] = [next[t], next[i]];
    onChange({ subjects: next });
  }
  function setPhoto(i: number, url: string) {
    const next = photos.map((p, j) => (j === i ? url : p));
    onChange({ pressPhotoUrls: next });
  }

  return (
    <Card id="site-section-contact-page" className={SECTION_CARD}>
      <CardHeader>
        <CardTitle className="font-display text-xl">Contacto y prensa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionCallout>
          Textos de la página{" "}
          <Link href="/contacto" target="_blank" className="inline-flex items-center gap-1 text-primary underline underline-offset-2">
            /contacto <ExternalLink className="h-3 w-3" aria-hidden />
          </Link>
          . Los mensajes recibidos se leen en{" "}
          <Link href="/admin/dashboard/mensajes" className="inline-flex items-center gap-1 text-primary underline underline-offset-2">
            Mensajes <ExternalLink className="h-3 w-3" aria-hidden />
          </Link>
          .
        </SectionCallout>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título de la página">
            <Input value={contactPage.pageTitle} onChange={(e) => onChange({ pageTitle: e.target.value })} />
          </Field>
          <Field label="Descripción (también meta descripción)">
            <Input value={contactPage.pageDescription} onChange={(e) => onChange({ pageDescription: e.target.value })} />
          </Field>
        </div>

        <div className="space-y-3">
          <SubsectionTitle>Asuntos del formulario</SubsectionTitle>
          <p className="text-[11px] text-[var(--text-muted)]">
            La etiqueta es lo que ve la persona; el código (mayúsculas, sin espacios) es lo que se guarda con el mensaje. No
            cambies el código de un asunto ya en uso si quieres seguir filtrando por él.
          </p>
          <div className="space-y-2">
            {subjects.map((s, i) => (
              <div key={i} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                <Input
                  value={s.label}
                  aria-label="Etiqueta"
                  placeholder="Etiqueta visible"
                  onChange={(e) => {
                    const label = e.target.value;
                    updateSubject(i, s.value && s.value !== slugValue(s.label) ? { label } : { label, value: slugValue(label) });
                  }}
                />
                <Input
                  value={s.value}
                  aria-label="Código"
                  placeholder="CODIGO"
                  className="font-mono"
                  onChange={(e) => updateSubject(i, { value: slugValue(e.target.value) || e.target.value.toUpperCase() })}
                />
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Subir" disabled={i === 0} onClick={() => moveSubject(i, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Bajar"
                    disabled={i === subjects.length - 1}
                    onClick={() => moveSubject(i, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={subjects.length <= 1}
                    onClick={() => onChange({ subjects: subjects.filter((_, j) => j !== i) })}
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange({ subjects: [...subjects, { value: "OTRO_" + (subjects.length + 1), label: "Nuevo asunto" }] })}
            >
              Añadir asunto
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <SubsectionTitle>Kit de prensa (EPK)</SubsectionTitle>
          <Field label="Título del bloque">
            <Input value={contactPage.pressTitle} onChange={(e) => onChange({ pressTitle: e.target.value })} />
          </Field>
          <Field label="Bio corta para prensa" hint="Dos o tres frases: quiénes son, de dónde, qué hacen. Los medios la copian tal cual.">
            <Textarea rows={4} value={contactPage.pressBody} onChange={(e) => onChange({ pressBody: e.target.value })} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <ImageUploadField
              label="Logo para prensa"
              aspect="square"
              value={contactPage.pressLogoUrl}
              onChange={(v) => onChange({ pressLogoUrl: v })}
              hint="PNG con fondo transparente o JPG de alta resolución."
            />
            <Field label="Kit de prensa (PDF o carpeta)" hint="URL pública de un PDF, Google Drive o Dropbox con fotos, bio y logos. Opcional.">
              <Input value={contactPage.pressKitUrl} onChange={(e) => onChange({ pressKitUrl: e.target.value })} placeholder="https://…" />
            </Field>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium text-[var(--text-secondary)]">
              Fotos de prensa ({photos.length}/{MAX_PRESS_PHOTOS})
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((url, i) => (
                <div key={i} className="space-y-2 rounded-md border border-border p-3">
                  <ImageUploadField label={`Foto ${i + 1}`} aspect="square" value={url} onChange={(v) => setPhoto(i, v)} />
                  <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ pressPhotoUrls: photos.filter((_, j) => j !== i) })}>
                    Quitar foto
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={photos.length >= MAX_PRESS_PHOTOS}
              onClick={() => onChange({ pressPhotoUrls: [...photos, ""] })}
            >
              Añadir foto
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
