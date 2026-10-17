"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { SiteLegal } from "@/types/site-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionCallout } from "@/components/shared/section-callout";
import { Field, SECTION_CARD, SubsectionTitle } from "./editor-field";

type Props = {
  legal: SiteLegal;
  onChange: (patch: Partial<SiteLegal>) => void;
};

function clampInt(v: string, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <span>{children}</span>
    </label>
  );
}

const PENDING = "Vacío = se omite para el público; en las páginas legales verás un aviso ámbar mientras tengas sesión.";

/** Card "Legal y cumplimiento": todos los campos de `legal` con ayudas. */
export function LegalCard({ legal, onChange }: Props) {
  const missing = [
    !legal.legalName.trim() && "razón social",
    !legal.nit.trim() && "NIT",
    !legal.address.trim() && "dirección",
    !legal.email.trim() && "correo PQR",
  ].filter(Boolean) as string[];

  return (
    <Card id="site-section-legal" className={SECTION_CARD}>
      <CardHeader>
        <CardTitle className="font-display text-xl">Legal y cumplimiento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionCallout>
          Estos datos se interpolan en{" "}
          <Link href="/legal/privacidad" target="_blank" className="inline-flex items-center gap-1 text-primary underline underline-offset-2">
            las páginas legales <ExternalLink className="h-3 w-3" aria-hidden />
          </Link>{" "}
          y en el pie de página. La Ley 1480/2011 obliga a identificar al vendedor (nombre, NIT, dirección y canal de PQR) en
          toda venta por internet.
          {missing.length ? (
            <span className="mt-2 block text-amber-300">Pendiente: {missing.join(", ")}.</span>
          ) : null}
        </SectionCallout>

        <div className="space-y-4">
          <SubsectionTitle>Identificación</SubsectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre comercial" hint="Como te conoce el público. Aparece en la casilla de autorización de datos.">
              <Input value={legal.businessName} onChange={(e) => onChange({ businessName: e.target.value })} />
            </Field>
            <Field
              label="Razón social o nombre del comerciante"
              hint={`Si eres persona natural, tu nombre completo tal como está en el RUT. ${PENDING}`}
            >
              <Input value={legal.legalName} onChange={(e) => onChange({ legalName: e.target.value })} placeholder="Ej: Juan Pérez / Sodimusic S.A.S." />
            </Field>
            <Field
              label="NIT"
              hint="Número de Identificación Tributaria que asigna la DIAN (persona natural: cédula + dígito de verificación, p. ej. 1234567890-1). Obligatorio para vender."
            >
              <Input value={legal.nit} onChange={(e) => onChange({ nit: e.target.value })} placeholder="900123456-7" className="font-mono" />
            </Field>
            <Field label="Dirección" hint={`Dirección física del estudio o de notificaciones. ${PENDING}`}>
              <Input value={legal.address} onChange={(e) => onChange({ address: e.target.value })} placeholder="Calle 00 # 00-00" />
            </Field>
            <Field label="Ciudad / departamento">
              <Input value={legal.city} onChange={(e) => onChange({ city: e.target.value })} />
            </Field>
            <Field label="País">
              <Input value={legal.country} onChange={(e) => onChange({ country: e.target.value })} />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <SubsectionTitle>Canal de PQR y datos personales</SubsectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Correo de PQR"
              hint="Correo donde recibes peticiones, quejas, reclamos y solicitudes de datos personales (Ley 1581/2012). Debes responder consultas en 10 días hábiles y reclamos en 15."
            >
              <Input type="email" value={legal.email} onChange={(e) => onChange({ email: e.target.value })} />
            </Field>
            <Field label="WhatsApp (solo números, con indicativo)" hint="Ej: 573215368590. Se usa en el pie, en las páginas legales y en el botón flotante.">
              <Input value={legal.phone} onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, "") })} inputMode="numeric" className="font-mono" />
            </Field>
            <Field label="Horario de atención" hint="Texto libre. Ej: Lunes a viernes, 9:00 a 18:00">
              <Input value={legal.hours} onChange={(e) => onChange({ hours: e.target.value })} />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <SubsectionTitle>Impuestos y precios</SubsectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle checked={legal.ivaIncluded} onChange={(v) => onChange({ ivaIncluded: v })}>
              Mostrar «IVA incluido» junto a los precios
              <span className="block text-[11px] text-[var(--text-muted)]">Los precios al público deben informarse con impuestos incluidos.</span>
            </Toggle>
            <Toggle checked={legal.ivaResponsible} onChange={(v) => onChange({ ivaResponsible: v })}>
              Soy responsable de IVA (emito factura electrónica)
              <span className="block text-[11px] text-[var(--text-muted)]">Si no lo eres, los términos dicen que emites el documento de venta de tu régimen.</span>
            </Toggle>
          </div>
        </div>

        <div className="space-y-4">
          <SubsectionTitle>Estudio</SubsectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Anticipo para confirmar sesión (%)" hint="0 a 100. Se muestra en el booking y en los términos del estudio.">
              <Input
                type="number"
                min={0}
                max={100}
                value={legal.depositPercent}
                onChange={(e) => onChange({ depositPercent: clampInt(e.target.value, 0, 100, 0) })}
              />
            </Field>
            <Field label="Horas mínimas para cancelar o reprogramar sin costo" hint="Ej: 24. Con menos aviso se pierde el anticipo.">
              <Input
                type="number"
                min={1}
                max={720}
                value={legal.cancellationHours}
                onChange={(e) => onChange({ cancellationHours: clampInt(e.target.value, 1, 720, 24) })}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <SubsectionTitle>Versiones de los documentos</SubsectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Versión de la política de privacidad"
              hint="Usa la fecha del último cambio (AAAA-MM-DD). Se guarda con cada autorización como prueba de qué versión aceptó la persona."
            >
              <Input value={legal.policyVersion} onChange={(e) => onChange({ policyVersion: e.target.value })} placeholder="2026-10-17" className="font-mono" />
            </Field>
            <Field label="Versión de los términos (tienda, estudio, beats, aviso)" hint="Misma lógica: fecha del último cambio.">
              <Input value={legal.termsVersion} onChange={(e) => onChange({ termsVersion: e.target.value })} placeholder="2026-10-17" className="font-mono" />
            </Field>
          </div>
        </div>

        <div className="space-y-4">
          <SubsectionTitle>Boletín (newsletter) en el pie</SubsectionTitle>
          <Toggle checked={legal.showNewsletter} onChange={(v) => onChange({ showNewsletter: v })}>
            Mostrar formulario de suscripción en el pie de página
          </Toggle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título">
              <Input value={legal.newsletterTitle} onChange={(e) => onChange({ newsletterTitle: e.target.value })} />
            </Field>
            <Field label="Texto del botón">
              <Input value={legal.newsletterCtaLabel} onChange={(e) => onChange({ newsletterCtaLabel: e.target.value })} />
            </Field>
          </div>
          <Field label="Subtítulo" hint="Di con qué frecuencia escribes: la Ley 2300/2023 limita el contacto comercial a una vez por semana por canal.">
            <Textarea rows={2} value={legal.newsletterSubtitle} onChange={(e) => onChange({ newsletterSubtitle: e.target.value })} />
          </Field>
        </div>

        <div className="space-y-4">
          <SubsectionTitle>WhatsApp flotante</SubsectionTitle>
          <Toggle checked={legal.floatingWhatsapp} onChange={(v) => onChange({ floatingWhatsapp: v })}>
            Mostrar botón flotante de WhatsApp en el sitio público
            <span className="block text-[11px] text-[var(--text-muted)]">Precarga un mensaje distinto en beats, tienda, booking y canales. Nunca se muestra en el panel.</span>
          </Toggle>
        </div>
      </CardContent>
    </Card>
  );
}
