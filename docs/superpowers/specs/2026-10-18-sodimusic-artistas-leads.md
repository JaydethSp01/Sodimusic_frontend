# Sodimusic · Artistas, "Lo último" unificado, merch y leads — contrato

Fecha: 2026-10-18. Pedido del dueño: (1) "Últimas producciones" y "Lo último del sello" son redundantes y la última producción real (VICHE, en el canal de EL PADY) no sale en la primera; (2) cada artista debe tener su página con links (Spotify, Instagram…), bio breve y sus temas; (3) en la home el merch muestra 1 producto habiendo 3; (4) la home debe atraer leads. Todo parametrizable desde el admin.

## 1. Backend

### 1.1 Modelo `Artist` (Prisma + migración idempotente + `ensureShopSchema`)

```prisma
model Artist {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  /// Productor principal | Artista | Crew | Aliado
  role          String   @default("Artista")
  shortBio      String?  /// 1–2 frases (tarjetas)
  bio           String?  /// párrafos separados por \n\n
  photoUrl      String?
  coverUrl      String?
  city          String?
  genres        String[] @default([])
  spotifyUrl    String?
  instagramUrl  String?
  youtubeUrl    String?
  tiktokUrl     String?
  facebookUrl   String?
  appleUrl      String?
  /// Para listar sus videos: UC… (opcional)
  youtubeChannelId String?
  /// Alias para asociar producciones/releases por nombre (p. ej. ["J Col", "J Col El Crazy"])
  aliases       String[] @default([])
  featured      Boolean  @default(false)
  /// ACTIVE | HIDDEN
  status        String   @default("ACTIVE")
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([status, featured, sortOrder])
}
```

Siembra única (flag `AppMeta.artistsSeededAt`) desde el SiteConfig publicado: `artists.producerName/Genres/Bio/ImageUrl` → `role: "Productor principal"`, `featured: true`, `sortOrder 0`; cada `artists.members[]` → `role: member.role ?? "Crew"`, `genres` = split de `member.genre` por "·", `shortBio: member.bio`, links de `instagramUrl/youtubeUrl/spotifyUrl/tiktokUrl`. Slug = slugify(name). Si ya existe un slug, no se duplica.

### 1.2 API

Público (`PUBLIC_CACHE_CONTROL`):
- `GET /api/artists?featured=1&role=` → `{ items: Artist[] }` (solo ACTIVE, orden `featured desc, sortOrder, name`).
- `GET /api/artists/:slug` → `{ artist, productions: Production[], releases: Release[], posts: SocialPost[] }`. Asociación por nombre: `productions` donde `artistName` contiene (insensible a mayúsculas) el `name` o cualquiera de `aliases`; `releases` igual sobre `artistName`; `posts` VISIBLES cuyo `author` o `title` contenga el nombre/alias o cuyo `sourceId` sea una fuente `YOUTUBE_CHANNEL` con `externalId = youtubeChannelId`. Máx. 24 cada uno, orden por fecha desc. 404 si no existe o HIDDEN.

Admin: `GET /api/admin/artists?q&status`, `POST /api/admin/artists`, `PATCH /api/admin/artists/:id`, `DELETE /api/admin/artists/:id`, `POST /api/admin/artists/reorder {ids}`. Validación zod en `src/schemas/artist.ts` (urls opcionales válidas, slug kebab único, name 2–80). `GET /api/admin/dashboard/stats` añade `artistsActive`.

### 1.3 SiteConfig (backend `site-config.ts` + `site-config-defaults.ts`, espejo exacto del frontend)

Nueva sección `home.latest`, `home.lead`, `home.testimonials` y `home.merch` (ver §3). El schema acepta las claves nuevas como opcionales (los configs ya publicados no las traen) y las defaults las rellenan.

## 2. Frontend · artistas

- `types/models.ts`: `Artist` (campos de 1.1 en camelCase, fechas ISO) y `ArtistDetail = { artist; productions; releases; posts }`.
- `features/artists/{api.ts,hrefs.ts}`; `publicTags.artists` → `/api/artists` (revalidate 60).
- `/artists` (reescribir `app/(public)/artists/page.tsx`): productor principal (el `featured` con `role` "Productor principal" o el primero) en `EditorialSplit` enlazando a su página; crew/artistas en grilla de `MediaCard` 3/4 overlay (foto o `PlaceholderCover`), cada tarjeta enlaza a `/artists/[slug]`; `HomeChannelsSection` debajo como hoy. Textos de cabecera siguen viniendo de `site.artists.pageHeroTitle/Description`, `crewSectionTitle/Description`.
- `/artists/[slug]` (nuevo): `generateMetadata` (title "{name} · Sodimusic", description = shortBio, og:image = photoUrl); hero con foto 3/4 duotono a la izquierda y a la derecha eyebrow (role · city), `Heading display-lg` con el nombre, géneros como `Badge`, botones de plataformas con `SmartLinkButton` (Spotify, Apple, YouTube, Instagram, TikTok, Facebook: solo los que existan), CTA "Agendar sesión" (`site.nav.ctaHref`). Secciones (cada una oculta si no hay datos): "Bio" (`container-prose`), "Temas" = producciones en `BentoGrid`/`MediaCard` reutilizando `ProductionCard`, "Lanzamientos" (`MediaCard` 1/1 + smart links), "Videos" = posts en `ListRow`/`MediaCard` con el diálogo de YouTube existente, y si hay `spotifyUrl` de artista (`open.spotify.com/artist/<id>`) un embed `https://open.spotify.com/embed/artist/<id>?utm_source=generator&theme=0` cargado de forma perezosa (botón "Escuchar en Spotify" que monta el iframe; `title` accesible). JSON-LD `MusicGroup`/`Person` con `sameAs`.
- Admin `/admin/dashboard/artistas` + `features/admin/components/admin-artists-manager.tsx` + `app/actions/admin-artists-actions.ts` (patrón de canales: `AdminToolbar`, `AdminTable` con foto/nombre/rol/estado/orden, subir/bajar, Editar/Borrar, diálogo con `AdminField` para todos los campos incl. subida de foto con `ImageUploadField`, aliases y géneros como texto separado por comas), entrada "Artistas" en la nav (grupo Contenido) y en `admin-route-header.tsx`; `revalidateTag(publicTags.artists)` + `revalidatePath("/artists")`.
- `app/sitemap.ts` añade `/artists/[slug]` de los ACTIVE. Footer "Explorar" ya enlaza a /artists.
- e2e: `e2e/public/artists.spec.ts` (lista con enlaces a detalle; detalle con H1, links externos `rel=noopener`, secciones presentes según datos) y `e2e/admin/artistas.spec.ts` (CRUD por UI, no destructivo sobre artistas sembrados: crea uno "E2E Artista-…" y lo borra al final).

## 3. Frontend · home (parametrizable)

Nuevos campos en `SiteContent.home` (frontend `types/site-content.ts` + `lib/site-defaults.ts`; el backend los espeja):

```ts
latest: {
  eyebrow: string;            // "Lo último"
  title: string;              // "Lo <em>último</em> del sello" → usar `accent` = "último"
  subtitle: string;
  /** "feed" = novedades automáticas (YouTube/Facebook) · "productions" = producciones destacadas · "both" = destacada del feed + producciones */
  source: "feed" | "productions" | "both";
  limit: number;              // 5
  ctaLabel: string;           // "Ver todas las producciones"
  ctaHref: string;            // "/productions"
  secondaryCtaLabel: string;  // "Ver novedades"
  secondaryCtaHref: string;   // "/novedades"
};
merch: { title: string; subtitle: string; ctaLabel: string; limit: number /* 4 */; onlyFeatured: boolean /* false */ };
lead: {
  enabled: boolean;           // true
  eyebrow: string;            // "Cotiza en 1 minuto"
  title: string;              // "¿Grabamos tu próximo <em>tema</em>?"
  subtitle: string;
  bullets: string[];          // 3 beneficios: "Respuesta en menos de 24 h", "Anticipo del 30 % y el resto al entregar", "Estudio en María La Baja y Medellín"
  ctaLabel: string;           // "Quiero una cotización"
  whatsappLabel: string;      // "Hablar por WhatsApp"
  successMessage: string;
};
testimonials: { title: string; items: Array<{ quote: string; author: string; role?: string; avatarUrl?: string }> }; // vacío por defecto → sección oculta
```

Defaults en español; el editor del admin (`features/admin/site-config/*`) gana la tarjeta "Inicio · Lo último / Merch / Leads / Testimonios" con `AdminField`.

Cambios en la home (`app/(public)/page.tsx` y `components/landing/*`):
1. **Una sola sección "Lo último"** sustituye a "Últimas producciones" + "Novedades". Con `source: "feed"` (default) usa el feed social (la destacada es el post más reciente → hoy VICHE) y las 4 siguientes en `ListRow`; con `"productions"` el bento de producciones destacadas; con `"both"` destacada del feed + 3 producciones en bento debajo. Dos CTAs (`ctaLabel`, `secondaryCtaLabel`).
2. **Merch**: pedir `limit` productos: destacados primero y rellenar con los más recientes (si `onlyFeatured` es false). Grilla 2/4 con `MediaCard` 4/5 y `QuickAddButton` existente; si hay ≥ 4, botón "Ver tienda".
3. **Leads** (`components/landing/home-lead-section.tsx`, client para el formulario): sección a dos columnas (ink-1 con línea fire): izquierda título/bullets (`FeatureRow` o lista con `Check`), derecha formulario corto: nombre, WhatsApp (tel), servicio (`Chip` radio con los `site.booking.services[].title`), mensaje opcional (1 línea), `ConsentCheckbox`; envía a la server action `app/actions/contact-actions.ts` existente con `subject: "COTIZACION"` y el texto compuesto ("Servicio: … / WhatsApp: … / …"). Éxito: `successMessage` + botón WhatsApp con mensaje prellenado (`lib/whatsapp-order.ts` o util nueva). Errores con `FieldError`. Respeta el rate limit (429 → mensaje).
4. **Barra CTA fija en móvil** (`components/landing/mobile-cta-bar.tsx`, client): aparece al pasar el hero (IntersectionObserver), `fixed bottom` sobre `--player-bar-h`, con "Agendar" (primary) y WhatsApp (icon); se oculta si el reproductor está abierto o en `/booking`. Solo < lg.
5. **Testimonios**: si `items.length > 0`, carrusel sencillo con scroll-snap (sin JS) de citas en serif itálica; oculto si vacío.
6. El hero mantiene la tarjeta "Lo último"; en `HeroCinematic` la tarjeta debe usar el **mismo origen** que la sección (si `source` incluye feed, el post más reciente; si no, el release más reciente como hoy).

Dashboard admin: `AdminKpi` "Leads (cotizaciones)" = mensajes con subject "COTIZACION" (stats backend: `leadsNew` = ContactMessage NEW con subject COTIZACION). Mensajes: el filtro de estado existente sirve; añadir badge "Cotización" en la fila cuando subject = COTIZACION.

## 4. Reglas

Mismo sistema de diseño (`docs/design-system.md`), móvil primero, aria/testids de los e2e existentes conservados, nada de framer en público, textos desde el CMS. Backend: migraciones idempotentes, tests vitest para artistas (unit + integración temp-db) y stats. Frontend: tsc + eslint + specs propios + axe de las rutas tocadas.
