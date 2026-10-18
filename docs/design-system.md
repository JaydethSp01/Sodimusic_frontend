# Sodimusic Design System v4 — guía de uso

Contrato: `docs/superpowers/specs/2026-10-18-sodimusic-design-language-v4.md`. Página de muestra: `/dev/design` (solo fuera de producción). Esta guía es lo que leen los agentes de vistas: cada átomo/molécula/organismo con su API y un ejemplo corto.

Regla general: **todo valor viene de un token**. Un componente nuevo solo si ninguno existente sirve con una variante. `cn()` (`lib/utils.ts`) ya conoce las clases del sistema, así que `className` siempre se puede extender sin que tailwind-merge descarte `text-display-*`, `text-label`, `font-display`, `shadow-fire`, `z-nav`…

## 1. Tokens

### Color (Tailwind)

| Grupo | Clases | Uso |
|---|---|---|
| Tinta | `bg-ink-0` (página) · `bg-ink-1` (secciones alternas) · `bg-ink-2` (tarjetas) · `bg-ink-3` (inputs, popovers) · `bg-ink-4` (hover de elevado) | Fondos |
| Fire | `fire-300` (texto sobre oscuro) · `fire-400` (enlaces, hover) · `fire-500` (= acción) · `fire-600` · `fire-on` (texto sobre fire) | **Acción y énfasis**: CTA, estado activo, subrayados, cifras clave |
| Sea | `sea-400` · `sea-500` · `sea-on` | ≤ 10 %: seleccionado, datos, enlaces secundarios |
| Gold | `gold-400` · `gold-500` | Solo "destacado"/premium (badges, estrellas, fijado) |
| Texto | `text-text-1` / `.text-1` (principal, 15.6:1) · `text-text-2` / `.text-2` (9.4:1) · `text-text-3` / `.text-3` (5.6:1, nunca < 12 px) | Jerarquía |
| Líneas | `border-line-1` (por defecto) · `border-line-2` (controles, chips) · `border-line-fire` | |
| Semánticos | `success` · `warning` · `danger` · `info` · `whatsapp` | Estados |

Los tokens nuevos están en hexadecimal en `tailwind.config.ts` para que funcionen los modificadores de opacidad (`bg-fire-500/[0.14]`); las variables CSS equivalentes viven en `app/globals.css`. Los nombres antiguos (`bg-background`, `text-primary`, `border-border`, `text-[var(--text-secondary)]`…) siguen funcionando como alias: **no usarlos en código nuevo**.

### Tipografía

| Clase | Tamaño / interlínea | Notas |
|---|---|---|
| `text-display-xl` | clamp(56, 11vw, 152) / 0.92 | H1 de portada |
| `text-display-lg` | clamp(40, 7.5vw, 104) / 0.95 | H1 de página (mínimo 40 px, ver § Decisiones) |
| `text-display-md` | clamp(32, 4.5vw, 64) / 1 | H2 de sección |
| `text-display-sm` | clamp(24, 3vw, 40) / 1.05 | H3 destacado, cifras |
| `text-title` | 20 / 1.25 · DM Sans 600 | Título de tarjeta |
| `text-body-lg` · `text-body` · `text-body-sm` | 18 / 16 / 14 | Lead, cuerpo, secundario |
| `text-label` | 12 mono, 0.14em, mayúsculas | Etiquetas de datos (BPM, fechas, eyebrows) |
| `text-label-sm` | 11 mono, 0.12em, mayúsculas | **Solo badges** (mínimo permitido) |
| `text-accent` | hereda tamaño · Instrument Serif itálica | Eyebrows editoriales, citas, `<em>` en titulares, kickers |

`text-display-*` fija tamaño, interlínea, caja alta, tracking −0.01em y el ancho de Archivo (`wdth` 100 en < md, 125 desde md). **La familia y el peso van aparte**: `Heading` añade `font-display font-extrabold`; para cifras usa `font-mono text-display-sm`; para serif, `text-accent text-display-sm`. Fuentes: `font-display` (Archivo), `font-accent` (Instrument Serif), `font-body` (DM Sans), `font-mono` (Syne Mono). Tracking permitido: `tracking-display`, `tracking-label`, `tracking-wordmark` (0.08em, solo el logotipo).

### Espaciado, contenedores, radios, sombras, z

- Secciones: `py-section` (clamp 64→144). Bloques dentro de sección: 32/48/64 (`gap-8/12/16`).
- Contenedores: `container-page` (1280 + padding 16/24/32), `container-prose` (68ch), `container-wide` (1440, solo bandas a sangre con `container-page` dentro). **No usar otros `max-w-*` en layout.**
- Radios: `rounded-sm` 4 (datos), `rounded` 8 (controles), `rounded-lg` 16 (tarjetas), `rounded-full` (círculos, pills). `rounded-md`/`rounded-xl` siguen compilando (= 8/16) solo por compatibilidad.
- Sombras: `shadow-card` (tarjetas), `shadow-fire` (solo CTA primario / elemento activo), `shadow-pop` (popovers).
- Z: `z-nav` 50 · `z-player` 90 · `z-overlay` 100 · `z-modal` 110 · `z-toast` 120.
- Movimiento: `duration-150` hover, `duration-200` estado, 600–800 entradas (`hero-enter`, `Reveal`). `ease-out`/`ease-in-out` del sistema. Nunca `scale` en el contenedor: usa `hover-zoom` (escala la `img` 1.04), `link-sweep` (subrayado barrido), `withArrow` (flecha +4 px).

### Imagen

- `media-duotone` (+ `is-reveal` para que el hover devuelva el color; funciona también dentro de un `.group`), `media-veil` (velo cálido para texto encima), `grain` (ruido al 25 %). El contenedor debe estar posicionado (`relative`/`absolute`); `MediaFrame` ya lo hace.
- Sin imagen: `PlaceholderCover` (gradiente de marca + inicial en Archivo).

## 2. Átomos (`components/ui/*`)

### Button

Variantes `primary | secondary | outline | ghost | link | whatsapp | danger` (alias: `default` = primary, `destructive` = danger). Tamaños `sm` 36 · `md` 44 · `lg` 52 · `xl` 60 (solo CTA hero) · `icon` 44 (alias `default` = md). `pill`, `withArrow`, `loading` (spinner + `aria-busy` + disabled), `asChild`.

```tsx
<Button size="lg" withArrow>Agenda tu sesión</Button>
<Button asChild variant="outline" pill><Link href="/beats">Ver beats</Link></Button>
<Button variant="whatsapp"><WhatsAppIcon className="h-4 w-4" />WhatsApp</Button>
<Button loading>Enviando</Button>
```

### IconButton

Solo icono (Lucide 20 px, stroke 1.75), `aria-label` obligatorio. Variantes como Button (sin link), tamaños `sm` 36 · `md` 44 · `lg` 52, redondo por defecto (`pill={false}` para cuadrado).

```tsx
<IconButton aria-label="Compartir" variant="outline"><Share2 /></IconButton>
```

### Badge

`tone` neutral | fire | sea | gold | success | warning | danger × `variant` solid | soft | outline × `size` sm (11 px) | md (12 px). Mono, mayúsculas, radio 4. Reemplaza todos los `<span class="rounded-full … text-[10px]">`.

```tsx
<Badge tone="fire">Trap</Badge>
<Badge tone="gold" variant="solid">-14 %</Badge>
<Badge size="md" icon={<Music2 />}>140 BPM</Badge>
```

### Chip

Filtro seleccionable de 44 px (pill). Con `href` es enlace (`aria-current="page"` si `selected`); sin `href`, botón (`aria-pressed`). `count` añade contador mono.

```tsx
<Chip href="/beats?genero=trap" selected count={12}>Trap</Chip>
<Chip onClick={() => setMood("")} selected={!mood}>Cualquier mood</Chip>
```

### Eyebrow · Heading · Text · Kicker · Divider

```tsx
<Eyebrow>Quiénes somos</Eyebrow>                 {/* línea + mono fire */}
<Eyebrow tone="serif">Notas al margen</Eyebrow>   {/* Instrument Serif itálica */}
<Heading as="h2" size="display-md" accent="Caribe">Lo que suena desde el Caribe</Heading>
<Heading as="h3" size="title">Montes de María Riddim</Heading>
<Text size="body-lg" tone="2" prose>Lead de sección…</Text>
<Kicker>01</Kicker>                                {/* decorativo, aria-hidden */}
<Divider variant="fire" />
```

`Heading`: `as` h1–h4/p, `size` display-xl…sm | title, `tone` 1 | 2 | fire, `accent="palabra"` envuelve la primera coincidencia en `<em>` serif itálica (o escribe `<em>` a mano). `Text`: `size` body-lg | body | body-sm | label | label-sm, `tone` 1 | 2 | 3 | fire, `as`, `prose`.

### Price · Avatar · Icon · Kbd · VisuallyHidden

```tsx
<Price amount={180000} prefix="desde" note="IVA incl." />         {/* md */}
<Price amount={250000} size="lg" tone="fire" compareAt={290000} />
<Avatar name="Jeivy Lazy" src={url} size={56} />                   {/* 32/40/56/80, square */}
<Icon icon={Music2} size={20} />                                    {/* 16/20/24, stroke 1.75 */}
```

### Formulario

`Input`, `Textarea`, `Select*`, `Checkbox`, `RadioGroup`/`RadioGroupItem`, `Switch`, `Label` (`required`), `FieldHint`, `FieldError` (`role="alert"` + icono), `Tooltip*`, `Skeleton` (`shape` text | media | circle). Fondo ink-3, línea 1, 44 px, anillo fire al foco; `aria-invalid` pinta danger. Usa `FormField` (molécula) para cablear ids y `aria-describedby`.

```tsx
<FormField id="email" label="Email" required error={errors.email?.message}>
  <Input type="email" {...register("email")} />
</FormField>
<FormField id="consent" label="Autorizo el tratamiento de mis datos" inline><Checkbox /></FormField>
```

## 3. Moléculas (`components/ds/*`)

### SectionHeader (sustituye a `SectionTitle`)

```tsx
<SectionHeader
  kicker="03" eyebrow="Producciones" title="Lo que suena desde el Caribe" accent="Caribe" id="feat-title"
  lead="Producciones destacadas del sello."
  action={<Button asChild variant="outline" withArrow><Link href="/productions">Ver todas</Link></Button>}
/>
```

Props: `kicker`, `eyebrow`, `eyebrowTone`, `title`, `accent`, `id`, `as` (h1–h3), `size`, `lead`, `action` (derecha en md+, debajo en móvil), `align` left | center.

### MediaFrame

Base de toda imagen. `aspect` 1/1 | 4/5 | 16/9 | 3/4 | auto · `treatment` duotone | veil | none · `hoverReveal` · `zoom` · `badges` / `badgesEnd` (esquinas) · `overlay` (abajo, sobre velo) · `center` (PlayButton) · `fallbackSeed` (PlaceholderCover) · `rounded` · `priority`/`sizes`.

```tsx
<MediaFrame src={cover} alt={title} aspect="4/5" badges={<Badge tone="fire">Nuevo</Badge>}
  center={<PlayButton size={56} variant="glass" title={title} />} />
```

### MediaCard

MediaFrame + título + meta + acción. `layout` vertical (defecto) | horizontal | overlay. Con `href` el título es el enlace y cubre la tarjeta; `action` queda por encima.

```tsx
<MediaCard src={p.coverUrl} alt={p.title} aspect="4/5" title={p.name} href={`/tienda/${p.slug}`}
  meta={<Badge tone="gold" variant="solid">-14 %</Badge>} action={<Price amount={p.price} size="sm" />} />
<MediaCard layout="overlay" aspect="16/9" src={…} alt={…} title={…} meta={<Badge>2026</Badge>} description="Jeivy Lazy" />
```

### ListRow

Fila con media 56–64, título, meta, datos mono a la derecha y acción. `href`, `muted` (vendido), `highlighted`, `active`, `as` li | div | article.

```tsx
<ListRow as="li" media={<PlayButton size={40} title={b.title} state={playing ? "playing" : "idle"} onClick={…} />}
  title={b.title} meta={<><Badge tone="fire">{b.genre}</Badge><span>{b.mood}</span></>}
  data={`${b.bpm} BPM`} action={<Button size="sm">Licencia</Button>} muted={b.status === "SOLD"} />
```

### StatItem · FeatureRow

```tsx
<StatItem value={50} suffix="+" label="Producciones" />            {/* cifra fire + label mono + línea */}
<FeatureRow index={1} title="Elige tu beat" description="Escucha el preview." href="/beats" />
<FeatureRow icon={Mic} title="Grabación vocal" aside={<Price amount={80000} size="sm" prefix="desde" />} />
```

`FeatureRow`: `index` (número serif) o `icon`, `title`, `description`, `href`, `aside`, `withArrow`, `size` title | display-sm, `selected`.

### FilterBar · FilterGroup

```tsx
<FilterBar sticky end={<ViewToggle />}>
  <FilterGroup label="Género" showLabel>
    {genres.map((g) => <li key={g.value}><Chip href={hrefFor(g.value)} selected={g.value === active} count={g.count}>{g.label}</Chip></li>)}
  </FilterGroup>
</FilterBar>
```

Scroll horizontal con desvanecidos en móvil, wrap en escritorio. `sticky` usa `--nav-h` (la publica la Navbar). `FilterChips` (shared) sigue funcionando y ya usa `Chip` + `FilterGroup`.

### Pagination · EmptyState · PlayButton · SmartLinkButton

```tsx
<Pagination page={page} pageCount={12} hrefTemplate="/beats?page={page}" />   {/* o onChange */}
<EmptyState icon={Inbox} title="Aún no hay beats" description="…" action={<Button variant="whatsapp">Pedir</Button>} />
<PlayButton size={56} state="playing" progress={42} title="Caribe Trap 01" onClick={toggle} />  {/* 40/56/72; variant glass sobre fotos */}
<SmartLinkButton platform="spotify" href={url} />   {/* spotify | apple | youtube | deezer | amazon | tidal | soundcloud | other */}
```

### Admin

```tsx
<AdminKpi label="Mensajes nuevos" value={18} delta={12} icon={Mail} />
<AdminToolbar search={<Input placeholder="Buscar…" />} filters={<Chip selected>Todos</Chip>} summary="24 resultados" action={<Button size="sm">Nuevo</Button>} />
<AdminTable>
  <AdminTableHead><AdminTableRow><AdminTableHeader>Título</AdminTableHeader><AdminTableHeader align="right">BPM</AdminTableHeader></AdminTableRow></AdminTableHead>
  <AdminTableBody><AdminTableRow><AdminTableCell>…</AdminTableCell><AdminTableCell mono align="right">140</AdminTableCell><AdminTableActions><IconButton aria-label="Editar" size="sm"><Pencil /></IconButton></AdminTableActions></AdminTableRow></AdminTableBody>
</AdminTable>
```

Toast: `LazyToaster` (sonner) existente.

## 4. Organismos (`components/ds/*`, `components/shared/*`)

### HeroCinematic (home)

```tsx
<HeroCinematic title={hero.title} eyebrow={hero.eyebrow} tagline={hero.tagline}
  imageUrl={resolveMediaUrl(hero.heroImageUrl)} imageAlt="Sesión de estudio"
  primary={{ href: hero.primaryHref, label: hero.primaryCta }} secondary={{ href: hero.secondaryHref, label: hero.secondaryCta }}
  latest={latest} />   {/* HeroLatest: title, artistName, slug, upcoming, coverUrl? — tarjeta «Lo último» con data-testid="hero-latest" */}
```

Foto a sangre con duotono + grano, H1 display-xl que se sale un 3 % en lg, tagline serif, 2 CTAs (xl), tarjeta «Lo último» que solapa el borde inferior en escritorio y va bajo los CTAs en móvil. `aria-label` por defecto "Presentación".

### HeroPage (resto; `PageHero` es su wrapper)

```tsx
<HeroPage eyebrow="Beats" title="Beats con sabor a Caribe" accent="Caribe" description={lead}
  aside={<><StatItem value={avail} label="Disponibles" /><Price amount={80000} prefix="desde" /></>} />
```

`titleId` por defecto `page-hero-title`. `backgroundImageUrl` → `media-veil`.

### EditorialSplit · BentoGrid · EditorialList · CtaBand

```tsx
<EditorialSplit quote="Memoria costeña en formato global." image={{ src, alt }} caption="Montes de María · 2026">
  <SectionHeader … /><Text size="body-lg">…</Text>
</EditorialSplit>                                       {/* 7/5, imagen 4/5 que sobresale 48 px; reverse, overflow */}

<BentoGrid>{items.map((p) => <MediaCard key={p.id} layout="overlay" … />)}</BentoGrid>   {/* 8/4 · 4/4/4 · 6/6 */}

<EditorialList items={[{ id: "trap", index: 1, title: "Trap", description: "…", imageUrl, size: "display-sm", aside: <Badge tone="fire">Raíz</Badge> }]} />

<CtaBand id="contact-title" title="¿Tienes un proyecto?" accent="proyecto" lead="…"
  actions={<><Button asChild variant="secondary" size="lg"><Link href="/contacto">Escríbenos</Link></Button><Button variant="whatsapp" size="lg">WhatsApp</Button></>}
  aside={<IconButton aria-label="YouTube" variant="outline"><Youtube /></IconButton>} />   {/* tone fire | ink */}
```

### Navbar · Footer · PlayerBar

Ya restilados in place (wordmark Archivo 900 wdth 125 `tracking-wordmark`, subrayado barrido, CTA pill, panel móvil con enlaces display-md; footer con wordmark gigante recortado y datos legales en mono; barra de beats con `PlayButton` 40 con anillo de progreso). La Navbar publica `--nav-h` (72/56) para los elementos `sticky`.

## 5. Wrappers de compatibilidad (fase A)

`SectionTitle` → `SectionHeader`; `PageHero` → `HeroPage`; `FilterChips` → `FilterGroup` + `Chip`; `GenreTag` → `Badge` outline con el color del género; `PlaceholderCover` → gradiente de marca + inicial en Archivo. Las vistas nuevas usan los componentes nuevos directamente; los wrappers se borran cuando no queden usos.

## 6. Clases prohibidas en código nuevo

- Tamaños arbitrarios o fuera de la escala: `text-[10px]`, `text-[11px]`, `text-[1.05rem]`, `text-xs`, `text-[clamp(…)]`, `text-5xl`… → usa `text-display-*`, `text-title`, `text-body*`, `text-label*`.
- `tracking-[…]`, `tracking-wider`, `tracking-widest`, `tracking-wide` → solo `tracking-display`, `tracking-label`, `tracking-wordmark` (los utilitarios `text-label*` ya llevan el suyo).
- `max-w-*` en layout (`max-w-7xl`, `max-w-3xl`, `max-w-2xl`, `max-w-prose`…) → `container-page`, `container-prose`, `container-wide`. (`max-w-*` sigue valiendo dentro de un componente para limitar un párrafo o una tarjeta concreta: p. ej. `max-w-sm` en un formulario.)
- `rounded-md`, `rounded-xl`, radios de 2/6/12 px → `rounded-sm` / `rounded` / `rounded-lg` / `rounded-full`.
- Colores y fondos antiguos: `bg-background*`, `text-primary`, `text-[var(--text-secondary)]`, `border-white/10`, `bg-[#080808]`, hex sueltos → tokens `ink/fire/sea/gold/text/line`.
- `font-display` suelto para titulares → `Heading`. `.eyebrow` / `.display-title` (compat) → `Eyebrow` / `Heading`.
- Emojis como iconos, `framer-motion` en público, `scale` en el contenedor al hover, fotos "crudas" a página completa (siempre `MediaFrame` con `duotone`/`veil`).

## 7. Decisiones documentadas (desvíos del contrato)

- **Ancho de Archivo en móvil**: el contrato pide `wdth` 125 siempre. Medido con la fuente cargada, "PRODUCCIONES" a 44 px ocupa 373 px con `wdth` 100 y 464 px con 125, y el contenido a 390 px mide 358 px. Por eso `--display-stretch` es 100 % en < md y 125 % desde md, y `text-display-lg` arranca en 40 px (no 44). En escritorio todo va a 125 %.
- **Texto de botón**: 14/16 px (escala) en vez de 15/16; 15 px no existe en la tabla tipográfica.
- **PlayButton en la barra**: 40 px (la escala es 40/56/72; el contrato dice "44").
- **`text-display-*` sin familia ni peso**: los utilitarios de `@layer utilities` se emiten después de los de Tailwind, así que si fijaran `font-family`/`font-weight` pisarían `font-mono`/`text-accent`. `Heading` añade `font-display font-extrabold`.
- **Tokens en hexadecimal en Tailwind**: Tailwind no puede aplicar opacidad a un `var()` y descarta la clase en silencio (`bg-primary/15` nunca llegó a existir en producción).
- **`rounded-md`/`rounded-xl`** siguen compilando (8/16 px) para no romper decenas de usos; están prohibidos en código nuevo.
