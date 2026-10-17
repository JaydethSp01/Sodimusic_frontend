# Sodimusic v3 — legal, diseño, escalabilidad y rendimiento (2026-10-17)

Origen: auditoría de diseño (benchmark), UX y legal del 2026-10-17. Pedido del dueño: "aplica todo, diseño mejor que el actual, pensado a futuro (p. ej. 100 canales), rendimiento".

Fuera de alcance en esta ronda (se dejan preparados, no se construyen): pasarela de pagos (Wompi/Mercado Pago) e inglés (i18n).

## Principios
- Todo lo que sea lista (canales, productos, producciones, beats, releases, mensajes, suscriptores) se pagina en servidor y se busca en servidor. Nada de `.map` sobre arrays del JSON de configuración para entidades que crecen.
- Imágenes: siempre `next/image` con `sizes` correctos y `quality` ≤ 75. Embeds de YouTube solo tras clic (facade) y con `youtube-nocookie.com`.
- Respuestas públicas del backend con `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`. El frontend usa `fetchPublic` con `revalidate` y tags; las acciones del admin llaman `revalidatePath`.
- Accesibilidad: contraste ≥ 4.5:1 en texto, targets ≥ 44 px, errores inline con `aria-invalid` + `aria-describedby`, `prefers-reduced-motion` respetado.
- Español colombiano, COP, "IVA incluido".

## 1. Modelo de datos (backend, Prisma)

Nuevos modelos:

```prisma
model YoutubeChannel {
  id               String   @id @default(cuid())
  name             String
  url              String
  channelId        String?            // UC…
  handle           String?            // @handle
  description      String?
  avatarUrl        String?
  featuredVideoUrl String?
  category         String   @default("Crew")   // Crew | Artista | Sello | Aliado…
  featured         Boolean  @default(false)
  status           String   @default("ACTIVE") // ACTIVE | HIDDEN
  sortOrder        Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  @@index([status, featured, sortOrder])
}

model BeatInterest {
  id               String   @id @default(cuid())
  beatId           String?
  beatTitle        String
  artistName       String
  email            String
  phone            String?
  instagram        String?
  message          String?
  exclusiveIntent  Boolean  @default(false)
  licenseType      String?            // MP3 | WAV | STEMS | EXCLUSIVE
  policyAcceptedAt DateTime
  policyVersion    String
  marketingOptIn   Boolean  @default(false)
  createdAt        DateTime @default(now())
  @@index([createdAt])
}

model ContactMessage {
  id               String   @id @default(cuid())
  subject          String             // PRENSA | DEMO | BOOKING_ARTISTA | COLABORACION | OTRO
  name             String
  email            String
  phone            String?
  message          String
  policyAcceptedAt DateTime
  policyVersion    String
  status           String   @default("NEW")  // NEW | READ | ARCHIVED
  createdAt        DateTime @default(now())
  @@index([status, createdAt])
}

model Subscriber {
  id               String    @id @default(cuid())
  email            String    @unique
  name             String?
  source           String    @default("footer")
  policyAcceptedAt DateTime
  policyVersion    String
  unsubscribedAt   DateTime?
  createdAt        DateTime  @default(now())
}
```

Cambios en modelos existentes:
- `BookingSession`: `policyAcceptedAt DateTime?`, `policyVersion String?`, `marketingOptIn Boolean @default(false)`, `isAdult Boolean?`.
- `Release`: `appleUrl String?`, `deezerUrl String?`, `amazonUrl String?`, `tidalUrl String?`, `soundcloudUrl String?`, `releaseDate DateTime?`.
- `Beat`: `priceMp3COP Int?`, `priceWavCOP Int?`, `priceStemsCOP Int?`, `priceExclusiveCOP Int?` (`priceCOP` sigue siendo "desde"). `audioUrl` es el preview.
- `SiteConfig` JSON: nueva sección `legal` y `contactPage` (ver §3). La sección `youtube.channels` del JSON queda obsoleta: se migra a `YoutubeChannel` en el seed/arranque (si la tabla está vacía y el JSON tiene canales, se insertan) y el JSON conserva solo textos de la sección.

Migración: una sola migración `2026101712xxxx_v3_legal_channels_crm`. `ensureShopSchema()` en `src/lib/ensure-schema.ts` debe cubrir también las tablas nuevas y columnas nuevas (idempotente) por si el build no corre migraciones.

## 2. API (backend Hono)

Públicas (todas con Cache-Control público salvo POST):
- `GET /api/channels?page=1&pageSize=24&q=&featured=1&category=` → `{ items: YoutubeChannel[], total, page, pageSize, categories: string[] }`. Solo `status=ACTIVE`. Orden: `featured desc, sortOrder asc, createdAt desc`. `pageSize` ≤ 48.
- `GET /api/channels/:id` → canal ACTIVE o 404.
- `POST /api/newsletter/subscribe` body `{ email, name?, source?, policyAccepted: true, policyVersion }` → 201 `{ ok: true }`; si ya existe reactiva (`unsubscribedAt=null`) y responde 200. 400 si `policyAccepted !== true`.
- `POST /api/newsletter/unsubscribe` body `{ email }` → 200.
- `POST /api/contact/messages` body `{ subject, name, email, phone?, message, policyAccepted: true, policyVersion }` → 201. Envía email al admin (Resend) si está configurado; no falla si no hay Resend.
- `POST /api/contact/beat-interest` (existente): ahora persiste `BeatInterest`; body añade `policyAccepted: true`, `policyVersion`, `marketingOptIn?`, `licenseType?`. 400 si no acepta.
- `POST /api/booking/sessions` (existente): body añade `policyAccepted: true`, `policyVersion`, `marketingOptIn?`, `isAdult: boolean`. 400 si `policyAccepted !== true`; si `isAdult === false` se acepta pero se guarda `isAdult=false` (el admin lo ve marcado y el front avisa que se requiere acudiente).
- `GET /api/beats` incluye los 4 precios por licencia. `GET /api/releases*` incluye los smart links y `releaseDate`.

Admin (`requireAdmin`):
- `GET/POST /api/admin/channels`, `PATCH/DELETE /api/admin/channels/:id`, `POST /api/admin/channels/reorder` body `{ ids: string[] }`. GET admite `page,pageSize,q,status`.
- `GET /api/admin/beat-interests?page&pageSize&q`, `GET /api/admin/messages?page&pageSize&status`, `PATCH /api/admin/messages/:id` `{ status }`, `GET /api/admin/subscribers?page&pageSize&q`, `GET /api/admin/subscribers/export` (CSV).
- Dashboard stats: añadir `channelsActive`, `messagesNew`, `subscribersActive`, `beatInterests30d`.
- `POST /api/admin/beats` y PATCH aceptan los 4 precios; releases aceptan los smart links y `releaseDate`.

Validación con zod en `src/schemas/{channel,newsletter,contact,beat-interest,booking}.ts`. Tests vitest unitarios de schemas + integración de channels/newsletter/contact.

## 3. SiteConfig: secciones nuevas (misma forma en backend `src/schemas/site-config.ts` + `src/lib/site-config-defaults.ts` y frontend `types/site-content.ts` + `lib/site-defaults.ts`)

```ts
legal: {
  businessName: string;        // "Sodimusic Company" (nombre comercial)
  legalName: string;           // razón social o nombre del comerciante; "" = pendiente
  nit: string;                 // "" = pendiente
  address: string; city: string; country: string; // país por defecto "Colombia"
  email: string;               // correo de PQR / datos personales
  phone: string;               // WhatsApp E.164 sin +
  hours: string;               // "Lun–Vie 9:00–18:00"
  ivaIncluded: boolean;        // true: mostrar "IVA incluido"
  ivaResponsible: boolean;     // true: muestra nota de factura electrónica
  depositPercent: number;      // anticipo estudio, 0–100
  cancellationHours: number;   // 24
  policyVersion: string;       // "2026-10-17"
  termsVersion: string;        // "2026-10-17"
  showNewsletter: boolean;
  newsletterTitle: string; newsletterSubtitle: string; newsletterCtaLabel: string;
  floatingWhatsapp: boolean;
};
contactPage: {   // OJO: `contact` ya existe (email, whatsapp); la nueva sección es `contactPage`
  pageTitle: string; pageDescription: string;
  subjects: { value: string; label: string }[]; // PRENSA, DEMO, BOOKING_ARTISTA, COLABORACION, OTRO
  pressTitle: string; pressBody: string;       // bloque EPK
  pressLogoUrl: string; pressPhotoUrls: string[]; pressKitUrl: string;
};
```

`youtube` conserva: `showOnHome, sectionEyebrow, sectionTitle, sectionSubtitle, subscribeLabel, homeLimit (number, 6), allChannelsLabel ("Ver todos los canales"), pageTitle, pageDescription`. Y `channels` sigue existiendo en el tipo solo para compatibilidad de datos viejos (se ignora en UI).

`booking.services[]` añade `priceFromCOP?: number` y `priceNote?: string` ("por hora", "por canción"). `artists.members[]` añade `spotifyUrl?`, `tiktokUrl?`, `role?`.

## 4. Frontend: rutas y componentes

Públicas nuevas:
- `/legal/privacidad`, `/legal/terminos-tienda`, `/legal/terminos-estudio`, `/legal/licencia-beats`, `/legal/aviso-legal`. Layout común `app/(public)/legal/layout.tsx` (índice lateral sticky en desktop, acordeón en móvil, "Última actualización"). Textos en `content/legal/*.tsx` como componentes que reciben `legal` del SiteConfig e interpolan razón social/NIT/dirección/correo. Si un dato está vacío se muestra "[pendiente de completar en el admin]" en amarillo solo cuando hay sesión admin, y se omite la línea para el público.
- `/canales` (todos los canales): búsqueda `q`, chips de categoría, paginación 24/página, tarjetas con avatar, nombre, descripción, botón "Ver videos" que abre el facade del playlist embed, "Suscribirse". `generateMetadata`.
- `/contacto`: formulario con asunto, nombre, email, teléfono, mensaje, checkbox de datos, bloque EPK (logo, fotos, kit PDF, bio corta). Reemplaza el bloque de contacto del home por un resumen + enlace.
- Lanzamiento `/releases/[slug]`: botonera de smart links (Spotify, Apple, YouTube, Deezer, Amazon, Tidal, SoundCloud) solo con los que existan; `releaseDate` y cuenta regresiva si es futuro.
- `/beats`: preview con player (waveform ligero con `wavesurfer.js` si hay `audioUrl`; si no, sin botón play), chip de licencia con "desde", modal "Elegir licencia" con tabla MP3/WAV/Stems/Exclusiva y sus precios; el formulario de interés envía `licenseType`.

Cambios transversales:
- Footer (`components/shared/footer.tsx`): bloque legal (razón social, NIT, dirección, correo PQR, "Quejas: SIC"), enlaces a las 5 páginas legales, formulario de newsletter (si `legal.showNewsletter`), icono real de Spotify.
- Consentimiento: `components/shared/consent-checkbox.tsx` reutilizable (texto "Autorizo a {businessName} el tratamiento de mis datos personales según la Política de privacidad", enlace, `required`, sin premarcar) + checkbox opcional de marketing. Usado en booking paso 5, "Me interesa" de beats, contacto y newsletter.
- Booking: errores inline por campo, campo "¿Eres mayor de 18 años?" (si no: aviso de autorización de acudiente, no bloquea), paso con tarifas "desde" y anticipo (`legal.depositPercent`), indicador de pasos en móvil "Paso X de 5 · Nombre" + barra.
- Tienda: "IVA incluido" junto a precios, "Antes $X" en precio tachado, nota de envío, texto bajo el CTA "Al enviar aceptas los Términos de la tienda", mensaje de WhatsApp con talla, cantidad, total, "IVA incluido", "Envío: por cotizar" y enlace a `/legal/terminos-tienda`.
- WhatsApp flotante (`components/shared/floating-whatsapp.tsx` montado en `global-ux.tsx`): mensaje según ruta (beats, tienda, booking, canal), oculto en `/admin`, no tapa el carrito ni los CTAs del booking en móvil (bottom offset), `aria-label`.
- Home: canales destacados (máx. `youtube.homeLimit`) + "Ver todos los canales (N)"; merch con grid `auto-fit` y mínimo visual; géneros 3 columnas en desktop; hero `min-h-[85svh]` contenido centrado; stats renderizan el valor final en SSR y animan solo si JS/IntersectionObserver; iconos Lucide para servicios (`lib/service-icons.ts` mapea `type` → icono); contadores y textos sin "→ →".
- Tokens (`app/globals.css`): `--text-muted` ≥ 4.5:1 sobre fondo (≈ #8f8a82), `--text-secondary` ≈ #b8b2a8, botón primario con texto `#120a04` sobre naranja o naranja `#e85d00` con blanco (verificar 4.5:1), `--whatsapp: #25D366`, paleta de géneros en `lib/genre-colors.ts`. Soporte `prefers-reduced-motion` en `HomeFadeSection` y `whileInView` con `amount: 0.1`.
- Tarjetas (beats, productos, producciones, canales): portada grande 4:5 o 1:1, overlay con play/precio, chips con jerarquía; mismo componente de chips de filtro `components/shared/filter-chips.tsx` en beats, producciones, tienda y canales.
- Imágenes: `quality={70}`, `sizes` por breakpoint, `placeholder="blur"` con `blurDataURL` genérico oscuro para covers remotas.

Admin nuevo:
- `/admin/dashboard/canales`: tabla con búsqueda, paginación, estado, destacado, orden (botones subir/bajar o drag), crear/editar en dialog (nombre, URL → autodetecta `channelId`/handle, descripción, avatar con `ImageUploadField`, video destacado, categoría, destacado, estado).
- `/admin/dashboard/mensajes` (contacto + intereses en beats, pestañas, marcar leído/archivado) y `/admin/dashboard/suscriptores` (lista, búsqueda, exportar CSV).
- Editor de sitio: card "Legal y cumplimiento" (todos los campos de `legal`), card "Contacto y prensa" (`contactPage`), card "Canales" se reduce a textos + enlace al gestor; precios "desde" en servicios; redes de crew.
- Beats manager: 4 precios por licencia + subir preview MP3. Releases manager: smart links + fecha.
- Dashboard: nuevas cifras y lista "Mensajes nuevos".

## 5. Rendimiento
- `fetchPublic`: `revalidate` 60 por defecto; 300 para site-config y canales; `tags` por recurso (`site-config`, `channels`, `beats`, `products`, `releases`, `productions`). Acciones del admin: `revalidateTag` + `revalidatePath`.
- Backend: `Cache-Control` en GET públicos; `select` explícito en listados (sin `data` de MediaAsset); índices en columnas de filtro/orden.
- Fuentes con `display: "swap"` y solo los pesos usados. `framer-motion` solo en componentes cliente que lo necesiten; secciones estáticas sin motion.
- Hero: `priority`, `quality={70}`, `sizes="100vw"`; resto `loading="lazy"`.
- Presupuesto: Lighthouse móvil ≥ 85 en rendimiento y ≥ 95 en accesibilidad para `/`, `/beats`, `/tienda`, `/canales`. Medir con `npx lighthouse` si está disponible o `npx unlighthouse-ci`; si no, reportar `next build` tamaños de First Load JS por ruta (objetivo < 180 kB).

## 6. Seed y datos
- Seed: canal Sodimusic a `YoutubeChannel` (featured), eliminar el release placeholder "Lo que viene (single)", defaults `legal` con `businessName: "Sodimusic Company"`, `legalName: ""`, `nit: ""`, `email: "Jeivymusicdinero@gmail.com"`, `phone: "573215368590"`, `depositPercent: 30`, `cancellationHours: 24`, `policyVersion: "2026-10-17"`.
- Producto "Gorra XMEN" renombrar en seed a "Gorra Sodimusic" (riesgo de marca). Los datos reales en producción se actualizan con un script idempotente `scripts/v3-data.ts` (no borra lo que el admin haya editado).

## 7. Verificación
- Backend: `npx vitest run` verde; `npx tsc --noEmit`.
- Frontend: `npx tsc --noEmit`, `npm run lint`, `NODE_OPTIONS=--dns-result-order=ipv4first npm run build`, e2e smoke incluye `/canales`, `/contacto`, `/legal/privacidad`.
- Capturas desktop/móvil de `/`, `/beats`, `/tienda`, `/tienda/[slug]`, `/booking`, `/canales`, `/legal/privacidad`, `/contacto` revisadas visualmente; verificar contraste con el script de la auditoría.
