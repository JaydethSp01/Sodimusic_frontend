"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type { SiteContent, SiteHomeLatestSource, SiteTestimonial } from "@/types/site-content";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminNativeSelect } from "@/features/admin/components/admin-primitives";
import { ImageUploadField } from "@/features/admin/components/image-upload-field";
import { EditorGroup, EditorHint, EditorLink, EditorNote, EditorSection, EditorToggle, Field, SubsectionTitle } from "./editor-field";

type Home = SiteContent["home"];
type Props = {
  home: Home;
  onChange: (patch: Partial<Home>) => void;
};

const MAX_BULLETS = 5;
const MAX_TESTIMONIALS = 8;

const SOURCE_OPTIONS: { value: SiteHomeLatestSource; label: string }[] = [
  { value: "feed", label: "Novedades automáticas (YouTube / Facebook)" },
  { value: "productions", label: "Producciones destacadas" },
  { value: "both", label: "Destacada del feed + producciones" },
];

function clampInt(v: string, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

/** Card "Inicio · Lo último, merch, leads y testimonios": secciones parametrizables de la portada. */
export function HomeSectionsCard({ home, onChange }: Props) {
  const { latest, merch, lead, testimonials } = home;
  const bullets = lead.bullets ?? [];
  const items = testimonials.items ?? [];

  const setLatest = (patch: Partial<Home["latest"]>) => onChange({ latest: { ...latest, ...patch } });
  const setMerch = (patch: Partial<Home["merch"]>) => onChange({ merch: { ...merch, ...patch } });
  const setLead = (patch: Partial<Home["lead"]>) => onChange({ lead: { ...lead, ...patch } });
  const setTestimonials = (patch: Partial<Home["testimonials"]>) => onChange({ testimonials: { ...testimonials, ...patch } });

  function setBullet(i: number, value: string) {
    setLead({ bullets: bullets.map((b, j) => (j === i ? value : b)) });
  }
  function moveBullet(i: number, dir: -1 | 1) {
    const t = i + dir;
    if (t < 0 || t >= bullets.length) return;
    const next = [...bullets];
    [next[i], next[t]] = [next[t], next[i]];
    setLead({ bullets: next });
  }
  function updateItem(i: number, patch: Partial<SiteTestimonial>) {
    setTestimonials({ items: items.map((t, j) => (j === i ? { ...t, ...patch } : t)) });
  }
  function moveItem(i: number, dir: -1 | 1) {
    const t = i + dir;
    if (t < 0 || t >= items.length) return;
    const next = [...items];
    [next[i], next[t]] = [next[t], next[i]];
    setTestimonials({ items: next });
  }

  return (
    <EditorSection
      id="site-section-home-latest"
      title="Inicio · Lo último, merch, leads y testimonios"
      description="Secciones de la portada que se alimentan del feed, la tienda y el formulario de cotización."
      contentClassName="space-y-6"
    >
      <EditorNote>
        Estas secciones viven en la{" "}
        <EditorLink href="/" external>
          portada
        </EditorLink>
        . Las cotizaciones llegan a <EditorLink href="/admin/dashboard/mensajes">Mensajes</EditorLink> con la etiqueta «Cotización».
      </EditorNote>

      {/* Lo último */}
      <div className="space-y-4">
        <SubsectionTitle>Lo último</SubsectionTitle>
        <EditorHint>
          Una sola sección sustituye a «Últimas producciones» y «Novedades». La palabra «último» del título va en serif
          automáticamente; no escribas HTML.
        </EditorHint>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lo último — eyebrow">
            <Input value={latest.eyebrow} onChange={(e) => setLatest({ eyebrow: e.target.value })} />
          </Field>
          <Field label="Lo último — título">
            <Input value={latest.title} onChange={(e) => setLatest({ title: e.target.value })} />
          </Field>
        </div>
        <Field label="Lo último — subtítulo">
          <Input value={latest.subtitle} onChange={(e) => setLatest({ subtitle: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Lo último — fuente"
            hint="El hero usa el mismo origen: con el feed muestra la publicación más reciente; si no, el lanzamiento más reciente."
          >
            <AdminNativeSelect value={latest.source} onChange={(e) => setLatest({ source: e.target.value as SiteHomeLatestSource })}>
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </AdminNativeSelect>
          </Field>
          <Field label="Lo último — máximo de elementos" hint="1 a 12. Con «Destacada + producciones» se muestran 1 + 3.">
            <Input type="number" min={1} max={12} value={latest.limit} onChange={(e) => setLatest({ limit: clampInt(e.target.value, 1, 12, 5) })} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lo último — botón principal">
            <Input value={latest.ctaLabel} onChange={(e) => setLatest({ ctaLabel: e.target.value })} />
          </Field>
          <Field label="Lo último — enlace principal">
            <Input value={latest.ctaHref} onChange={(e) => setLatest({ ctaHref: e.target.value })} placeholder="/productions" className="font-mono" />
          </Field>
          <Field label="Lo último — botón secundario" hint="Vacío = sin botón secundario.">
            <Input value={latest.secondaryCtaLabel} onChange={(e) => setLatest({ secondaryCtaLabel: e.target.value })} />
          </Field>
          <Field label="Lo último — enlace secundario">
            <Input value={latest.secondaryCtaHref} onChange={(e) => setLatest({ secondaryCtaHref: e.target.value })} placeholder="/novedades" className="font-mono" />
          </Field>
        </div>
      </div>

      {/* Merch */}
      <div className="space-y-4">
        <SubsectionTitle>Merch en la portada</SubsectionTitle>
        <EditorHint>
          Se muestran primero los productos destacados y se completa con los más recientes. El eyebrow y el interruptor
          «Mostrar en la portada» siguen en la tarjeta Tienda.
        </EditorHint>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Merch — título">
            <Input value={merch.title} onChange={(e) => setMerch({ title: e.target.value })} />
          </Field>
          <Field label="Merch — botón «Ver la tienda»">
            <Input value={merch.ctaLabel} onChange={(e) => setMerch({ ctaLabel: e.target.value })} />
          </Field>
        </div>
        <Field label="Merch — subtítulo">
          <Input value={merch.subtitle} onChange={(e) => setMerch({ subtitle: e.target.value })} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Merch — productos a mostrar" hint="1 a 12 (grilla de 2 en móvil y 4 en escritorio).">
            <Input type="number" min={1} max={12} value={merch.limit} onChange={(e) => setMerch({ limit: clampInt(e.target.value, 1, 12, 4) })} />
          </Field>
          <EditorToggle checked={merch.onlyFeatured} onChange={(v) => setMerch({ onlyFeatured: v })} hint="Si no hay suficientes destacados, la sección mostrará menos productos.">
            Solo productos destacados
          </EditorToggle>
        </div>
      </div>

      {/* Leads */}
      <div className="space-y-4">
        <SubsectionTitle>Cotización rápida (leads)</SubsectionTitle>
        <EditorToggle checked={lead.enabled} onChange={(v) => setLead({ enabled: v })} hint="Formulario corto que guarda la solicitud como mensaje con asunto COTIZACION.">
          Mostrar el formulario de cotización en la portada
        </EditorToggle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Leads — eyebrow">
            <Input value={lead.eyebrow} onChange={(e) => setLead({ eyebrow: e.target.value })} />
          </Field>
          <Field label="Leads — título" hint="La palabra «tema» va en serif automáticamente.">
            <Input value={lead.title} onChange={(e) => setLead({ title: e.target.value })} />
          </Field>
        </div>
        <Field label="Leads — subtítulo">
          <Input value={lead.subtitle} onChange={(e) => setLead({ subtitle: e.target.value })} />
        </Field>
        <div className="space-y-2">
          <SubsectionTitle>
            Beneficios ({bullets.length}/{MAX_BULLETS})
          </SubsectionTitle>
          {bullets.map((b, i) => (
            <div key={i} className="grid gap-2 rounded border border-line-1 bg-ink-1/60 p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Input value={b} aria-label={`Beneficio ${i + 1}`} onChange={(e) => setBullet(i, e.target.value)} />
              <div className="flex items-center gap-1">
                <IconButton size="sm" aria-label="Subir" disabled={i === 0} onClick={() => moveBullet(i, -1)}>
                  <ArrowUp />
                </IconButton>
                <IconButton size="sm" aria-label="Bajar" disabled={i === bullets.length - 1} onClick={() => moveBullet(i, 1)}>
                  <ArrowDown />
                </IconButton>
                <Button type="button" variant="ghost" size="sm" onClick={() => setLead({ bullets: bullets.filter((_, j) => j !== i) })}>
                  Quitar
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" disabled={bullets.length >= MAX_BULLETS} onClick={() => setLead({ bullets: [...bullets, ""] })}>
            Añadir beneficio
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Leads — botón de envío">
            <Input value={lead.ctaLabel} onChange={(e) => setLead({ ctaLabel: e.target.value })} />
          </Field>
          <Field label="Leads — botón de WhatsApp">
            <Input value={lead.whatsappLabel} onChange={(e) => setLead({ whatsappLabel: e.target.value })} />
          </Field>
        </div>
        <Field label="Leads — mensaje de éxito">
          <Input value={lead.successMessage} onChange={(e) => setLead({ successMessage: e.target.value })} />
        </Field>
      </div>

      {/* Testimonios */}
      <div className="space-y-4">
        <SubsectionTitle>Testimonios</SubsectionTitle>
        <EditorHint>Sin testimonios la sección no se muestra. Citas cortas (una o dos frases) funcionan mejor.</EditorHint>
        <Field label="Testimonios — título">
          <Input value={testimonials.title} onChange={(e) => setTestimonials({ title: e.target.value })} />
        </Field>
        <div className="space-y-3">
          <SubsectionTitle>
            Citas ({items.length}/{MAX_TESTIMONIALS})
          </SubsectionTitle>
          {items.map((t, i) => (
            <EditorGroup key={i}>
              <Field label={`Testimonio ${i + 1} — cita`}>
                <Textarea rows={3} value={t.quote} onChange={(e) => updateItem(i, { quote: e.target.value })} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={`Testimonio ${i + 1} — autor`}>
                  <Input value={t.author} onChange={(e) => updateItem(i, { author: e.target.value })} />
                </Field>
                <Field label={`Testimonio ${i + 1} — rol`} hint="Ej: Artista · Cartagena">
                  <Input value={t.role ?? ""} onChange={(e) => updateItem(i, { role: e.target.value })} />
                </Field>
              </div>
              <ImageUploadField label={`Testimonio ${i + 1} — foto`} aspect="square" value={t.avatarUrl ?? ""} onChange={(v) => updateItem(i, { avatarUrl: v })} />
              <div className="flex flex-wrap items-center gap-1">
                <IconButton size="sm" aria-label="Subir" disabled={i === 0} onClick={() => moveItem(i, -1)}>
                  <ArrowUp />
                </IconButton>
                <IconButton size="sm" aria-label="Bajar" disabled={i === items.length - 1} onClick={() => moveItem(i, 1)}>
                  <ArrowDown />
                </IconButton>
                <Button type="button" variant="ghost" size="sm" onClick={() => setTestimonials({ items: items.filter((_, j) => j !== i) })}>
                  Quitar testimonio
                </Button>
              </div>
            </EditorGroup>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={items.length >= MAX_TESTIMONIALS}
            onClick={() => setTestimonials({ items: [...items, { quote: "", author: "", role: "" }] })}
          >
            Añadir testimonio
          </Button>
        </div>
      </div>
    </EditorSection>
  );
}
