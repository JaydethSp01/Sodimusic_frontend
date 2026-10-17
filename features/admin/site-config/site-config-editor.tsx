"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import type { SiteContent, SiteCrewMember, SiteMilestone, SiteNavLink, SiteStat } from "@/types/site-content";
import { saveSiteDraftAction, publishSiteAction } from "@/app/actions/site-config-actions";
import { setSitePreview } from "@/app/actions/site-preview";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionCallout } from "@/components/shared/section-callout";
import { ImageUploadField } from "@/features/admin/components/image-upload-field";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-defaults";
import { Field, SECTION_CARD, SubsectionTitle } from "./editor-field";
import { LegalCard } from "./legal-card";
import { ContactPageCard } from "./contact-page-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SECTIONS: { id: string; label: string }[] = [
  { id: "site-section-hero", label: "Hero" },
  { id: "site-section-brand", label: "Marca y menú" },
  { id: "site-section-home", label: "Inicio" },
  { id: "site-section-youtube", label: "YouTube" },
  { id: "site-section-shop", label: "Tienda" },
  { id: "site-section-footer", label: "Pie y contacto" },
  { id: "site-section-legal", label: "Legal" },
  { id: "site-section-contact-page", label: "Contacto y prensa" },
  { id: "site-section-seo", label: "SEO y redes" },
  { id: "site-section-qr", label: "Código QR" },
  { id: "site-section-booking", label: "Booking" },
  { id: "site-section-artists", label: "Artistas" },
  { id: "site-section-beats", label: "Beats" },
  { id: "site-section-productions", label: "Producciones" },
  { id: "site-section-releases", label: "Lanzamientos" },
  { id: "site-section-booking-success", label: "Confirmación" },
  { id: "site-section-release-detail", label: "Ficha release" },
];

export function SiteConfigEditor({
  initialDraft,
  publishedAt,
  draftUpdatedAt,
}: {
  initialDraft: SiteContent;
  publishedAt: string | null;
  draftUpdatedAt: string;
}) {
  const router = useRouter();
  const [c, setC] = useState<SiteContent>(() => ({
    ...initialDraft,
    youtube: { ...SITE_CONTENT_DEFAULTS.youtube, ...initialDraft.youtube },
    legal: { ...SITE_CONTENT_DEFAULTS.legal, ...(initialDraft.legal ?? {}) },
    contactPage: { ...SITE_CONTENT_DEFAULTS.contactPage, ...(initialDraft.contactPage ?? {}) },
  }));
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function updateNavLink(i: number, patch: Partial<SiteNavLink>) {
    setC((prev) => {
      const links = [...prev.nav.links];
      links[i] = { ...links[i], ...patch };
      return { ...prev, nav: { ...prev.nav, links } };
    });
  }

  function addNavLink() {
    setC((prev) => ({
      ...prev,
      nav: { ...prev.nav, links: [...prev.nav.links, { href: "/", label: "Nuevo" }] },
    }));
  }

  function removeNavLink(i: number) {
    setC((prev) => ({
      ...prev,
      nav: { ...prev.nav, links: prev.nav.links.filter((_, j) => j !== i) },
    }));
  }

  function updateMilestone(i: number, patch: Partial<SiteMilestone>) {
    setC((prev) => {
      const m = [...prev.home.milestones];
      m[i] = { ...m[i], ...patch };
      return { ...prev, home: { ...prev.home, milestones: m } };
    });
  }

  function addMilestone() {
    setC((prev) => ({
      ...prev,
      home: {
        ...prev.home,
        milestones: [...prev.home.milestones, { year: "", title: "", desc: "" }],
      },
    }));
  }

  function removeMilestone(i: number) {
    setC((prev) => ({
      ...prev,
      home: { ...prev.home, milestones: prev.home.milestones.filter((_, j) => j !== i) },
    }));
  }

  function updateStat(i: number, patch: Partial<SiteStat>) {
    setC((prev) => {
      const stats = [...(prev.home.stats ?? [])];
      stats[i] = { ...stats[i], ...patch };
      return { ...prev, home: { ...prev.home, stats } };
    });
  }

  function addStat() {
    setC((prev) => ({
      ...prev,
      home: { ...prev.home, stats: [...(prev.home.stats ?? []), { value: 0, suffix: "", label: "" }] },
    }));
  }

  function removeStat(i: number) {
    setC((prev) => {
      const stats = prev.home.stats ?? [];
      if (stats.length <= 1) return prev;
      return { ...prev, home: { ...prev.home, stats: stats.filter((_, j) => j !== i) } };
    });
  }

  function updateMember(i: number, patch: Partial<SiteCrewMember>) {
    setC((prev) => {
      const members = [...prev.artists.members];
      members[i] = { ...members[i], ...patch };
      return { ...prev, artists: { ...prev.artists, members } };
    });
  }

  function saveDraft() {
    setErr(null);
    setMsg(null);
    start(async () => {
      const r = await saveSiteDraftAction(c);
      if (!r.ok) {
        setErr(r.error ?? "Error");
        toast.error(r.error ?? "Error al guardar borrador");
        return;
      }
      setMsg("Borrador guardado.");
      toast.success("Borrador guardado");
      router.refresh();
    });
  }

  function publish() {
    setErr(null);
    setMsg(null);
    start(async () => {
      const r = await publishSiteAction();
      if (!r.ok) {
        setErr(r.error ?? "Error");
        toast.error(r.error ?? "Error al publicar");
        return;
      }
      setMsg("Cambios publicados. El sitio visible usa esta versión.");
      toast.success("Cambios publicados");
      router.refresh();
    });
  }

  function preview() {
    setErr(null);
    start(async () => {
      const r = await saveSiteDraftAction(c);
      if (!r.ok) {
        setErr(r.error ?? "Guarda antes de previsualizar");
        toast.error(r.error ?? "Guarda antes de previsualizar");
        return;
      }
      await setSitePreview(true);
      toast.success("Vista previa activada");
      window.open("/", "_blank", "noopener,noreferrer");
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Sitio web público</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
          Edita textos, enlaces e imágenes. Guarda borrador, previsualiza y publica cuando esté listo. Beats, producciones,
          releases y productos se gestionan en sus propias secciones del panel.
        </p>
        <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
          Borrador: {new Date(draftUpdatedAt).toLocaleString("es-CO")}
          {publishedAt ? ` · Publicado: ${new Date(publishedAt).toLocaleString("es-CO")}` : " · Aún sin publicar formal"}
        </p>
      </div>

      <div
        className={cn(
          "sticky top-14 z-20 -mx-6 border-y border-border bg-background-secondary/85 px-6 py-3 backdrop-blur md:top-0 md:-mx-8 md:px-8",
          "supports-[backdrop-filter]:bg-background-secondary/70",
        )}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Secciones del editor" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:pb-0">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => preview()}>
              Vista previa
            </Button>
            <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => saveDraft()}>
              Guardar borrador
            </Button>
            <Button type="button" size="sm" disabled={pending} onClick={() => publish()}>
              {pending ? "Procesando…" : "Publicar"}
            </Button>
          </div>
        </div>
        {msg ? <p className="mt-2 text-xs text-primary">{msg}</p> : null}
        {err ? <p className="mt-2 text-xs text-red-500">{err}</p> : null}
      </div>

      <Card id="site-section-hero" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Hero</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <Field label="Línea superior (eyebrow)">
              <Input value={c.hero.eyebrow} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, eyebrow: e.target.value } }))} />
            </Field>
            <Field label="Título principal">
              <Input value={c.hero.title} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, title: e.target.value } }))} />
            </Field>
            <Field label="Tagline">
              <Input value={c.hero.tagline} onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, tagline: e.target.value } }))} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="CTA primario">
                <Input
                  value={c.hero.primaryCta}
                  onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, primaryCta: e.target.value } }))}
                />
              </Field>
              <Field label="Enlace CTA primario">
                <Input
                  value={c.hero.primaryHref}
                  onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, primaryHref: e.target.value } }))}
                />
              </Field>
              <Field label="CTA secundario">
                <Input
                  value={c.hero.secondaryCta}
                  onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, secondaryCta: e.target.value } }))}
                />
              </Field>
              <Field label="Enlace CTA secundario">
                <Input
                  value={c.hero.secondaryHref}
                  onChange={(e) => setC((p) => ({ ...p, hero: { ...p.hero, secondaryHref: e.target.value } }))}
                />
              </Field>
            </div>
          </div>
          <div>
            <ImageUploadField
              label="Imagen de fondo del hero"
              aspect="video"
              value={c.hero.heroImageUrl}
              onChange={(v) => setC((p) => ({ ...p, hero: { ...p.hero, heroImageUrl: v } }))}
              hint="Recomendado 1920×1080 o mayor. JPG/WebP · máximo 4,5 MB."
            />
          </div>
        </CardContent>
      </Card>

      <Card id="site-section-brand" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Marca y navegación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Logo (texto)">
              <Input value={c.brand.logoText} onChange={(e) => setC((p) => ({ ...p, brand: { ...p.brand, logoText: e.target.value } }))} />
            </Field>
            <Field label="Nombre / subtítulo marca">
              <Input
                value={c.brand.siteNameLine ?? ""}
                onChange={(e) => setC((p) => ({ ...p, brand: { ...p.brand, siteNameLine: e.target.value } }))}
              />
            </Field>
          </div>
          <Field label="Enlaces del menú">
            <div className="space-y-2">
              {c.nav.links.map((link, i) => (
                <div key={i} className="flex flex-wrap gap-2">
                  <Input
                    className="flex-1 min-w-[120px]"
                    value={link.label}
                    onChange={(e) => updateNavLink(i, { label: e.target.value })}
                    placeholder="Etiqueta"
                  />
                  <Input
                    className="flex-1 min-w-[120px]"
                    value={link.href}
                    onChange={(e) => updateNavLink(i, { href: e.target.value })}
                    placeholder="/ruta"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeNavLink(i)}>
                    Quitar
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addNavLink}>
                Añadir enlace
              </Button>
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Texto botón agendar (header)">
              <Input value={c.nav.ctaLabel} onChange={(e) => setC((p) => ({ ...p, nav: { ...p.nav, ctaLabel: e.target.value } }))} />
            </Field>
            <Field label="URL botón agendar">
              <Input value={c.nav.ctaHref} onChange={(e) => setC((p) => ({ ...p, nav: { ...p.nav, ctaHref: e.target.value } }))} />
            </Field>
            <Field label="Pie menú móvil">
              <Input
                value={c.nav.mobileFooterLine}
                onChange={(e) => setC((p) => ({ ...p, nav: { ...p.nav, mobileFooterLine: e.target.value } }))}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card id="site-section-home" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Inicio — secciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Quiénes somos — eyebrow / título">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={c.home.aboutEyebrow} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, aboutEyebrow: e.target.value } }))} />
              <Input value={c.home.aboutTitle} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, aboutTitle: e.target.value } }))} />
            </div>
          </Field>
          <Field label="Quiénes somos — texto">
            <Textarea rows={5} value={c.home.aboutBody} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, aboutBody: e.target.value } }))} />
          </Field>
          <ImageUploadField
            label="Quiénes somos — imagen lateral"
            aspect="video"
            value={c.home.aboutImageUrl}
            onChange={(v) => setC((p) => ({ ...p, home: { ...p.home, aboutImageUrl: v } }))}
          />
          <Field label="Leyenda caja lateral">
            <Input
              value={c.home.aboutAsideCaption}
              onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, aboutAsideCaption: e.target.value } }))}
            />
          </Field>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Géneros eyebrow">
              <Input value={c.home.genresEyebrow} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, genresEyebrow: e.target.value } }))} />
            </Field>
            <Field label="Géneros título">
              <Input value={c.home.genresTitle} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, genresTitle: e.target.value } }))} />
            </Field>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Historia eyebrow">
              <Input value={c.home.storyEyebrow} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, storyEyebrow: e.target.value } }))} />
            </Field>
            <Field label="Historia título">
              <Input value={c.home.storyTitle} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, storyTitle: e.target.value } }))} />
            </Field>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Portafolio eyebrow">
              <Input value={c.home.portfolioEyebrow} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, portfolioEyebrow: e.target.value } }))} />
            </Field>
            <Field label="Portafolio título">
              <Input value={c.home.portfolioTitle} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, portfolioTitle: e.target.value } }))} />
            </Field>
          </div>
          <Field label="CTA portafolio">
            <Input value={c.home.portfolioCta} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, portfolioCta: e.target.value } }))} />
          </Field>
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Servicios eyebrow (opcional)">
              <Input value={c.home.servicesEyebrow} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, servicesEyebrow: e.target.value } }))} />
            </Field>
            <Field label="Servicios título">
              <Input value={c.home.servicesTitle} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, servicesTitle: e.target.value } }))} />
            </Field>
          </div>
          <Field label="Servicios subtítulo">
            <Input value={c.home.servicesSubtitle} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, servicesSubtitle: e.target.value } }))} />
          </Field>
          <Field label="Contacto — título / subtítulo">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={c.home.contactTitle} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, contactTitle: e.target.value } }))} />
              <Input value={c.home.contactSubtitle} onChange={(e) => setC((p) => ({ ...p, home: { ...p.home, contactSubtitle: e.target.value } }))} />
            </div>
          </Field>

          <div>
            <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Hitos (línea de tiempo)</p>
            <div className="space-y-3">
              {c.home.milestones.map((m, i) => (
                <div key={i} className="rounded-md border border-border p-3 space-y-2">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input value={m.year} onChange={(e) => updateMilestone(i, { year: e.target.value })} placeholder="Año" />
                    <Input value={m.title} onChange={(e) => updateMilestone(i, { title: e.target.value })} placeholder="Título" />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeMilestone(i)}>
                      Quitar
                    </Button>
                  </div>
                  <Textarea rows={2} value={m.desc} onChange={(e) => updateMilestone(i, { desc: e.target.value })} placeholder="Descripción" />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                Añadir hito
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-[var(--text-secondary)]">Cifras (contadores animados bajo «Quiénes somos»)</p>
            <p className="mb-2 text-[11px] text-[var(--text-muted)]">
              Valor numérico + sufijo (p. ej. «+», «%», «k») + etiqueta. Mínimo una cifra.
            </p>
            <div className="space-y-2">
              {(c.home.stats ?? []).map((st, i) => (
                <div key={i} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[110px_90px_minmax(0,1fr)_auto]">
                  <Input
                    type="number"
                    value={st.value}
                    onChange={(e) => updateStat(i, { value: Number(e.target.value) || 0 })}
                    placeholder="Valor"
                    aria-label="Valor"
                  />
                  <Input value={st.suffix} onChange={(e) => updateStat(i, { suffix: e.target.value })} placeholder="Sufijo" aria-label="Sufijo" />
                  <Input value={st.label} onChange={(e) => updateStat(i, { label: e.target.value })} placeholder="Etiqueta (p. ej. producciones)" aria-label="Etiqueta" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={(c.home.stats?.length ?? 0) <= 1}
                    onClick={() => removeStat(i)}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addStat}>
                Añadir cifra
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="site-section-youtube" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Canales de YouTube</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionCallout>
            Los canales ahora se gestionan en{" "}
            <Link href="/admin/dashboard/canales" className="inline-flex items-center gap-1 text-primary underline underline-offset-2">
              Admin → Canales <ExternalLink className="h-3 w-3" aria-hidden />
            </Link>
            . Aquí solo se editan los textos de la sección del inicio y de la página <code className="font-mono text-xs">/canales</code>.
          </SectionCallout>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={c.youtube.showOnHome}
              onCheckedChange={(v) => setC((p) => ({ ...p, youtube: { ...p.youtube, showOnHome: v === true } }))}
            />
            Mostrar en el inicio
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Eyebrow">
              <Input
                value={c.youtube.sectionEyebrow}
                onChange={(e) => setC((p) => ({ ...p, youtube: { ...p.youtube, sectionEyebrow: e.target.value } }))}
              />
            </Field>
            <Field label="Título">
              <Input
                value={c.youtube.sectionTitle}
                onChange={(e) => setC((p) => ({ ...p, youtube: { ...p.youtube, sectionTitle: e.target.value } }))}
              />
            </Field>
          </div>
          <Field label="Subtítulo">
            <Textarea
              rows={2}
              value={c.youtube.sectionSubtitle}
              onChange={(e) => setC((p) => ({ ...p, youtube: { ...p.youtube, sectionSubtitle: e.target.value } }))}
            />
          </Field>
          <Field label="Texto del botón suscribirse">
            <Input
              value={c.youtube.subscribeLabel}
              onChange={(e) => setC((p) => ({ ...p, youtube: { ...p.youtube, subscribeLabel: e.target.value } }))}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Canales destacados en el inicio (máximo)" hint="Se muestran los canales marcados como destacados, hasta este número.">
              <Input
                type="number"
                min={1}
                max={24}
                value={c.youtube.homeLimit}
                onChange={(e) =>
                  setC((p) => ({
                    ...p,
                    youtube: { ...p.youtube, homeLimit: Math.max(1, Math.min(24, Math.round(Number(e.target.value)) || 1)) },
                  }))
                }
              />
            </Field>
            <Field label="Texto del enlace «ver todos»" hint="Se le añade el total entre paréntesis, p. ej. «Ver todos los canales (12)».">
              <Input
                value={c.youtube.allChannelsLabel}
                onChange={(e) => setC((p) => ({ ...p, youtube: { ...p.youtube, allChannelsLabel: e.target.value } }))}
              />
            </Field>
          </div>
          <SubsectionTitle>Página /canales</SubsectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Título">
              <Input
                value={c.youtube.pageTitle}
                onChange={(e) => setC((p) => ({ ...p, youtube: { ...p.youtube, pageTitle: e.target.value } }))}
              />
            </Field>
            <Field label="Descripción (también meta descripción)">
              <Input
                value={c.youtube.pageDescription}
                onChange={(e) => setC((p) => ({ ...p, youtube: { ...p.youtube, pageDescription: e.target.value } }))}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card id="site-section-shop" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Tienda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionCallout>
            Aquí se editan los textos de la página <code className="font-mono text-xs">/tienda</code>. Los productos se gestionan en{" "}
            <Link href="/admin/dashboard/tienda" className="inline-flex items-center gap-1 text-primary underline underline-offset-2">
              Tienda <ExternalLink className="h-3 w-3" aria-hidden />
            </Link>
            .
          </SectionCallout>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={c.shop.enabled}
                onCheckedChange={(v) => setC((p) => ({ ...p, shop: { ...p.shop, enabled: v === true } }))}
              />
              Tienda activada (visible en el sitio)
            </label>
            <Field label="Etiqueta en el menú">
              <Input value={c.shop.navLabel} onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, navLabel: e.target.value } }))} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Meta título">
              <Input value={c.shop.metaTitle} onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, metaTitle: e.target.value } }))} />
            </Field>
            <Field label="Meta descripción">
              <Input
                value={c.shop.metaDescription}
                onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, metaDescription: e.target.value } }))}
              />
            </Field>
          </div>

          <SubsectionTitle>Hero de la tienda</SubsectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Eyebrow (opcional)">
              <Input
                value={c.shop.heroEyebrow ?? ""}
                onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, heroEyebrow: e.target.value } }))}
              />
            </Field>
            <Field label="Título">
              <Input value={c.shop.heroTitle} onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, heroTitle: e.target.value } }))} />
            </Field>
          </div>
          <Field label="Descripción">
            <Textarea
              rows={2}
              value={c.shop.heroDescription}
              onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, heroDescription: e.target.value } }))}
            />
          </Field>
          <ImageUploadField
            label="Imagen de fondo del hero (opcional)"
            aspect="video"
            value={c.shop.heroImageUrl ?? ""}
            onChange={(v) => setC((p) => ({ ...p, shop: { ...p.shop, heroImageUrl: v } }))}
          />

          <SubsectionTitle>Textos de compra</SubsectionTitle>
          <Field label="Mensaje cuando no hay productos">
            <Textarea
              rows={2}
              value={c.shop.emptyStateMessage}
              onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, emptyStateMessage: e.target.value } }))}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Botón pedir (orderCtaLabel)">
              <Input
                value={c.shop.orderCtaLabel}
                onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, orderCtaLabel: e.target.value } }))}
              />
            </Field>
            <Field label="Botón añadir al pedido (addToCartLabel)">
              <Input
                value={c.shop.addToCartLabel}
                onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, addToCartLabel: e.target.value } }))}
              />
            </Field>
          </div>
          <Field label="Intro del mensaje de WhatsApp" hint="Se antepone al detalle del pedido que arma el cliente.">
            <Textarea
              rows={2}
              value={c.shop.whatsappOrderIntro}
              onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, whatsappOrderIntro: e.target.value } }))}
            />
          </Field>
          <Field label="Nota de envíos (opcional)">
            <Input
              value={c.shop.shippingNote ?? ""}
              onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, shippingNote: e.target.value } }))}
            />
          </Field>

          <SubsectionTitle>Bloque en el inicio</SubsectionTitle>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={c.shop.showOnHome}
              onCheckedChange={(v) => setC((p) => ({ ...p, shop: { ...p.shop, showOnHome: v === true } }))}
            />
            Mostrar productos destacados en el inicio
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Eyebrow">
              <Input
                value={c.shop.homeSectionEyebrow}
                onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, homeSectionEyebrow: e.target.value } }))}
              />
            </Field>
            <Field label="Título">
              <Input
                value={c.shop.homeSectionTitle}
                onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, homeSectionTitle: e.target.value } }))}
              />
            </Field>
            <Field label="Subtítulo">
              <Input
                value={c.shop.homeSectionSubtitle}
                onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, homeSectionSubtitle: e.target.value } }))}
              />
            </Field>
            <Field label="CTA (ver toda la tienda)">
              <Input
                value={c.shop.homeCtaLabel}
                onChange={(e) => setC((p) => ({ ...p, shop: { ...p.shop, homeCtaLabel: e.target.value } }))}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card id="site-section-footer" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Pie de página y contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Tagline pie">
            <Textarea rows={2} value={c.footer.tagline} onChange={(e) => setC((p) => ({ ...p, footer: { ...p.footer, tagline: e.target.value } }))} />
          </Field>
          <Field label="Copyright">
            <Input value={c.footer.copyright} onChange={(e) => setC((p) => ({ ...p, footer: { ...p.footer, copyright: e.target.value } }))} />
          </Field>
          <Field label="Subtítulo pie (opcional)">
            <Input
              value={c.footer.subline ?? ""}
              onChange={(e) => setC((p) => ({ ...p, footer: { ...p.footer, subline: e.target.value } }))}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email contacto">
              <Input value={c.contact.email} onChange={(e) => setC((p) => ({ ...p, contact: { ...p.contact, email: e.target.value } }))} />
            </Field>
            <Field label="WhatsApp (solo número, sin +)">
              <Input value={c.contact.whatsapp} onChange={(e) => setC((p) => ({ ...p, contact: { ...p.contact, whatsapp: e.target.value } }))} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <LegalCard legal={c.legal} onChange={(patch) => setC((p) => ({ ...p, legal: { ...p.legal, ...patch } }))} />

      <ContactPageCard
        contactPage={c.contactPage}
        onChange={(patch) => setC((p) => ({ ...p, contactPage: { ...p.contactPage, ...patch } }))}
      />

      <Card id="site-section-seo" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">SEO y redes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Título página inicio (meta)">
            <Input value={c.seo.homeTitle} onChange={(e) => setC((p) => ({ ...p, seo: { ...p.seo, homeTitle: e.target.value } }))} />
          </Field>
          <Field label="Descripción (meta)">
            <Textarea rows={3} value={c.seo.homeDescription} onChange={(e) => setC((p) => ({ ...p, seo: { ...p.seo, homeDescription: e.target.value } }))} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="YouTube">
              <Input value={c.social.youtube} onChange={(e) => setC((p) => ({ ...p, social: { ...p.social, youtube: e.target.value } }))} />
            </Field>
            <Field label="Instagram">
              <Input value={c.social.instagram} onChange={(e) => setC((p) => ({ ...p, social: { ...p.social, instagram: e.target.value } }))} />
            </Field>
            <Field label="Facebook">
              <Input value={c.social.facebook} onChange={(e) => setC((p) => ({ ...p, social: { ...p.social, facebook: e.target.value } }))} />
            </Field>
            <Field label="Spotify">
              <Input value={c.social.spotify} onChange={(e) => setC((p) => ({ ...p, social: { ...p.social, spotify: e.target.value } }))} />
            </Field>
            <Field label="TikTok">
              <Input value={c.social.tiktok} onChange={(e) => setC((p) => ({ ...p, social: { ...p.social, tiktok: e.target.value } }))} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card id="site-section-qr" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Código QR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SectionCallout>
            El QR del sitio apunta a la URL de abajo (vacía = URL principal del sitio). Para descargarlo, imprimirlo o
            cambiar colores ve a{" "}
            <Link href="/admin/dashboard/qr" className="inline-flex items-center gap-1 text-primary underline underline-offset-2">
              Código QR <ExternalLink className="h-3 w-3" aria-hidden />
            </Link>
            .
          </SectionCallout>
          <Field label="URL destino" hint="Déjala vacía para usar la URL del sitio. Debe empezar por https://">
            <Input
              value={c.qr.targetUrl ?? ""}
              onChange={(e) => setC((p) => ({ ...p, qr: { ...p.qr, targetUrl: e.target.value } }))}
              placeholder="https://sodimusic.co"
            />
          </Field>
          <Field label="Etiqueta (texto junto al QR)">
            <Input value={c.qr.label} onChange={(e) => setC((p) => ({ ...p, qr: { ...p.qr, label: e.target.value } }))} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={c.qr.showInFooter}
              onCheckedChange={(v) => setC((p) => ({ ...p, qr: { ...p.qr, showInFooter: v === true } }))}
            />
            Mostrar el QR en el pie de página
          </label>
          <Field label="Leyenda del pie">
            <Input
              value={c.qr.footerCaption}
              onChange={(e) => setC((p) => ({ ...p, qr: { ...p.qr, footerCaption: e.target.value } }))}
            />
          </Field>
        </CardContent>
      </Card>

      <Card id="site-section-booking" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Booking (Agenda)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Hero - título">
            <Input value={c.booking.heroTitle} onChange={(e) => setC((p) => ({ ...p, booking: { ...p.booking, heroTitle: e.target.value } }))} />
          </Field>
          <Field label="Hero - descripción">
            <Textarea
              rows={3}
              value={c.booking.heroDescription}
              onChange={(e) => setC((p) => ({ ...p, booking: { ...p.booking, heroDescription: e.target.value } }))}
            />
          </Field>

          <div className="space-y-3">
            <p className="text-xs font-medium text-[var(--text-secondary)]">Labels del wizard (5 pasos)</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {c.booking.stepLabels.map((v, i) => (
                <Field key={i} label={`Paso ${i + 1}`}>
                  <Input
                    value={v}
                    onChange={(e) =>
                      setC((p) => {
                        const next = [...p.booking.stepLabels];
                        next[i] = e.target.value;
                        return { ...p, booking: { ...p.booking, stepLabels: next } };
                      })
                    }
                  />
                </Field>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-[var(--text-secondary)]">Servicios (Step 1)</p>
            <div className="space-y-4">
              {c.booking.services.map((svc, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-background-card p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Icono">
                      <Input
                        value={svc.icon}
                        onChange={(e) =>
                          setC((p) => {
                            const next = [...p.booking.services];
                            next[idx] = { ...next[idx], icon: e.target.value };
                            return { ...p, booking: { ...p.booking, services: next } };
                          })
                        }
                      />
                    </Field>
                    <Field label="Type (backend)">
                      <Input
                        value={svc.type}
                        onChange={(e) =>
                          setC((p) => {
                            const next = [...p.booking.services];
                            next[idx] = { ...next[idx], type: e.target.value };
                            return { ...p, booking: { ...p.booking, services: next } };
                          })
                        }
                      />
                    </Field>
                    <Field label="Título">
                      <Input
                        value={svc.title}
                        onChange={(e) =>
                          setC((p) => {
                            const next = [...p.booking.services];
                            next[idx] = { ...next[idx], title: e.target.value };
                            return { ...p, booking: { ...p.booking, services: next } };
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Descripción">
                    <Textarea
                      rows={2}
                      value={svc.desc}
                      onChange={(e) =>
                        setC((p) => {
                          const next = [...p.booking.services];
                          next[idx] = { ...next[idx], desc: e.target.value };
                          return { ...p, booking: { ...p.booking, services: next } };
                        })
                      }
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Precio «desde» (COP, sin puntos)" hint="Vacío = sin precio público. Se muestra con «IVA incluido» si está activo en Legal.">
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        value={svc.priceFromCOP ?? ""}
                        onChange={(e) =>
                          setC((p) => {
                            const next = [...p.booking.services];
                            const n = Math.round(Number(e.target.value));
                            next[idx] = { ...next[idx], priceFromCOP: e.target.value === "" || !Number.isFinite(n) ? undefined : Math.max(0, n) };
                            return { ...p, booking: { ...p.booking, services: next } };
                          })
                        }
                      />
                    </Field>
                    <Field label="Nota del precio" hint="Ej: «por hora», «por canción», «por proyecto».">
                      <Input
                        value={svc.priceNote ?? ""}
                        onChange={(e) =>
                          setC((p) => {
                            const next = [...p.booking.services];
                            next[idx] = { ...next[idx], priceNote: e.target.value };
                            return { ...p, booking: { ...p.booking, services: next } };
                          })
                        }
                      />
                    </Field>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={c.booking.services.length <= 1}
                      onClick={() =>
                        setC((p) => ({ ...p, booking: { ...p.booking, services: p.booking.services.filter((_, i) => i !== idx) } }))
                      }
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
                onClick={() =>
                  setC((p) => ({
                    ...p,
                    booking: {
                      ...p.booking,
                      services: [
                        ...p.booking.services,
                        {
                          type: p.booking.services[0]?.type ?? "VOCAL_RECORDING",
                          icon: p.booking.services[0]?.icon ?? "🎤",
                          title: "Nuevo servicio",
                          desc: "Descripción del servicio",
                        },
                      ],
                    },
                  }))
                }
              >
                Añadir servicio
              </Button>
            </div>
          </div>

          <Field label="Géneros (chips) - separados por coma">
            <Input
              value={c.booking.genreChips.join(", ")}
              onChange={(e) => {
                const parts = e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean);
                setC((p) => ({ ...p, booking: { ...p.booking, genreChips: parts.length ? parts : ["Otro"] } }));
              }}
            />
          </Field>
        </CardContent>
      </Card>

      <Card id="site-section-artists" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Artistas (Crew)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Hero - título">
            <Input value={c.artists.pageHeroTitle} onChange={(e) => setC((p) => ({ ...p, artists: { ...p.artists, pageHeroTitle: e.target.value } }))} />
          </Field>
          <Field label="Hero - descripción">
            <Textarea
              rows={3}
              value={c.artists.pageHeroDescription}
              onChange={(e) => setC((p) => ({ ...p, artists: { ...p.artists, pageHeroDescription: e.target.value } }))}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Label productor">
              <Input value={c.artists.producerLabel} onChange={(e) => setC((p) => ({ ...p, artists: { ...p.artists, producerLabel: e.target.value } }))} />
            </Field>
            <Field label="Nombre productor">
              <Input value={c.artists.producerName} onChange={(e) => setC((p) => ({ ...p, artists: { ...p.artists, producerName: e.target.value } }))} />
            </Field>
          </div>

          <Field label="Géneros productor - separados por coma">
            <Input
              value={c.artists.producerGenres.join(", ")}
              onChange={(e) => {
                const parts = e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean);
                setC((p) => ({ ...p, artists: { ...p.artists, producerGenres: parts.length ? parts : ["Trap"] } }));
              }}
            />
          </Field>

          <Field label="Bio productor">
            <Textarea
              rows={4}
              value={c.artists.producerBio}
              onChange={(e) => setC((p) => ({ ...p, artists: { ...p.artists, producerBio: e.target.value } }))}
            />
          </Field>

          <ImageUploadField
            label="Foto del productor"
            aspect="portrait"
            value={c.artists.producerImageUrl ?? ""}
            onChange={(v) => setC((p) => ({ ...p, artists: { ...p.artists, producerImageUrl: v } }))}
            hint="Vertical (3:4). Opcional: si falta se usa el diseño por defecto."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="CTA botón (booking)">
              <Input value={c.artists.primaryCtaLabel} onChange={(e) => setC((p) => ({ ...p, artists: { ...p.artists, primaryCtaLabel: e.target.value } }))} />
            </Field>
            <Field label="CTA YouTube (texto)">
              <Input value={c.artists.youtubeCtaLabel} onChange={(e) => setC((p) => ({ ...p, artists: { ...p.artists, youtubeCtaLabel: e.target.value } }))} />
            </Field>
          </div>

          <Field label="Sección crew - título">
            <Input value={c.artists.crewSectionTitle} onChange={(e) => setC((p) => ({ ...p, artists: { ...p.artists, crewSectionTitle: e.target.value } }))} />
          </Field>
          <Field label="Sección crew - descripción">
            <Textarea
              rows={3}
              value={c.artists.crewSectionDescription}
              onChange={(e) => setC((p) => ({ ...p, artists: { ...p.artists, crewSectionDescription: e.target.value } }))}
            />
          </Field>

          <div className="space-y-3">
            <p className="text-xs font-medium text-[var(--text-secondary)]">Miembros del crew (grid)</p>
            <div className="space-y-4">
              {c.artists.members.map((m, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-background-card p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Nombre">
                      <Input
                        value={m.name}
                        onChange={(e) =>
                          setC((p) => {
                            const next = [...p.artists.members];
                            next[idx] = { ...next[idx], name: e.target.value };
                            return { ...p, artists: { ...p.artists, members: next } };
                          })
                        }
                      />
                    </Field>
                    <Field label="Género/etiqueta">
                      <Input
                        value={m.genre}
                        onChange={(e) =>
                          setC((p) => {
                            const next = [...p.artists.members];
                            next[idx] = { ...next[idx], genre: e.target.value };
                            return { ...p, artists: { ...p.artists, members: next } };
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Bio">
                    <Textarea
                      rows={3}
                      value={m.bio}
                      onChange={(e) =>
                        setC((p) => {
                          const next = [...p.artists.members];
                          next[idx] = { ...next[idx], bio: e.target.value };
                          return { ...p, artists: { ...p.artists, members: next } };
                        })
                      }
                    />
                  </Field>
                  <ImageUploadField
                    label="Foto"
                    aspect="portrait"
                    value={m.imageUrl ?? ""}
                    onChange={(v) => updateMember(idx, { imageUrl: v })}
                    hint="Vertical (3:4). Opcional."
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Instagram (URL)">
                      <Input
                        value={m.instagramUrl ?? ""}
                        onChange={(e) => updateMember(idx, { instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/…"
                      />
                    </Field>
                    <Field label="YouTube (URL)">
                      <Input
                        value={m.youtubeUrl ?? ""}
                        onChange={(e) => updateMember(idx, { youtubeUrl: e.target.value })}
                        placeholder="https://youtube.com/@…"
                      />
                    </Field>
                    <Field label="Spotify (URL)">
                      <Input
                        value={m.spotifyUrl ?? ""}
                        onChange={(e) => updateMember(idx, { spotifyUrl: e.target.value })}
                        placeholder="https://open.spotify.com/artist/…"
                      />
                    </Field>
                    <Field label="TikTok (URL)">
                      <Input
                        value={m.tiktokUrl ?? ""}
                        onChange={(e) => updateMember(idx, { tiktokUrl: e.target.value })}
                        placeholder="https://www.tiktok.com/@…"
                      />
                    </Field>
                  </div>
                  <Field label="Rol en el crew" hint="Ej: Artista, Productor, Ingeniero de mezcla. Opcional.">
                    <Input value={m.role ?? ""} onChange={(e) => updateMember(idx, { role: e.target.value })} placeholder="Artista" />
                  </Field>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={c.artists.members.length <= 1}
                      onClick={() =>
                        setC((p) => ({ ...p, artists: { ...p.artists, members: p.artists.members.filter((_, i) => i !== idx) } }))
                      }
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
                onClick={() =>
                  setC((p) => ({
                    ...p,
                    artists: {
                      ...p.artists,
                      members: [
                        ...p.artists.members,
                        { name: "Nuevo miembro", genre: p.artists.producerGenres[0] ?? "Trap", bio: "Bio del miembro" },
                      ],
                    },
                  }))
                }
              >
                Añadir miembro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="site-section-beats" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Página pública — Beats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-[var(--text-muted)]">
            En la descripción del hero puedes usar <code className="font-mono">{"{{count}}"}</code> para insertar el número de
            beats disponibles.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Meta título">
              <Input
                value={c.beatsPage.metaTitle}
                onChange={(e) => setC((p) => ({ ...p, beatsPage: { ...p.beatsPage, metaTitle: e.target.value } }))}
              />
            </Field>
            <Field label="Hero — eyebrow (opcional)">
              <Input
                value={c.beatsPage.heroEyebrow ?? ""}
                onChange={(e) => setC((p) => ({ ...p, beatsPage: { ...p.beatsPage, heroEyebrow: e.target.value } }))}
              />
            </Field>
          </div>
          <Field label="Meta descripción">
            <Textarea
              rows={2}
              value={c.beatsPage.metaDescription}
              onChange={(e) => setC((p) => ({ ...p, beatsPage: { ...p.beatsPage, metaDescription: e.target.value } }))}
            />
          </Field>
          <Field label="Hero — título">
            <Input
              value={c.beatsPage.heroTitle}
              onChange={(e) => setC((p) => ({ ...p, beatsPage: { ...p.beatsPage, heroTitle: e.target.value } }))}
            />
          </Field>
          <Field label="Hero — descripción (plantilla)">
            <Textarea
              rows={3}
              value={c.beatsPage.heroDescriptionTemplate}
              onChange={(e) => setC((p) => ({ ...p, beatsPage: { ...p.beatsPage, heroDescriptionTemplate: e.target.value } }))}
            />
          </Field>
          <ImageUploadField
            label="Hero — imagen de fondo"
            aspect="video"
            value={c.beatsPage.heroImageUrl ?? ""}
            onChange={(v) => setC((p) => ({ ...p, beatsPage: { ...p.beatsPage, heroImageUrl: v } }))}
          />
        </CardContent>
      </Card>

      <Card id="site-section-productions" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Página pública — Producciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-[var(--text-muted)]">
            Usa <code className="font-mono">{"{{total}}"}</code> en el texto del hero y en la línea sobre la cuadrícula para el total
            del catálogo.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Meta título">
              <Input
                value={c.productionsPage.metaTitle}
                onChange={(e) => setC((p) => ({ ...p, productionsPage: { ...p.productionsPage, metaTitle: e.target.value } }))}
              />
            </Field>
            <Field label="Hero — título">
              <Input
                value={c.productionsPage.heroTitle}
                onChange={(e) => setC((p) => ({ ...p, productionsPage: { ...p.productionsPage, heroTitle: e.target.value } }))}
              />
            </Field>
          </div>
          <Field label="Meta descripción">
            <Textarea
              rows={2}
              value={c.productionsPage.metaDescription}
              onChange={(e) =>
                setC((p) => ({ ...p, productionsPage: { ...p.productionsPage, metaDescription: e.target.value } }))
              }
            />
          </Field>
          <Field label="Hero — descripción (plantilla)">
            <Textarea
              rows={3}
              value={c.productionsPage.heroDescriptionTemplate}
              onChange={(e) =>
                setC((p) => ({ ...p, productionsPage: { ...p.productionsPage, heroDescriptionTemplate: e.target.value } }))
              }
            />
          </Field>
          <Field label="Línea sobre la cuadrícula (plantilla)">
            <Input
              value={c.productionsPage.catalogCountLineTemplate}
              onChange={(e) =>
                setC((p) => ({ ...p, productionsPage: { ...p.productionsPage, catalogCountLineTemplate: e.target.value } }))
              }
            />
          </Field>
          <ImageUploadField
            label="Hero — imagen de fondo"
            aspect="video"
            value={c.productionsPage.heroImageUrl ?? ""}
            onChange={(v) => setC((p) => ({ ...p, productionsPage: { ...p.productionsPage, heroImageUrl: v } }))}
          />
        </CardContent>
      </Card>

      <Card id="site-section-releases" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Página pública — Lanzamientos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Meta título">
              <Input
                value={c.releasesPage.metaTitle}
                onChange={(e) => setC((p) => ({ ...p, releasesPage: { ...p.releasesPage, metaTitle: e.target.value } }))}
              />
            </Field>
            <Field label="Hero — eyebrow (opcional)">
              <Input
                value={c.releasesPage.heroEyebrow ?? ""}
                onChange={(e) => setC((p) => ({ ...p, releasesPage: { ...p.releasesPage, heroEyebrow: e.target.value } }))}
              />
            </Field>
          </div>
          <Field label="Meta descripción">
            <Textarea
              rows={2}
              value={c.releasesPage.metaDescription}
              onChange={(e) => setC((p) => ({ ...p, releasesPage: { ...p.releasesPage, metaDescription: e.target.value } }))}
            />
          </Field>
          <Field label="Hero — título">
            <Input
              value={c.releasesPage.heroTitle}
              onChange={(e) => setC((p) => ({ ...p, releasesPage: { ...p.releasesPage, heroTitle: e.target.value } }))}
            />
          </Field>
          <Field label="Hero — descripción">
            <Textarea
              rows={3}
              value={c.releasesPage.heroDescription}
              onChange={(e) => setC((p) => ({ ...p, releasesPage: { ...p.releasesPage, heroDescription: e.target.value } }))}
            />
          </Field>
          <Field label="Mensaje si no hay lanzamientos">
            <Textarea
              rows={2}
              value={c.releasesPage.emptyStateMessage}
              onChange={(e) => setC((p) => ({ ...p, releasesPage: { ...p.releasesPage, emptyStateMessage: e.target.value } }))}
            />
          </Field>
          <ImageUploadField
            label="Hero — imagen de fondo"
            aspect="video"
            value={c.releasesPage.heroImageUrl ?? ""}
            onChange={(v) => setC((p) => ({ ...p, releasesPage: { ...p.releasesPage, heroImageUrl: v } }))}
          />
        </CardContent>
      </Card>

      <Card id="site-section-booking-success" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Booking — página de confirmación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-[var(--text-muted)]">
            Textos de <code className="font-mono">/booking/success</code> (no indexada en buscadores).
          </p>
          <Field label="Meta título">
            <Input
              value={c.bookingSuccess.metaTitle}
              onChange={(e) => setC((p) => ({ ...p, bookingSuccess: { ...p.bookingSuccess, metaTitle: e.target.value } }))}
            />
          </Field>
          <Field label="Eyebrow (encima del código)">
            <Input
              value={c.bookingSuccess.eyebrow}
              onChange={(e) => setC((p) => ({ ...p, bookingSuccess: { ...p.bookingSuccess, eyebrow: e.target.value } }))}
            />
          </Field>
          <Field label="Párrafo principal">
            <Textarea
              rows={3}
              value={c.bookingSuccess.body}
              onChange={(e) => setC((p) => ({ ...p, bookingSuccess: { ...p.bookingSuccess, body: e.target.value } }))}
            />
          </Field>
          <Field label="Tagline (cursiva)">
            <Textarea
              rows={2}
              value={c.bookingSuccess.tagline}
              onChange={(e) => setC((p) => ({ ...p, bookingSuccess: { ...p.bookingSuccess, tagline: e.target.value } }))}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Botón WhatsApp">
              <Input
                value={c.bookingSuccess.whatsappCtaLabel}
                onChange={(e) =>
                  setC((p) => ({ ...p, bookingSuccess: { ...p.bookingSuccess, whatsappCtaLabel: e.target.value } }))
                }
              />
            </Field>
            <Field label="Enlace inicio">
              <Input
                value={c.bookingSuccess.homeLinkLabel}
                onChange={(e) =>
                  setC((p) => ({ ...p, bookingSuccess: { ...p.bookingSuccess, homeLinkLabel: e.target.value } }))
                }
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card id="site-section-release-detail" className={SECTION_CARD}>
        <CardHeader>
          <CardTitle className="font-display text-xl">Ficha de lanzamiento (/releases/[slug])</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-[var(--text-muted)]">
            Etiquetas compartidas en la vista pública de cada release (título y descripción del SEO siguen saliendo del propio
            release).
          </p>
          <Field label="Badge &quot;próximo&quot;">
            <Input
              value={c.releaseDetail.upcomingBadge}
              onChange={(e) => setC((p) => ({ ...p, releaseDetail: { ...p.releaseDetail, upcomingBadge: e.target.value } }))}
            />
          </Field>
          <Field label="Título sección &quot;más lanzamientos&quot;">
            <Input
              value={c.releaseDetail.moreSectionTitle}
              onChange={(e) =>
                setC((p) => ({ ...p, releaseDetail: { ...p.releaseDetail, moreSectionTitle: e.target.value } }))
              }
            />
          </Field>
          <Field label="CTA Spotify">
            <Input
              value={c.releaseDetail.spotifyCtaLabel}
              onChange={(e) =>
                setC((p) => ({ ...p, releaseDetail: { ...p.releaseDetail, spotifyCtaLabel: e.target.value } }))
              }
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CTA YouTube (próximo)">
              <Input
                value={c.releaseDetail.youtubeCtaUpcoming}
                onChange={(e) =>
                  setC((p) => ({ ...p, releaseDetail: { ...p.releaseDetail, youtubeCtaUpcoming: e.target.value } }))
                }
              />
            </Field>
            <Field label="CTA YouTube (publicado)">
              <Input
                value={c.releaseDetail.youtubeCtaReleased}
                onChange={(e) =>
                  setC((p) => ({ ...p, releaseDetail: { ...p.releaseDetail, youtubeCtaReleased: e.target.value } }))
                }
              />
            </Field>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
