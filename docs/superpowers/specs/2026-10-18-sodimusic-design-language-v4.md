# Sodimusic Design Language v4 — "Caribe de noche, editorial"

Fecha: 2026-10-18. Alcance: todo el frontend público y el panel admin. Este documento es el contrato que siguen los agentes de diseño: tokens → átomos → moléculas → organismos → plantillas → vistas. Lo que no esté aquí se decide con el criterio de la sección 1.

## 0. Diagnóstico (por qué se ve "básica")

Medido en producción el 2026-10-18 (inventario de estilos computados a 1440 px, 11 rutas):

| Señal | Valor | Problema |
|---|---|---|
| Tamaños de fuente distintos | 22 (incluye 10, 11, 14.45, 15, 17 px) | No hay escala tipográfica; 167 nodos de texto a 10–11 px |
| Letter-spacings distintos | 23 | Cada componente inventa el suyo |
| Anchos máximos distintos | 12 (1280, 768, 672, 715, 780, 816…) | No hay sistema de contenedores |
| Fondos distintos | 24 | Capas y velos sin paleta |
| Radios | 9999 (260), 6 (147), 8 (68), 2, 4 | Mezcla pill + 6 + 8 sin regla |
| Composición | Todas las páginas = PageHero (eyebrow + título Bebas 96–150 px + párrafo) → grilla de tarjetas iguales → footer | Sin ritmo, sin jerarquía entre secciones, sin imagen fuera de las tarjetas, todo "en cajas" |
| Color | Naranja sobre negro en todas partes; dorado y verde/morado sueltos | Un solo acento repartido uniformemente = plano |
| Imagen | Portadas tal cual, sin tratamiento | Las fotos de stock mandan sobre la marca |

La home mide 9 516 px de alto con 11 secciones del mismo peso visual. Comparado con sellos y plataformas de referencia (OVO Sound, Top Dawg, Rimas, BeatStars, Splice): falta **composición editorial** (asimetría, solape, imagen a sangre, tipografía como imagen), **sistema** (escala, contenedores, densidad) y **tratamiento de imagen** (duotono, grano, recortes).

## 1. Dirección

**Concepto:** una revista de música nocturna del Caribe. Negro cálido como el escenario, naranja como la luz del pico, un acento frío de mar que aparece poco, tipografía grande y expandida como un cartel, acentos en itálica serif como las notas al margen. Las fotos se tratan (duotono/velo cálido) para que la marca mande sobre la foto.

**Principios (en orden):**
1. **Una idea por pantalla.** Cada sección tiene UN elemento dominante (titular, imagen o cifra). Nada de cuatro tarjetas con el mismo peso.
2. **Tipografía como imagen.** El display expandido ocupa espacio; se permite recorte, solape sobre fotos y salirse del contenedor en escritorio.
3. **Sistema antes que decoración.** Todo valor viene de un token. Un componente nuevo solo si ninguno existente sirve con una variante.
4. **Imagen tratada.** Toda foto pasa por `media-duotone` o `media-veil`. Nunca una foto "cruda" a página completa.
5. **Movimiento con intención.** Una entrada orquestada por página (stagger) + hovers que revelan (imagen, subrayado, flecha). Nada que mueva el layout. `prefers-reduced-motion` desactiva todo.
6. **Móvil es la vista principal.** Se diseña a 390 px primero; el escritorio añade asimetría, no contenido.
7. **Accesible por defecto:** contraste ≥ 4.5:1 en texto, ≥ 3:1 en UI, foco visible, 44 px táctiles, `aria` como hasta ahora (los e2e de axe son bloqueantes).

## 2. Tokens (app/globals.css + tailwind.config.ts)

Sustituyen a los actuales manteniendo los nombres que ya usan los componentes (`--background`, `--primary`, `--text-secondary`…) como alias, para no romper nada durante la migración.

### 2.1 Color

```css
:root {
  /* Tinta (fondos) — negro cálido */
  --ink-0: #050404;   /* fondo de página */
  --ink-1: #0b0a09;   /* secciones alternas */
  --ink-2: #131110;   /* tarjetas */
  --ink-3: #1b1816;   /* elevado: inputs, popovers */
  --ink-4: #262220;   /* hover de elevado */

  /* Acento principal — naranja pico */
  --fire-300: #ffb380;
  --fire-400: #ff8c33;
  --fire-500: #ff6b00;   /* = --primary */
  --fire-600: #d95a00;
  --fire-on: #120a04;    /* texto sobre fire */

  /* Acento frío — mar Caribe (uso ≤ 10 %: estados seleccionados, datos, enlaces secundarios) */
  --sea-400: #4fd1c5;
  --sea-500: #19b3a6;
  --sea-on: #04211e;

  /* Oro — destacado/premium (badges, estrellas, fijado) */
  --gold-400: #e6b83a;
  --gold-500: #d4a017;

  /* Texto */
  --text-1: #f3efe8;   /* 15.6:1 sobre ink-0 */
  --text-2: #bdb6ac;   /* 9.4:1 */
  --text-3: #8f8a82;   /* 5.6:1 — mínimo para texto; nunca < 12 px */

  /* Líneas y velos */
  --line-1: rgba(255, 255, 255, 0.07);
  --line-2: rgba(255, 255, 255, 0.14);
  --line-fire: rgba(255, 107, 0, 0.35);
  --veil-warm: linear-gradient(180deg, rgba(5,4,4,0.15) 0%, rgba(5,4,4,0.65) 60%, #050404 100%);
  --duotone-a: #2a1206;  /* sombras */
  --duotone-b: #ff6b00;  /* luces */

  /* Semánticos */
  --success: #3cc878; --warning: #e6b83a; --danger: #ff5a5a; --info: #4fd1c5; --whatsapp: #25d366;

  /* Alias de compatibilidad (no usar en código nuevo) */
  --background: var(--ink-0); --background-secondary: var(--ink-1); --background-card: var(--ink-2); --background-elevated: var(--ink-3);
  --primary: var(--fire-500); --primary-hover: var(--fire-400); --primary-foreground: var(--fire-on); --primary-muted: rgba(255,107,0,0.14);
  --gold: var(--gold-500); --gold-muted: rgba(212,160,23,0.15);
  --text-primary: var(--text-1); --text-secondary: var(--text-2); --text-muted: var(--text-3);
  --border: var(--line-1); --border-hover: var(--line-fire); --border-accent: rgba(255,107,0,0.18);
}
```

Tailwind: exponer `ink-{0..4}`, `fire-{300..600}`, `sea-{400,500}`, `gold-{400,500}`, `text-{1,2,3}` como colores, y mantener los existentes como alias. Regla: **el naranja es para acción y énfasis** (CTA, estado activo, subrayados, cifras clave). El mar solo para seleccionado/dato/enlace secundario. Oro solo para "destacado".

### 2.2 Tipografía

- **Display:** `Archivo` (variable, ejes `wght` 500–900 y `wdth` 100–125) vía `next/font/google` con `axes: ["wdth"]`. Se usa en **mayúsculas, wdth 125, wght 800**, tracking −0.01em. Sustituye a Bebas Neue en títulos. El logotipo "SODIMUSIC" de la barra pasa también a Archivo 900 wdth 125, tracking 0.08em.
- **Acento:** `Instrument Serif` (regular + italic). Solo en *itálica*: eyebrows editoriales, taglines, citas, números de sección grandes, la palabra clave dentro de un titular (`<em>`).
- **Cuerpo:** `DM Sans` (ya cargada) 400/500/600, con `opsz` si está disponible.
- **Mono:** `Syne Mono` (ya cargada) solo para **datos**: BPM, precios en chips, fechas, códigos, etiquetas de 11–12 px en mayúsculas con tracking 0.14em.

Escala (clase utilitaria → tamaño/line-height; móvil → escritorio con `clamp`):

| Token | Uso | Tamaño |
|---|---|---|
| `text-display-xl` | H1 de portada | clamp(56px, 11vw, 152px) / 0.92 |
| `text-display-lg` | H1 de página | clamp(44px, 7.5vw, 104px) / 0.95 |
| `text-display-md` | H2 de sección | clamp(32px, 4.5vw, 64px) / 1 |
| `text-display-sm` | H3 destacado, cifras | clamp(24px, 3vw, 40px) / 1.05 |
| `text-title` | título de tarjeta | 20px / 1.25, DM Sans 600 |
| `text-body-lg` | intro, lead | 18px / 1.6 |
| `text-body` | cuerpo | 16px / 1.6 |
| `text-body-sm` | secundario | 14px / 1.5 |
| `text-label` | etiquetas mono | 12px / 1.2, tracking 0.14em, uppercase |
| `text-label-sm` | solo badges | 11px / 1.2, tracking 0.12em, uppercase (mínimo permitido) |

Prohibido: 10 px, tamaños fuera de la tabla, `tracking-[…]` arbitrarios (solo `tracking-label`, `tracking-display`, `tracking-wordmark`).

### 2.3 Espaciado, contenedores, radios, sombras, movimiento

- Espaciado: escala de 4 px (Tailwind por defecto). Secciones: `py-section` = clamp(64px, 10vw, 144px). Separación entre bloques dentro de sección: 32/48/64.
- Contenedores: `container-page` = max-w 1280 px + `px-4 sm:px-6 lg:px-8`; `container-prose` = 68ch; `container-wide` = 1440 px solo para bandas a sangre con contenido interior en `container-page`. No se usan otros `max-w-*` en layout.
- Radios: `rounded-sm` 4 px (chips de datos), `rounded` 8 px (inputs, botones), `rounded-lg` 16 px (tarjetas), `rounded-full` solo círculos (avatares, iconos, pills de filtro). Nada de 2 px ni 6 px.
- Sombras: `shadow-card` = 0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 50px -30px rgba(0,0,0,0.8); `shadow-fire` = 0 12px 40px -12px rgba(255,107,0,0.45) (solo CTA primario y elemento activo); `shadow-pop` para popovers.
- Movimiento: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`, `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`; duraciones 150 (hover), 250 (estado), 600–800 (entradas). Entradas con `reveal`/`reveal-item` existentes. Hover: nunca `scale` en el contenedor; sí `scale(1.04)` de la imagen interior, barrido de subrayado, desplazamiento de flecha 4 px, cambio de color 150 ms.
- Z-index: `z-nav 50`, `z-player 90`, `z-overlay 100`, `z-modal 110`, `z-toast 120`.

### 2.4 Tratamiento de imagen (utilidades CSS)

- `.media-duotone`: contenedor relativo; la `img` lleva `filter: grayscale(1) contrast(1.05)`; un `::after` con `background: linear-gradient(var(--duotone-a), var(--duotone-b)); mix-blend-mode: screen; opacity: .55` y otro `::before` con `mix-blend-mode: multiply` del color de sombra. En hover (si el elemento es interactivo) la opacidad baja a 0 en 400 ms y la foto vuelve a color: el hover **revela**.
- `.media-veil`: velo `--veil-warm` para texto encima.
- `.grain`: ruido SVG (ya existe en `body::before`) aplicado también a heros a sangre con `opacity .25`.
- Portadas sin imagen: `PlaceholderCover` con gradiente de la marca + inicial en Archivo.

## 3. Átomos (`components/ui/*`, shadcn extendido)

| Átomo | Variantes / props | Notas |
|---|---|---|
| `Button` | `variant`: primary (fire, texto fire-on, `shadow-fire`), secondary (ink-3, línea), outline (línea-2, hover fire line), ghost, link, whatsapp (verde), danger; `size`: sm 36, md 44, lg 52, xl 60 (solo CTA hero), icon 44; `pill` boolean; `withArrow` (flecha que se desplaza 4 px en hover) | Texto 15/16 px DM Sans 600. `cursor-pointer`. Estado `loading` con spinner y `aria-busy`. |
| `IconButton` | mismo set, solo icono con `aria-label` obligatorio | Lucide 20 px, stroke 1.75 |
| `Badge` | `tone`: neutral, fire, sea, gold, success, warning, danger; `variant`: solid, soft, outline; `size`: sm (11 px), md (12 px) | Mono uppercase. Reemplaza todos los `<span class="rounded-full ... text-[10px]">` sueltos. |
| `Chip` | filtro seleccionable: `selected`, `count`, `asLink` | 44 px alto, pill, borde line-2, seleccionado = fondo fire-500/12 + borde fire + texto fire-300. Reemplaza `FilterChips` internamente. |
| `Eyebrow` | `tone`: fire (línea + mono) / serif (Instrument italic, sin línea) | Único componente para eyebrows. |
| `Heading` | `as` h1–h4, `size` display-xl…sm, `accent` (envuelve la palabra en `<em>` serif itálica) | Único componente para titulares. |
| `Text` | `size` body-lg/body/body-sm/label, `tone` 1/2/3 | |
| `Kicker` | número de sección grande en serif itálica (01, 02…) | Decorativo, `aria-hidden` |
| `Divider` | `variant`: line, fire (línea degradada), dots | |
| `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Label`, `FieldError`, `FieldHint` | fondo ink-3, borde line-1, foco anillo fire 2 px, 44 px | Estados error (danger) con icono. |
| `Avatar` | `size` 32/40/56/80, fallback inicial Archivo sobre gradiente | |
| `Skeleton` | `shape`: text, media (aspect), circle | |
| `Price` | `amount`, `prefix` ("desde"), `note` ("IVA incl."), `size` md/lg | Cifra en mono, prefijo/nota en label. Reemplaza todos los chips de precio. |
| `Kbd`, `Tooltip`, `VisuallyHidden` | | |
| `Icon` | wrapper Lucide con tamaños 16/20/24 y stroke 1.75 | Nunca emojis. |

## 4. Moléculas (`components/ds/*`)

| Molécula | Composición | Uso |
|---|---|---|
| `SectionHeader` | Kicker opcional + Eyebrow + Heading + Text lead + acción opcional a la derecha (escritorio) / debajo (móvil) | Sustituye `SectionTitle` en todas las secciones. |
| `MediaFrame` | contenedor con `aspect` (1/1, 4/5, 16/9, 3/4), tratamiento `duotone`/`veil`/`none`, `hoverReveal`, badges esquina, overlay inferior opcional | Base de toda imagen. |
| `MediaCard` | MediaFrame + título + meta (Badges/Text) + acción; `layout`: vertical / horizontal (móvil) / overlay (texto sobre la imagen) | Producciones, releases, novedades, canales, productos, beats en grilla. |
| `ListRow` | fila con media 56–64 px, título, meta, datos mono a la derecha, acción | Beats en escritorio, canales, admin. |
| `StatItem` | cifra display-sm (fire) + label mono + línea inferior | Reemplaza la caja de cifras. |
| `FeatureRow` | número serif + título + texto + icono, en lista con líneas | Servicios, géneros. |
| `FilterBar` | grupo de Chips con etiqueta, scroll horizontal en móvil con fades, sticky bajo la nav | Beats, tienda, producciones, novedades. |
| `Pagination` | prev/next + páginas, 44 px | |
| `EmptyState` | icono grande, Heading sm, Text, acción | |
| `FormField` | Label + control + hint/error | Todos los formularios. |
| `PlayButton` | 40/56/72 px, estados idle/playing/loading, anillo de progreso opcional | Beats, novedades. |
| `SmartLinkButton` | botón outline con icono de plataforma, colores de marca por `platform` | Releases. |
| `Toast` | sonner con estilos del sistema | Admin. |
| `AdminKpi` | cifra + delta + label; `AdminToolbar` (búsqueda + filtros + acción primaria, sticky); `AdminTable` (cabecera mono, filas 56 px, hover ink-3, acciones a la derecha) | Panel. |

## 5. Organismos (`components/{shared,landing,ds}/*`)

- `Navbar`: barra de 72 px (56 compacta) con el logotipo en Archivo; enlaces con subrayado barrido; CTA primary `pill`; carrito. En móvil, panel a pantalla completa con enlaces en display-md y pie con redes (ya existe; se restila).
- `HeroCinematic` (home): imagen a sangre con `media-duotone` + `grain`, H1 display-xl anclado abajo-izquierda saliéndose 2–4 % del contenedor en escritorio, tagline en serif itálica, 2 CTAs; a la derecha-abajo (escritorio) una **tarjeta "Lo último"** (portada 96 px, título, "Escuchar") que solapa el borde inferior del hero. En móvil la tarjeta va bajo los CTAs.
- `HeroPage` (resto): compacto (pt 96 / pb 48): eyebrow, H1 display-lg, lead, y un **slot derecho** para datos (contador, chips, acción). Sin imagen de fondo salvo que la página la tenga configurada; si la tiene, `media-veil`.
- `EditorialSplit`: dos columnas 7/5 con imagen `MediaFrame` 4/5 que sobresale verticalmente del bloque de texto; cita en serif.
- `BentoGrid`: grilla 12 col con celdas 8/4, 4/4/4, 6/6 para producciones destacadas y novedades.
- `EditorialList`: lista de `FeatureRow`/`ListRow` con líneas, hover que revela imagen flotante a la derecha (escritorio).
- `CtaBand`: banda a sangre con fondo fire degradado o ink-1 con línea fire; titular display-md + 2 acciones.
- `Footer`: 4 columnas (ya), con wordmark gigante display-xl recortado al 50 % en la parte superior como firma (decorativo, `aria-hidden`), datos legales en mono.
- `PlayerBar`: la actual, restilada con los tokens (ink-2 + línea, PlayButton 44, progreso fire).
- `Wizard` (booking): stepper vertical en escritorio a la izquierda (col 4) con resumen de la reserva (servicios, fecha, anticipo) y el paso activo a la derecha (col 8); en móvil, stepper horizontal compacto arriba y resumen colapsable abajo.
- `AdminShell`: sidebar 264 px con grupos (Contenido / Ventas / Comunidad / Sitio), cabecera de ruta con acciones, contenido en `container-page`.

## 6. Plantillas y vistas (blueprints)

Cada vista indica el **elemento dominante** y la composición. Todo lo que no se nombra usa los organismos anteriores.

### 6.1 Home `/`
1. `HeroCinematic` (dominante: wordmark + foto tratada + tarjeta "Lo último").
2. **Quiénes somos** como `EditorialSplit`: texto 7 col con cita serif itálica de 2 líneas en display-sm y párrafo; imagen 5 col 4/5 duotono que sobresale 48 px arriba y abajo. Las 4 cifras como `StatItem` en una fila con líneas (sin caja).
3. **Géneros** como `EditorialList`: 5 filas con número serif, nombre en display-md, descripción, y al hover (escritorio) una imagen flotante de 320×400 que sigue el cursor suavemente; en móvil solo filas. Un color por género solo en una **pastilla pequeña** (no en todo el título).
4. **Historia**: línea horizontal con los hitos en scroll horizontal (snap) en móvil y 4 columnas en escritorio; año en display-md fire, título, texto.
5. **Producciones destacadas** en `BentoGrid` (1 grande overlay + 2 medianas); acción "Ver todas" en la cabecera.
6. **Novedades**: cabecera + 1 destacada horizontal (imagen 16/9 + título display-sm) + 4 en `ListRow`; "Ver todas".
7. **Canales**: lista de `ListRow` con avatar, nombre, descripción y botón Suscribirse (rojo YouTube solo en el botón).
8. **Merch**: 3–4 `MediaCard` 4/5 con precio `Price`; fondo ink-1.
9. **Servicios**: `FeatureRow` ×6 en 2 columnas con número serif y flecha; hover revela línea fire.
10. **Contacto**: `CtaBand` fire degradado: "¿Tienes un proyecto?" display-md, botón ink + botón WhatsApp; redes como IconButtons.

### 6.2 Beats `/beats`
- `HeroPage` con slot: contador de disponibles + 4 `Badge` con licencias y "desde" precio.
- `FilterBar` sticky (géneros, mood, BPM, solo disponibles) + toggle **lista/grilla** (persistido en localStorage).
- **Lista** (escritorio por defecto): `ListRow` por beat: PlayButton 44 sobre portada 64, título + badges (género, mood), BPM mono, precio `Price`, botón "Licencia" primary sm, menú "Compartir". Vendidos: fila atenuada con badge. **Grilla**: `MediaCard` 1/1 overlay con PlayButton 56 centrado al hover y precio abajo.
- Bajo la lista: bloque **"Cómo funciona"** (3 `FeatureRow`: elige → paga el anticipo por WhatsApp → recibe archivos) y el `FaqSection` existente restilado.
- `PlayerBar` global.

### 6.3 Tienda `/tienda` y `/tienda/[slug]`
- `HeroPage` compacto con slot: "Envíos a toda Colombia · IVA incluido · Pedido por WhatsApp" como 3 `Badge` soft.
- `FilterBar` categorías. Grilla 2/3/4 columnas de `MediaCard` 4/5 con precio en display-sm mono abajo-izquierda sobre la imagen (overlay), badge "-14 %" gold, "Destacado" fire. Hover: la imagen se desplaza 4 % y aparece "Añadir" como botón flotante abajo (escritorio); en móvil el botón "Añadir" es visible siempre (44 px).
- Detalle: galería 1/1 a la izquierda (sticky), a la derecha: eyebrow categoría, H1 display-md, `Price` lg, selector de talla como Chips, cantidad, CTA primary xl "Añadir al carrito" + secondary "Pedir por WhatsApp", acordeón de envío/retracto/garantía (contenido legal existente).
- Cart drawer: restilado con `ListRow` y `Price`.

### 6.4 Releases `/releases`, Productions `/productions`, Artists `/artists`, Canales `/canales`, Novedades `/novedades`
- Releases: `FeaturedRelease` (ya) adaptado a `EditorialSplit` + grilla 1/1 con `SmartLinkButton` al hover (overlay) y countdown en mono.
- Productions: `HeroPage` + `FilterBar` sticky + **grilla editorial**: patrón repetido de 6 celdas (8/4, 4/4/4, 6/6) con `MediaCard` overlay (año y género como badges, título display-sm, artista mono). Botón play (YouTube) sobre la imagen.
- Artists: productor principal en `EditorialSplit` invertido (imagen 5 col izquierda 3/4 duotono con el nombre en display-lg solapando la imagen); crew en 3 `MediaCard` 3/4 overlay con nombre en display-sm; canales como en la home.
- Canales: búsqueda + `ListRow` con avatar 56, nombre, handle mono, categoría badge, Suscribirse (rojo) y Ver videos; destacados primero con fondo ink-2.
- Novedades: 1 destacada (`EditorialSplit` 16/9) + grilla 3 col de `MediaCard` 16/9 con badge de red; chips de red en `FilterBar`.

### 6.5 Contacto `/contacto` y Booking `/booking`
- Contacto: 2 columnas 7/5. Izquierda: formulario en `FormField` con el asunto como **Chips** (no select) y el consentimiento; derecha: bloque tipográfico "Hablemos" display-md con WhatsApp/correo como `ListRow` grandes, horario y dirección en mono, y el kit de prensa como tarjeta ink-2 con el logo.
- Booking: `Wizard` v5 (stepper + resumen). Servicios como `FeatureRow` seleccionables (icono Lucide, título, descripción, "desde" si hay precio). Calendario con los tokens. Paso final: resumen con anticipo y política en `Badge`/`Text`. Éxito: pantalla con número de reserva en display-lg y botón WhatsApp.

### 6.6 Legal `/legal/*`
Mantener estructura; aplicar tokens: títulos display-md, índice lateral sticky en escritorio (ya), `container-prose`, tablas con `AdminTable` ligero.

### 6.7 Admin `/admin/*`
`AdminShell` + `AdminKpi` en el resumen (4 cifras + 2 listas recientes), `AdminToolbar` sticky en cada módulo, `AdminTable` en vez de tablas sueltas, formularios con `FormField`, diálogos con los tokens. No se cambia lógica ni server actions: solo presentación y componentes.

## 7. Reglas de migración

- Fase A (fundación): tokens, fuentes, átomos, moléculas, organismos genéricos y `SectionHeader`; `SectionTitle`, `PageHero` y `FilterChips` pasan a ser *wrappers* de los nuevos para que las páginas no rompan antes de migrarse.
- Fase B (vistas): cada agente migra sus rutas a los organismos y blueprints; borra los estilos ad hoc (`text-[10px]`, `tracking-[…]`, `max-w-*` fuera del sistema, `rounded-md/6px`).
- Fase C (QA): `npx tsc`, `eslint`, build, e2e (chromium + mobile), baselines visuales nuevas, inventario de estilos (`scratchpad/style-inventory.mjs`) con objetivo: ≤ 10 tamaños de fuente, ≤ 6 letter-spacings, ≤ 3 anchos máximos, 0 textos a 10 px.
- Nada de `framer-motion` en público. Nada de emojis. Nada de `Buffer` en cliente. Los e2e existentes se actualizan cuando cambie la estructura, nunca se borran aserciones de accesibilidad.
