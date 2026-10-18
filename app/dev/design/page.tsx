import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Bell, Heart, Inbox, Mail, Music2, Search, Share2, Users, Youtube } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeTone, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import { Divider } from "@/components/ui/divider";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FieldError } from "@/components/ui/field-error";
import { FieldHint } from "@/components/ui/field-hint";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Kicker } from "@/components/ui/kicker";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

import { AdminKpi } from "@/components/ds/admin-kpi";
import { AdminTable, AdminTableActions, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "@/components/ds/admin-table";
import { AdminToolbar } from "@/components/ds/admin-toolbar";
import { BentoGrid } from "@/components/ds/bento-grid";
import { CtaBand } from "@/components/ds/cta-band";
import { EditorialList } from "@/components/ds/editorial-list";
import { EditorialSplit } from "@/components/ds/editorial-split";
import { EmptyState } from "@/components/ds/empty-state";
import { FeatureRow } from "@/components/ds/feature-row";
import { FilterBar, FilterGroup } from "@/components/ds/filter-bar";
import { FormField } from "@/components/ds/form-field";
import { HeroCinematic } from "@/components/ds/hero-cinematic";
import { HeroPage } from "@/components/ds/hero-page";
import { ListRow } from "@/components/ds/list-row";
import { MediaCard } from "@/components/ds/media-card";
import { MediaFrame } from "@/components/ds/media-frame";
import { Pagination } from "@/components/ds/pagination";
import { PlayButton } from "@/components/ds/play-button";
import { SectionHeader } from "@/components/ds/section-header";
import { SmartLinkButton } from "@/components/ds/smart-link-button";
import { StatItem } from "@/components/ds/stat-item";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

const PHOTO = "/maria_la_bajafoto.jpg";
const LOGO = "/logosodi.jpeg";

const COLORS: { group: string; items: { name: string; cls: string; hex: string }[] }[] = [
  {
    group: "Tinta",
    items: [
      { name: "ink-0", cls: "bg-ink-0", hex: "#050404" },
      { name: "ink-1", cls: "bg-ink-1", hex: "#0b0a09" },
      { name: "ink-2", cls: "bg-ink-2", hex: "#131110" },
      { name: "ink-3", cls: "bg-ink-3", hex: "#1b1816" },
      { name: "ink-4", cls: "bg-ink-4", hex: "#262220" },
    ],
  },
  {
    group: "Fire",
    items: [
      { name: "fire-300", cls: "bg-fire-300", hex: "#ffb380" },
      { name: "fire-400", cls: "bg-fire-400", hex: "#ff8c33" },
      { name: "fire-500", cls: "bg-fire-500", hex: "#ff6b00" },
      { name: "fire-600", cls: "bg-fire-600", hex: "#d95a00" },
      { name: "fire-on", cls: "bg-fire-on", hex: "#120a04" },
    ],
  },
  {
    group: "Sea · Gold",
    items: [
      { name: "sea-400", cls: "bg-sea-400", hex: "#4fd1c5" },
      { name: "sea-500", cls: "bg-sea-500", hex: "#19b3a6" },
      { name: "gold-400", cls: "bg-gold-400", hex: "#e6b83a" },
      { name: "gold-500", cls: "bg-gold-500", hex: "#d4a017" },
    ],
  },
  {
    group: "Texto · semánticos",
    items: [
      { name: "text-1", cls: "bg-text-1", hex: "#f3efe8" },
      { name: "text-2", cls: "bg-text-2", hex: "#bdb6ac" },
      { name: "text-3", cls: "bg-text-3", hex: "#8f8a82" },
      { name: "success", cls: "bg-success", hex: "#3cc878" },
      { name: "warning", cls: "bg-warning", hex: "#e6b83a" },
      { name: "danger", cls: "bg-danger", hex: "#ff5a5a" },
      { name: "info", cls: "bg-info", hex: "#4fd1c5" },
      { name: "whatsapp", cls: "bg-whatsapp", hex: "#25d366" },
    ],
  },
];

const TONES: BadgeTone[] = ["neutral", "fire", "sea", "gold", "success", "warning", "danger"];
const VARIANTS: BadgeVariant[] = ["solid", "soft", "outline"];

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-section border-b border-line-1">
      <div className="container-page">
        <Heading as="h2" id={`${id}-title`} size="display-md" className="mb-12">
          {title}
        </Heading>
        <div className="flex flex-col gap-16">{children}</div>
      </div>
    </section>
  );
}

function Demo({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-5 text-label text-text-3">{title}</p>
      {children}
    </div>
  );
}

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <TooltipProvider delayDuration={200}>
      <main id="contenido-principal" className="relative z-[2]">
        {/* Índice */}
        <header className="border-b border-line-1 bg-ink-1">
          <div className="container-page flex flex-wrap items-end justify-between gap-6 pb-10 pt-12">
            <div>
              <Eyebrow>Sodimusic · Design language v4</Eyebrow>
              <Heading as="h1" size="display-lg" accent="de noche" className="mt-4">
                Caribe de noche, editorial
              </Heading>
            </div>
            <nav aria-label="Secciones" className="flex flex-wrap gap-2">
              {["tokens", "atoms", "molecules", "organisms"].map((s) => (
                <Chip key={s} href={`#${s}`} scroll>
                  {s}
                </Chip>
              ))}
            </nav>
          </div>
        </header>

        {/* ------------------------------------------------------------------ TOKENS */}
        <Block id="tokens" title="Tokens">
          <Demo title="Paleta">
            <div className="grid gap-8 md:grid-cols-2">
              {COLORS.map((g) => (
                <div key={g.group}>
                  <Text size="label" tone="2" as="p" className="mb-3">
                    {g.group}
                  </Text>
                  <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-8 md:[&>li]:col-span-2">
                    {g.items.map((c) => (
                      <li key={c.name} className="min-w-0">
                        <div className={`${c.cls} h-14 rounded border border-line-2`} />
                        <p className="mt-1.5 truncate font-mono text-label-sm normal-case text-text-2">{c.name}</p>
                        <p className="font-mono text-label-sm normal-case text-text-3">{c.hex}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Demo>

          <Demo title="Escala tipográfica">
            <div className="flex flex-col gap-8 overflow-hidden">
              {(
                [
                  ["display-xl", "clamp(56, 11vw, 152) / 0.92"],
                  ["display-lg", "clamp(40, 7.5vw, 104) / 0.95"],
                  ["display-md", "clamp(32, 4.5vw, 64) / 1"],
                  ["display-sm", "clamp(24, 3vw, 40) / 1.05"],
                ] as const
              ).map(([size, meta]) => (
                <div key={size} className="border-b border-line-1 pb-6">
                  <p className="mb-2 font-mono text-label-sm normal-case text-text-3">
                    text-{size} · {meta}
                  </p>
                  <Heading as="p" size={size} accent="noche">
                    Caribe de noche
                  </Heading>
                </div>
              ))}
              <div className="grid gap-6 border-b border-line-1 pb-6 md:grid-cols-2">
                <div>
                  <p className="mb-2 font-mono text-label-sm normal-case text-text-3">text-title · 20/1.25 DM Sans 600</p>
                  <p className="text-title text-text-1">Título de tarjeta: Montes de María Riddim</p>
                </div>
                <div>
                  <p className="mb-2 font-mono text-label-sm normal-case text-text-3">text-accent · Instrument Serif italic</p>
                  <p className="text-accent text-display-sm text-fire-300">la champeta abrió el camino</p>
                </div>
                <div>
                  <p className="mb-2 font-mono text-label-sm normal-case text-text-3">text-body-lg · 18/1.6</p>
                  <Text size="body-lg">Sello discográfico independiente desde 2016 en María La Baja, Bolívar.</Text>
                </div>
                <div>
                  <p className="mb-2 font-mono text-label-sm normal-case text-text-3">text-body · 16/1.6 · text-body-sm · 14/1.5</p>
                  <Text size="body">Trap, afrobeat, reggaeton y dancehall con raíces afrocolombianas.</Text>
                  <Text size="body-sm" tone="3" className="mt-2">
                    Secundario a 14 px en texto 3 (5.6:1).
                  </Text>
                </div>
                <div>
                  <p className="mb-2 font-mono text-label-sm normal-case text-text-3">text-label · 12 mono 0.14em</p>
                  <Text size="label" tone="2">
                    140 BPM · Trap · 2026
                  </Text>
                </div>
                <div>
                  <p className="mb-2 font-mono text-label-sm normal-case text-text-3">text-label-sm · 11 mono 0.12em (solo badges)</p>
                  <Text size="label-sm" tone="3">
                    IVA incluido
                  </Text>
                </div>
              </div>
            </div>
          </Demo>

          <div className="grid gap-10 md:grid-cols-3">
            <Demo title="Radios">
              <div className="flex flex-wrap gap-4">
                {(["rounded-sm", "rounded", "rounded-lg", "rounded-full"] as const).map((r) => (
                  <div key={r} className="text-center">
                    <div className={`${r} h-16 w-16 border border-line-2 bg-ink-3`} />
                    <p className="mt-2 font-mono text-label-sm normal-case text-text-3">{r}</p>
                  </div>
                ))}
              </div>
            </Demo>
            <Demo title="Sombras">
              <div className="flex flex-wrap gap-6">
                {(["shadow-card", "shadow-fire", "shadow-pop"] as const).map((s) => (
                  <div key={s} className="text-center">
                    <div className={`${s} h-16 w-24 rounded-lg border border-line-1 bg-ink-2`} />
                    <p className="mt-2 font-mono text-label-sm normal-case text-text-3">{s}</p>
                  </div>
                ))}
              </div>
            </Demo>
            <Demo title="Tratamiento de imagen">
              <div className="grid grid-cols-3 gap-3">
                <MediaFrame src={PHOTO} alt="" aspect="1/1" treatment="duotone" hoverReveal rounded="md" sizes="120px" />
                <MediaFrame src={PHOTO} alt="" aspect="1/1" treatment="veil" rounded="md" sizes="120px" />
                <MediaFrame src={PHOTO} alt="" aspect="1/1" treatment="none" rounded="md" sizes="120px" className="grain" />
              </div>
              <p className="mt-2 font-mono text-label-sm normal-case text-text-3">media-duotone (hover revela) · media-veil · grain</p>
            </Demo>
          </div>
        </Block>

        {/* ------------------------------------------------------------------ ÁTOMOS */}
        <Block id="atoms" title="Átomos">
          <Demo title="Button · variantes">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="whatsapp">
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button variant="danger">Danger</Button>
            </div>
          </Demo>
          <Demo title="Button · tamaños, pill, withArrow, loading, disabled, asChild">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small 36</Button>
              <Button size="md">Medium 44</Button>
              <Button size="lg">Large 52</Button>
              <Button size="xl">XL 60</Button>
              <Button size="icon" aria-label="Buscar">
                <Search />
              </Button>
              <Button pill withArrow>
                Pill con flecha
              </Button>
              <Button variant="outline" pill withArrow>
                Outline pill
              </Button>
              <Button loading>Enviando</Button>
              <Button disabled>Disabled</Button>
              <Button asChild variant="outline" withArrow>
                <Link href="/beats">asChild Link</Link>
              </Button>
            </div>
          </Demo>
          <Demo title="IconButton">
            <div className="flex flex-wrap items-center gap-3">
              <IconButton aria-label="Me gusta" variant="primary">
                <Heart />
              </IconButton>
              <IconButton aria-label="Compartir" variant="secondary">
                <Share2 />
              </IconButton>
              <IconButton aria-label="YouTube" variant="outline">
                <Youtube />
              </IconButton>
              <IconButton aria-label="Notificaciones" variant="ghost">
                <Bell />
              </IconButton>
              <IconButton aria-label="WhatsApp" variant="whatsapp">
                <WhatsAppIcon className="h-5 w-5" />
              </IconButton>
              <IconButton aria-label="Eliminar" variant="danger" size="sm">
                <Share2 />
              </IconButton>
              <IconButton aria-label="Grande" variant="outline" size="lg">
                <Music2 />
              </IconButton>
              <IconButton aria-label="Cuadrado" variant="secondary" pill={false}>
                <Search />
              </IconButton>
            </div>
          </Demo>

          <Demo title="Badge · tone × variant × size">
            <div className="flex flex-col gap-3">
              {VARIANTS.map((v) => (
                <div key={v} className="flex flex-wrap items-center gap-2">
                  <span className="w-16 font-mono text-label-sm normal-case text-text-3">{v}</span>
                  {TONES.map((t) => (
                    <Badge key={t} tone={t} variant={v}>
                      {t}
                    </Badge>
                  ))}
                  <Badge tone="fire" variant={v} size="md" icon={<Music2 />}>
                    md + icono
                  </Badge>
                </div>
              ))}
            </div>
          </Demo>

          <Demo title="Chip · idle / selected / count / disabled / link">
            <div className="flex flex-wrap gap-2">
              <Chip>Todos</Chip>
              <Chip selected count={12}>
                Trap
              </Chip>
              <Chip count={0}>Reggaeton</Chip>
              <Chip disabled>Agotado</Chip>
              <Chip href="#atoms" selected>
                Enlace activo
              </Chip>
            </div>
          </Demo>

          <div className="grid gap-10 md:grid-cols-2">
            <Demo title="Eyebrow · fire / serif / serif lg">
              <div className="flex flex-col gap-4">
                <Eyebrow>Quiénes somos</Eyebrow>
                <Eyebrow tone="serif">Desde María La Baja para el mundo</Eyebrow>
                <Eyebrow tone="serif" size="lg">
                  Notas al margen
                </Eyebrow>
              </div>
            </Demo>
            <Demo title="Kicker · Divider">
              <div className="flex items-start gap-8">
                <Kicker>01</Kicker>
                <Kicker size="lg">02</Kicker>
              </div>
              <div className="mt-6 flex flex-col gap-4">
                <Divider />
                <Divider variant="fire" />
                <Divider variant="dots" />
              </div>
            </Demo>
          </div>

          <Demo title="Heading · as / size / accent / tone">
            <div className="flex flex-col gap-5">
              <Heading as="h3" size="display-sm" accent="Sodimusic">
                Sonido Sodimusic
              </Heading>
              <Heading as="h3" size="title">
                Título de tarjeta (text-title)
              </Heading>
              <Heading as="h3" size="display-sm" tone="fire">
                Tono fire
              </Heading>
              <Heading as="h3" size="display-sm" tone="2">
                Tono 2 con <em>énfasis manual</em>
              </Heading>
            </div>
          </Demo>

          <Demo title="Text · tonos">
            <div className="grid gap-3 md:grid-cols-3">
              <Text tone="1">Texto 1 — principal (15.6:1).</Text>
              <Text tone="2">Texto 2 — secundario (9.4:1).</Text>
              <Text tone="3">Texto 3 — mínimo (5.6:1), nunca bajo 12 px.</Text>
            </div>
          </Demo>

          <div className="grid gap-10 md:grid-cols-2">
            <Demo title="Price · md / lg / prefix / note / compareAt / fire">
              <div className="flex flex-col gap-4">
                <Price amount={180000} prefix="desde" note="IVA incl." />
                <Price amount={250000} size="lg" prefix="desde" note="IVA incl." tone="fire" />
                <Price amount={89000} compareAt={104000} size="sm" />
              </div>
            </Demo>
            <Demo title="Avatar · 32 / 40 / 56 / 80 · square">
              <div className="flex flex-wrap items-end gap-4">
                <Avatar name="Jeivy Lazy" size={32} />
                <Avatar name="XMEN" size={40} />
                <Avatar name="Sodimusic" size={56} src={LOGO} />
                <Avatar name="Montes" size={80} />
                <Avatar name="Canal" size={56} square />
              </div>
            </Demo>
          </div>

          <Demo title="Icon · 16 / 20 / 24 · Kbd · Tooltip">
            <div className="flex flex-wrap items-center gap-6">
              <span className="inline-flex items-center gap-3 text-text-2">
                <Icon icon={Music2} size={16} />
                <Icon icon={Music2} size={20} />
                <Icon icon={Music2} size={24} />
              </span>
              <span className="inline-flex items-center gap-2 text-body-sm text-text-2">
                Buscar <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    Con tooltip
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Pide el beat por WhatsApp</TooltipContent>
              </Tooltip>
            </div>
          </Demo>

          <Demo title="Formulario · Input / Textarea / Select / Checkbox / Radio / Switch / Label / FieldHint / FieldError">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ds-name" required>
                  Nombre artístico
                </Label>
                <Input id="ds-name" placeholder="Tu nombre" />
                <FieldHint>Como quieres aparecer en los créditos.</FieldHint>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ds-email">Email</Label>
                <Input id="ds-email" type="email" defaultValue="correo-invalido" aria-invalid="true" />
                <FieldError>Escribe un correo válido.</FieldError>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ds-select">Género</Label>
                <Select>
                  <SelectTrigger id="ds-select">
                    <SelectValue placeholder="Elige un género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trap">Trap</SelectItem>
                    <SelectItem value="champeta">Champeta</SelectItem>
                    <SelectItem value="afro">Afrobeat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ds-disabled">Deshabilitado</Label>
                <Input id="ds-disabled" disabled placeholder="No editable" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="ds-msg">Mensaje</Label>
                <Textarea id="ds-msg" placeholder="Cuéntanos de tu proyecto" />
              </div>
              <div className="flex flex-col gap-4">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-text-1">
                  <Checkbox defaultChecked /> Autorizo el tratamiento de datos
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-text-1">
                  <Checkbox /> Sin marcar
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-text-1">
                  <Switch defaultChecked /> Solo disponibles
                </label>
              </div>
              <RadioGroup defaultValue="mp3" aria-label="Licencia">
                {["mp3", "wav", "stems"].map((v) => (
                  <label key={v} className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-text-1">
                    <RadioGroupItem value={v} /> Licencia {v.toUpperCase()}
                  </label>
                ))}
              </RadioGroup>
            </div>
          </Demo>

          <Demo title="Skeleton · text / media / circle">
            <div className="flex items-start gap-6">
              <div className="flex w-48 flex-col gap-2">
                <Skeleton className="w-3/4" />
                <Skeleton className="w-1/2" />
              </div>
              <Skeleton shape="media" aspect="1/1" className="w-32" />
              <Skeleton shape="circle" />
            </div>
          </Demo>
        </Block>

        {/* ------------------------------------------------------------------ MOLÉCULAS */}
        <Block id="molecules" title="Moléculas">
          <Demo title="SectionHeader · kicker + eyebrow + accent + lead + action">
            <SectionHeader
              kicker="03"
              eyebrow="Producciones"
              title="Lo que suena desde el Caribe"
              accent="Caribe"
              lead="Producciones destacadas del sello: trap, champeta y afrobeat grabados en María La Baja y Medellín."
              action={
                <Button asChild variant="outline" withArrow>
                  <Link href="/productions">Ver todas</Link>
                </Button>
              }
              className="mb-0"
            />
          </Demo>

          <Demo title="MediaFrame · aspect / badges / overlay / center">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <MediaFrame src={PHOTO} alt="4/5 duotono" aspect="4/5" badges={<Badge tone="fire">Nuevo</Badge>} badgesEnd={<Badge tone="gold" variant="solid">-14 %</Badge>} />
              <MediaFrame src={PHOTO} alt="1/1 con play" aspect="1/1" center={<PlayButton size={56} variant="glass" title="Demo" />} />
              <MediaFrame src={PHOTO} alt="16/9 overlay" aspect="16/9" treatment="veil" overlay={<Text size="label" tone="1">Overlay inferior</Text>} className="col-span-2 md:col-span-1" />
              <MediaFrame alt="Sin imagen" aspect="3/4" fallbackSeed="Montes de María" fallbackLabel="Placeholder" />
            </div>
          </Demo>

          <Demo title="MediaCard · vertical / horizontal / overlay">
            <div className="grid gap-6 md:grid-cols-3">
              <MediaCard
                src={PHOTO}
                alt="Portada"
                title="Montes de María Riddim"
                href="#molecules"
                meta={
                  <>
                    <Badge tone="fire">Dancehall</Badge>
                    <Badge>90 BPM</Badge>
                  </>
                }
                description="Producción con tambores alegres y bajo profundo."
                action={<Price amount={180000} size="sm" />}
              />
              <MediaCard src={PHOTO} alt="Portada" title="Caribe Trap 01" layout="horizontal" aspect="1/1" meta={<Badge tone="sea">Exclusivo</Badge>} action={<PlayButton size={40} title="Caribe Trap 01" />} />
              <MediaCard src={PHOTO} alt="Portada" title="Palenque Groove" layout="overlay" aspect="4/5" href="#molecules" meta={<Badge tone="gold" variant="solid">Destacado</Badge>} description="Jeivy Lazy · 2026" />
            </div>
          </Demo>

          <Demo title="ListRow · media + meta + data + action · muted · active">
            <ul className="rounded-lg border border-line-1 bg-ink-1/60">
              <ListRow
                as="li"
                media={<PlayButton size={40} title="Caribe Trap 01" state="playing" progress={42} />}
                title="Caribe Trap 01"
                meta={
                  <>
                    <Badge tone="fire">Trap</Badge>
                    <span>Oscuro</span>
                  </>
                }
                data="140 BPM"
                action={<Button size="sm">Licencia</Button>}
                active
              />
              <ListRow
                as="li"
                media={<Avatar name="Sodimusic TV" size={56} square src={LOGO} />}
                title="Sodimusic TV"
                href="#molecules"
                meta={<span className="font-mono">@sodimusictv</span>}
                data="12,4 k"
                action={
                  <Button size="sm" className="bg-[#d90000] text-text-1 shadow-none hover:bg-[#ff1a1a]">
                    Suscribirse
                  </Button>
                }
              />
              <ListRow as="li" media={<Avatar name="Palenque" size={56} square />} title="Palenque Groove" meta={<Badge tone="neutral">Vendido</Badge>} data="105 BPM" muted />
            </ul>
          </Demo>

          <Demo title="StatItem · FeatureRow">
            <div className="grid gap-10 md:grid-cols-2">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <StatItem value="50" suffix="+" label="Producciones" />
                <StatItem value="10" label="Años activos" />
                <StatItem value="5" label="Géneros" />
                <StatItem value="3" label="Ciudades" />
              </div>
              <div>
                <FeatureRow index={1} title="Elige tu beat" description="Escucha el preview y compara licencias." />
                <FeatureRow index={2} title="Paga el anticipo" description="Por WhatsApp o transferencia." href="#molecules" aside={<Price amount={80000} size="sm" prefix="desde" />} />
                <FeatureRow icon={Mail} title="Recibe los archivos" description="WAV + stems en 24 h." />
              </div>
            </div>
          </Demo>

          <Demo title="FilterBar · FilterGroup + Chips + slot end">
            <FilterBar
              end={
                <>
                  <IconButton aria-label="Ver en lista" variant="secondary" size="sm" pill={false}>
                    <Inbox />
                  </IconButton>
                  <IconButton aria-label="Ver en grilla" variant="outline" size="sm" pill={false}>
                    <Users />
                  </IconButton>
                </>
              }
              className="-mx-4 sm:-mx-6 lg:mx-0 lg:rounded-lg lg:border"
            >
              <FilterGroup label="Género" showLabel>
                {["Todos", "Trap", "Reggaeton", "Afrobeat", "Dancehall", "Champeta"].map((g, i) => (
                  <li key={g}>
                    <Chip selected={i === 0} count={i === 0 ? 24 : i}>
                      {g}
                    </Chip>
                  </li>
                ))}
              </FilterGroup>
              <FilterGroup label="Mood" showLabel>
                {["Cualquiera", "Energético", "Festivo", "Nostálgico", "Oscuro"].map((g, i) => (
                  <li key={g}>
                    <Chip selected={i === 0}>{g}</Chip>
                  </li>
                ))}
              </FilterGroup>
            </FilterBar>
          </Demo>

          <div className="grid gap-10 md:grid-cols-2">
            <Demo title="Pagination">
              <Pagination page={4} pageCount={12} hrefTemplate="#page-{page}" />
            </Demo>
            <Demo title="PlayButton · 40 / 56 / 72 · idle / playing / loading · ring · glass">
              <div className="flex flex-wrap items-center gap-4">
                <PlayButton size={40} title="Demo" />
                <PlayButton size={56} title="Demo" state="playing" progress={65} />
                <PlayButton size={72} title="Demo" state="loading" />
                <span className="relative inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg">
                  <MediaFrame src={PHOTO} alt="" aspect="1/1" rounded="lg" sizes="96px" className="absolute inset-0" />
                  <PlayButton size={56} title="Demo" variant="glass" className="relative" />
                </span>
              </div>
            </Demo>
          </div>

          <Demo title="EmptyState">
            <EmptyState icon={Inbox} title="Aún no hay beats" description="Vuelve pronto o pide uno a medida por WhatsApp." action={<Button variant="whatsapp">Pedir por WhatsApp</Button>} />
          </Demo>

          <Demo title="FormField · hint / error / inline">
            <div className="grid gap-6 md:grid-cols-3">
              <FormField id="ff-name" label="Nombre" required hint="Como aparece en tu cédula.">
                <Input placeholder="Nombre completo" />
              </FormField>
              <FormField id="ff-phone" label="WhatsApp" error="Escribe un número válido.">
                <Input defaultValue="123" />
              </FormField>
              <FormField id="ff-consent" label="Autorizo el tratamiento de mis datos" inline required>
                <Checkbox />
              </FormField>
            </div>
          </Demo>

          <Demo title="SmartLinkButton">
            <div className="flex flex-wrap gap-2">
              <SmartLinkButton platform="spotify" href="https://open.spotify.com" />
              <SmartLinkButton platform="apple" href="https://music.apple.com" />
              <SmartLinkButton platform="youtube" href="https://youtube.com" />
              <SmartLinkButton platform="deezer" href="https://deezer.com" size="sm" />
              <SmartLinkButton platform="other" href="https://example.com" label="Escuchar" size="sm" />
              <SmartLinkButton platform="spotify" href="https://open.spotify.com" iconOnly />
            </div>
          </Demo>

          <Demo title="AdminKpi · AdminToolbar · AdminTable">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <AdminKpi label="Mensajes nuevos" value="18" delta={12} icon={Mail} />
              <AdminKpi label="Reservas del mes" value="7" delta={-8} icon={Users} />
              <AdminKpi label="Beats vendidos" value="3" delta={0} icon={Music2} />
              <AdminKpi label="Visitas (7 d)" value="2.431" />
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <AdminToolbar
                sticky={false}
                search={<Input placeholder="Buscar beats…" aria-label="Buscar" />}
                filters={
                  <>
                    <Chip selected>Todos</Chip>
                    <Chip>Disponibles</Chip>
                    <Chip>Vendidos</Chip>
                  </>
                }
                summary="24 resultados"
                action={<Button size="sm">Nuevo beat</Button>}
              />
              <AdminTable>
                <AdminTableHead>
                  <AdminTableRow>
                    <AdminTableHeader>Título</AdminTableHeader>
                    <AdminTableHeader>Género</AdminTableHeader>
                    <AdminTableHeader align="right">BPM</AdminTableHeader>
                    <AdminTableHeader align="right">Precio</AdminTableHeader>
                    <AdminTableHeader>Estado</AdminTableHeader>
                    <AdminTableHeader align="right">
                      <span className="sr-only">Acciones</span>
                    </AdminTableHeader>
                  </AdminTableRow>
                </AdminTableHead>
                <AdminTableBody>
                  {[
                    ["Caribe Trap 01", "Trap", 140, 250000, "Exclusivo", "sea"],
                    ["Montes de María Riddim", "Dancehall", 90, 180000, "Disponible", "success"],
                    ["Palenque Groove", "Afrobeat", 105, 220000, "Vendido", "neutral"],
                  ].map(([t, g, bpm, price, st, tone]) => (
                    <AdminTableRow key={String(t)}>
                      <AdminTableCell className="font-medium">{t}</AdminTableCell>
                      <AdminTableCell>
                        <Badge>{g}</Badge>
                      </AdminTableCell>
                      <AdminTableCell mono align="right">
                        {bpm}
                      </AdminTableCell>
                      <AdminTableCell mono align="right">
                        <Price amount={Number(price)} size="sm" />
                      </AdminTableCell>
                      <AdminTableCell>
                        <Badge tone={tone as BadgeTone} variant="soft">
                          {st}
                        </Badge>
                      </AdminTableCell>
                      <AdminTableActions>
                        <IconButton aria-label="Editar" size="sm">
                          <Share2 />
                        </IconButton>
                        <IconButton aria-label="Eliminar" size="sm" className="hover:text-danger">
                          <Inbox />
                        </IconButton>
                      </AdminTableActions>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            </div>
          </Demo>
        </Block>

        {/* ------------------------------------------------------------------ ORGANISMOS */}
        <section id="organisms" aria-labelledby="organisms-title" className="py-section">
          <div className="container-page">
            <Heading as="h2" id="organisms-title" size="display-md" className="mb-12">
              Organismos
            </Heading>
          </div>

          <div className="flex flex-col gap-24">
            <div>
              <p className="container-page mb-5 text-label text-text-3">HeroCinematic</p>
              <HeroCinematic
                title="Sodimusic"
                eyebrow="Est. 2016 · María La Baja, Bolívar"
                tagline="María La Baja, cerca de Cartagena: la champeta abrió el camino"
                imageUrl={PHOTO}
                imageAlt="Iglesia de María La Baja"
                primary={{ href: "/booking", label: "Agenda tu sesión" }}
                secondary={{ href: "/productions", label: "Ver producciones" }}
                latest={{ title: "Proyecto Montes 2026", artistName: "Jeivy Lazy · XMEN", slug: "proyecto-montes", upcoming: true, coverUrl: LOGO }}
                ariaLabel="Demo hero"
                className="min-h-[70svh]"
              />
            </div>

            <div className="pt-12">
              <p className="container-page mb-5 text-label text-text-3">HeroPage · con slot derecho</p>
              <HeroPage
                eyebrow="Beats disponibles"
                title="Beats con sabor a Caribe"
                accent="Caribe"
                description="2 beats disponibles ahora. Precios en COP. El cierre es directo con el sello."
                titleId="demo-hero-page"
                aside={
                  <div className="flex flex-col gap-4 lg:items-end">
                    <StatItem value="12" label="Disponibles" orientation="left" className="lg:border-l-0 lg:border-r lg:pl-0 lg:pr-4 lg:text-right" />
                    <div className="flex flex-wrap gap-1.5 lg:justify-end">
                      <Badge tone="fire">MP3</Badge>
                      <Badge tone="fire">WAV</Badge>
                      <Badge tone="fire">Stems</Badge>
                      <Badge tone="gold">Exclusiva</Badge>
                    </div>
                    <Price amount={80000} prefix="desde" note="IVA incl." />
                  </div>
                }
              />
            </div>

            <div className="container-page">
              <p className="mb-5 text-label text-text-3">EditorialSplit · imagen 4/5 que sobresale + cita serif</p>
              <div className="py-12">
                <EditorialSplit
                  quote="Memoria costeña en formato global: no es urbano genérico."
                  image={{ src: PHOTO, alt: "Iglesia colonial de María La Baja", sizes: "(max-width: 1024px) 100vw, 40vw" }}
                  caption="Montes de María · Costa Caribe · 2026"
                >
                  <SectionHeader eyebrow="Quiénes somos" title="Raíz en champeta, sonido sin fronteras" accent="sin fronteras" className="mb-6" />
                  <Text size="body-lg" className="container-prose">
                    Sodimusic Company nace en María La Baja, Bolívar, a pocos kilómetros de Cartagena: tierra donde la champeta marcó el barrio y los ritmos africanos resuenan en cada esquina.
                  </Text>
                  <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
                    <StatItem value="50" suffix="+" label="Producciones" />
                    <StatItem value="10" label="Años" />
                    <StatItem value="5" label="Géneros" />
                    <StatItem value="3" label="Ciudades" />
                  </div>
                </EditorialSplit>
              </div>
            </div>

            <div className="container-page">
              <p className="mb-5 text-label text-text-3">BentoGrid · 8/4 · 4/4/4 · 6/6</p>
              <BentoGrid>
                {["Montes de María Riddim", "Caribe Trap 01", "Palenque Groove", "Afro Noche", "Dancehall Sur", "Champeta Digital", "Trap Bolívar"].map((t, i) => (
                  <MediaCard
                    key={t}
                    layout="overlay"
                    src={PHOTO}
                    alt={t}
                    aspect={i === 0 ? "16/9" : "4/5"}
                    title={t}
                    href="#organisms"
                    meta={
                      <>
                        <Badge tone="fire">2026</Badge>
                        <Badge>Trap</Badge>
                      </>
                    }
                    description="Jeivy Lazy"
                    className="h-full"
                  />
                ))}
              </BentoGrid>
            </div>

            <div className="container-page">
              <p className="mb-5 text-label text-text-3">EditorialList · hover revela imagen flotante (escritorio)</p>
              <EditorialList
                items={[
                  { id: "champeta", index: 1, title: "Champeta", description: "El sonido de Palenque y Cartagena, raíz del sello.", imageUrl: PHOTO, size: "display-sm", aside: <Badge tone="fire">Raíz</Badge> },
                  { id: "trap", index: 2, title: "Trap", description: "808 con acento costeño.", imageUrl: PHOTO, size: "display-sm", aside: <Badge tone="sea">Crew</Badge> },
                  { id: "afro", index: 3, title: "Afrobeat", description: "Percusión que viaja de Lagos a Bolívar.", imageUrl: PHOTO, size: "display-sm", aside: <Badge tone="gold">Nuevo</Badge> },
                ]}
              />
            </div>

            <div className="flex flex-col gap-10">
              <CtaBand
                id="demo-cta-fire"
                title="¿Tienes un proyecto?"
                accent="proyecto"
                lead="Grabación, mezcla y producción en María La Baja y Medellín."
                actions={
                  <>
                    <Button asChild variant="secondary" size="lg" className="border-fire-on/20 bg-ink-0 text-text-1 hover:bg-ink-2">
                      <Link href="/contacto">Escríbenos</Link>
                    </Button>
                    <Button variant="whatsapp" size="lg">
                      <WhatsAppIcon className="h-5 w-5" />
                      WhatsApp
                    </Button>
                  </>
                }
                aside={
                  <>
                    <IconButton aria-label="YouTube" variant="outline" className="border-fire-on/30 text-fire-on hover:border-fire-on hover:text-fire-on">
                      <Youtube />
                    </IconButton>
                    <IconButton aria-label="Correo" variant="outline" className="border-fire-on/30 text-fire-on hover:border-fire-on hover:text-fire-on">
                      <Mail />
                    </IconButton>
                  </>
                }
              />
              <CtaBand
                id="demo-cta-ink"
                tone="ink"
                title="Escucha lo último del sello"
                accent="lo último"
                actions={
                  <Button asChild withArrow size="lg">
                    <Link href="/releases">Ver lanzamientos</Link>
                  </Button>
                }
              />
            </div>
          </div>
          <p className="container-page mt-12 flex items-center gap-2 text-body-sm text-text-3">
            Navbar, Footer y PlayerBar se revisan en las rutas públicas (<Link href="/" className="link-sweep text-fire-400">/</Link>,{" "}
            <Link href="/beats" className="link-sweep text-fire-400">/beats</Link>).
            <ArrowRight className="h-4 w-4" aria-hidden />
          </p>
        </section>
      </main>
    </TooltipProvider>
  );
}
