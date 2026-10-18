# Sodimusic · Novedades (feed social) — contrato

Fecha: 2026-10-17. Objetivo: que el sitio muestre automáticamente "lo último" que publican las cuentas del sello y sus aliados (nuevos videos en YouTube, publicaciones de la página de Facebook) sin que nadie tenga que editar el CMS, y que el admin pueda añadir a mano un enlace cuando algo llegue por otro canal (por ejemplo, un lanzamiento que compartió una persona en su perfil).

## 0. Restricciones reales (verificadas 2026-10-17)

- Facebook devuelve **400/403 a cualquier lectura anónima** (www, m, mbasic, Graph API sin token, oEmbed sin token). El "scraping" no es viable ni permitido por los términos de Meta. La única vía es **Graph API con token de página** (`FACEBOOK_PAGE_TOKEN`) para páginas que administre el dueño (`sodimusic.oficial`). Los **perfiles personales** (p. ej. `guillermo.perezbanquez`) no exponen sus publicaciones a terceros por ninguna API: se cubren con la carga manual por URL o pidiendo a esa persona que comparta en la página.
- Los feeds RSS de YouTube (`/feeds/videos.xml?channel_id=`) responden **404** desde esta red. En cambio la página pública `https://www.youtube.com/channel/<UC…>/videos` sí responde (HTML con `ytInitialData` y `videoRenderer`), y `https://www.youtube.com/oembed?url=…` devuelve título/miniatura sin clave. La página `watch?v=` incluye `"publishDate":"YYYY-MM-DDTHH:mm:ss-07:00"` y `"channelId":"UC…"`.
- Con `YOUTUBE_API_KEY` (Data API v3, gratuita) se usan `playlistItems` (lista de subidas `UU` + id sin `UC`) y `search?q=Sodimusic&order=date` para **menciones** en canales ajenos (caso real: "VICHE El Pady X Sodimusic…" salió en el canal de EL PADY, `UC4aeSrfTsfYaX3CqRzTetnA`).
- Vercel Hobby: cron como máximo diario. La frescura real la da el **refresco perezoso** en el GET público (si la última sincronización tiene más de 30 min, se sincroniza con presupuesto de 6 s antes de responder).

## 1. Modelos (Prisma, backend)

```prisma
model SocialSource {
  id            String    @id @default(cuid())
  /// YOUTUBE_CHANNEL | FACEBOOK_PAGE | YOUTUBE_SEARCH
  kind          String
  label         String
  /// UC… | id o username de la página | texto de búsqueda
  externalId    String
  url           String?
  enabled       Boolean   @default(true)
  lastFetchedAt DateTime?
  lastError     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([kind, externalId])
}

model SocialPost {
  id          String   @id @default(cuid())
  sourceId    String?
  /// YOUTUBE_VIDEO | FACEBOOK_POST | LINK
  kind        String
  /// yt:<videoId> | fb:<postId> | link:<sha1(url)>
  externalId  String   @unique
  title       String
  text        String?
  url         String
  imageUrl    String?
  author      String?
  publishedAt DateTime
  /// VISIBLE | HIDDEN
  status      String   @default("VISIBLE")
  pinned      Boolean  @default(false)
  raw         Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status, pinned, publishedAt])
}
```

Migración idempotente (`CREATE TABLE IF NOT EXISTS`, índices `IF NOT EXISTS`) + mismas sentencias en `ensureShopSchema()` (patrón v3). Flag `AppMeta.socialSourcesSeededAt` para sembrar fuentes una vez: cada `YoutubeChannel` ACTIVE con `channelId` → `YOUTUBE_CHANNEL`; `FACEBOOK_PAGE` `sodimusic.oficial` (label "Facebook Sodimusic", url `https://www.facebook.com/sodimusic.oficial`); `YOUTUBE_SEARCH` `Sodimusic` (label "Menciones en YouTube"). `AppMeta.socialSyncAt` guarda la última sincronización (ISO).

## 2. API (backend)

Público (con `PUBLIC_CACHE_CONTROL`):

- `GET /api/social/feed?limit=12&kind=YOUTUBE_VIDEO|FACEBOOK_POST|LINK` → `{ items: SocialPost[], updatedAt: string | null }`. Orden: `pinned` desc, `publishedAt` desc. Solo `status = VISIBLE`. `limit` ≤ 48. Refresco perezoso: si `socialSyncAt` > 30 min (o no existe) ejecuta `syncSocial({ budgetMs: 6000 })` antes de responder (nunca falla la respuesta por errores de sincronización).
- `GET /api/cron/social-sync` → requiere `Authorization: Bearer ${CRON_SECRET}` (si `CRON_SECRET` no está definido responde 503). Ejecuta `syncSocial({ force: true, budgetMs: 25000 })` y devuelve el resumen.

Admin (JWT, como el resto de `/api/admin/*`):

- `GET /api/admin/social/status` → `{ lastSyncAt, env: { youtubeApiKey: boolean, facebookPageToken: boolean, cronSecret: boolean }, counts: { sources, posts, hidden } }`.
- `GET /api/admin/social/sources` → `{ items: SocialSource[] }`.
- `POST /api/admin/social/sources` `{ kind, label?, externalId?, url? }` → 201 `SocialSource`. Para `YOUTUBE_CHANNEL` acepta `url` (`/channel/UC…`, `/@handle`, `/c/...`) y resuelve `externalId` (UC…) descargando la página del canal (`"externalId":"UC…"` o `"channelId":"UC…"`); si no resuelve → 400 `{ error }`. `label` por defecto = nombre del canal (`<meta property="og:title">`) o el `externalId`.
- `PATCH /api/admin/social/sources/:id` `{ label?, enabled? }`; `DELETE /api/admin/social/sources/:id` (no borra sus posts; los deja con `sourceId = null`).
- `GET /api/admin/social/posts?page&pageSize(≤100)&status=VISIBLE|HIDDEN|ALL&q` → `{ items, total, page, pageSize }`.
- `POST /api/admin/social/posts` `{ url, title?, text?, imageUrl?, publishedAt?, author? }` → 201 `SocialPost` (`kind: LINK` salvo que sea YouTube → `YOUTUBE_VIDEO` con `externalId yt:<id>`, título/miniatura por oEmbed y `publishDate` de la página watch; otras URL → og:title/og:image/og:description con timeout 5 s y tope 1 MB; sin metadatos → 400 si tampoco llegó `title`). Si ya existe el `externalId` → 200 con el existente (idempotente).
- `PATCH /api/admin/social/posts/:id` `{ status?, pinned?, title?, text?, imageUrl? }`; `DELETE /api/admin/social/posts/:id`.
- `POST /api/admin/social/sync` → `syncSocial({ force: true, budgetMs: 25000 })` → `{ ok, startedAt, finishedAt, sources: [{ id, label, kind, added, updated, error? }], added, updated }`.
- `GET /api/admin/stats` añade `socialPostsVisible` y `socialLastSyncAt`.

Validación zod en `src/schemas/social.ts`. Rate limit no aplica (admin). Errores de red de una fuente nunca tumban la sincronización de las demás.

## 3. Sincronización (backend `src/lib/social/`)

- `youtube.ts`: `fetchChannelVideos(channelId, { apiKey? })` → `SocialPostInput[]` (máx. 15). Con clave: `playlistItems?part=snippet&playlistId=UU…&maxResults=15` (fecha exacta `snippet.publishedAt`, miniatura `snippet.thumbnails.high.url`, `videoOwnerChannelTitle`). Sin clave: HTML de `/channel/<id>/videos` (UA de navegador, timeout 8 s) → `ytInitialData` → `videoRenderer{videoId,title.runs[].text,publishedTimeText.simpleText,thumbnail.thumbnails[].url}`; para videos **nuevos** (no en BD) obtiene fecha exacta de `watch?v=` (`"publishDate"`), máximo 8 por ejecución; si falla, convierte el texto relativo ("hace 3 días", "2 weeks ago", "Streamed 1 month ago") a fecha aproximada. `searchVideos(query, { apiKey })` → solo con clave: `search?part=snippet&q=&type=video&order=date&maxResults=15&publishedAfter=<hoy-180d>`. `resolveChannelId(urlOrHandle)`.
- `facebook.ts`: `fetchPagePosts(pageIdOrUsername, token)` → Graph `v19.0/{page}/posts?fields=id,message,permalink_url,created_time,full_picture,attachments{title,url,unshimmed_url,media_type,media{image{src}}}&limit=15`. `title` = `attachments[0].title` o primera línea de `message` (≤ 120 caracteres) o "Publicación en Facebook"; `imageUrl` = `full_picture` o `media.image.src`; `url` = `permalink_url`. Sin token → la fuente queda con `lastError = "Falta FACEBOOK_PAGE_TOKEN"` y no se intenta la red.
- `resolve-link.ts`: metadatos de una URL para la carga manual (oEmbed de YouTube; og:* genéricos; `fb.watch`/`facebook.com` sin token → solo `title` si vino, sin red).
- `sync.ts`: `syncSocial({ force?, budgetMs })`: bloqueo blando (si `socialSyncAt` < 2 min y no `force`, no hace nada); recorre fuentes `enabled` (incluidas las `YOUTUBE_CHANNEL` derivadas de `YoutubeChannel` ACTIVE con `channelId` que no tengan fila en `SocialSource`, creándolas) con `Promise.allSettled` y timeout por fuente 8 s dentro del presupuesto global; `upsert` por `externalId` (en update solo `title/text/imageUrl/raw/publishedAt` si cambió; nunca toca `status`/`pinned`); actualiza `lastFetchedAt`/`lastError`; escribe `socialSyncAt`.
- Tests vitest: parseo de `ytInitialData` con fixture HTML reducido, parseo de fechas relativas, mapeo de posts de Graph con fixture JSON, `resolve-link` con `fetch` mockeado, integración `GET /api/social/feed` y admin (temp-db) con fetchers mockeados por `vi.mock`.

Variables de entorno nuevas (documentar en `.env.example`): `YOUTUBE_API_KEY` (opcional), `FACEBOOK_PAGE_TOKEN` (opcional; token de página de larga duración con `pages_read_engagement`), `CRON_SECRET` (recomendado). `vercel.json` añade `"crons": [{ "path": "/api/cron/social-sync", "schedule": "0 11 * * *" }]`.

## 4. Frontend

Tipos en `types/models.ts`:

```ts
export type SocialPostKind = "YOUTUBE_VIDEO" | "FACEBOOK_POST" | "LINK";
export interface SocialPost { id: string; sourceId: string | null; kind: SocialPostKind; externalId: string; title: string; text: string | null; url: string; imageUrl: string | null; author: string | null; publishedAt: string; status: "VISIBLE" | "HIDDEN"; pinned: boolean; createdAt: string; updatedAt: string }
export type SocialSourceKind = "YOUTUBE_CHANNEL" | "FACEBOOK_PAGE" | "YOUTUBE_SEARCH";
export interface SocialSource { id: string; kind: SocialSourceKind; label: string; externalId: string; url: string | null; enabled: boolean; lastFetchedAt: string | null; lastError: string | null; createdAt: string; updatedAt: string }
export interface SocialSyncSummary { ok: boolean; startedAt: string; finishedAt: string; added: number; updated: number; sources: Array<{ id: string; label: string; kind: SocialSourceKind; added: number; updated: number; error?: string }> }
export interface SocialStatus { lastSyncAt: string | null; env: { youtubeApiKey: boolean; facebookPageToken: boolean; cronSecret: boolean }; counts: { sources: number; posts: number; hidden: number } }
```

`lib/api.ts`: tag `social` → `/api/social` con `PUBLIC_REVALIDATE_DEFAULT` (60 s). Server actions del admin llaman `revalidateTag(publicTags.social)` y `revalidatePath("/novedades")`.

Rutas: `/novedades` (pública, hero + grilla + filtro por tipo via `?kind=`), `/admin/dashboard/novedades` (estado + fuentes + publicaciones + "Sincronizar ahora" + "Añadir enlace"). Sección "Novedades" en la home (6 últimas, oculta si no hay ninguna) con enlace "Ver todas". Copys fijos en `features/social/copy.ts` (no pasan por el CMS en esta iteración).

Tarjeta (`SocialPostCard`): miniatura 16:9 (o placeholder con el icono de la red), badge de red (YouTube rojo `#d90000`, Facebook `#1877f2` sobre fondo oscuro con texto blanco ≥ 4.5:1, Enlace neutro), título (2 líneas), autor · fecha relativa en español ("hace 2 días") con `<time dateTime>`, y para YouTube el botón "Ver" abre el embed lazy ya existente (`components/landing/youtube-lazy-embed.tsx`) en un diálogo; para los demás, enlace externo `target=_blank rel="noopener noreferrer"`.
