# Sodimusic v2 — canales de YouTube, QR, tienda/merch y admin parametrizable

Fecha: 2026-10-16. Repos: `Sodimusic_frontend` (Next 14 App Router) y `Sodimusic_backend` (Hono + Prisma + Postgres, Vercel).

## Intención
El sello quiere (1) anclar varios canales de YouTube en la página, (2) un QR que lleve a la página (para flyers, merch, redes), (3) vender productos/merch desde un marketplace propio y (4) que todo —imágenes incluidas— se administre desde el panel admin sin tocar código.

## Hallazgos previos (estado al 2026-10-16)
- Producción: el backend responde 503 en `/health/db` con `PrismaClientInitializationError` tras ~5 s → la base de datos (Supabase) no es alcanzable (proyecto pausado o credenciales rotadas). Solo el dueño puede reactivarla.
- Los uploads del admin se guardaban en el disco de la función serverless (`/uploads`), que es efímero: las imágenes subidas desaparecían. Se reemplaza por almacenamiento durable.
- Secciones del home con datos fijos en código (cifras, servicios) aunque el CMS ya tenía los textos.
- Crew y productor sin foto (placeholder generado).

## Decisiones
- **Almacenamiento de medios**: `@vercel/blob` si existe `BLOB_READ_WRITE_TOKEN` (store `sodimusic-media` ya creado en la cuenta de Vercel; falta conectarlo al proyecto backend); si no, los archivos se guardan en Postgres (`MediaAsset`, bytea) y se sirven por `/uploads/:name`. Así los uploads funcionan en producción sin configuración extra.
- **Productos** en tabla `Product` (nombre, slug, descripción, precio COP, precio anterior, categoría, imágenes[], tallas[], stock, estado ACTIVE/DRAFT/SOLD_OUT, destacado, orden). Sin pasarela de pago: el pedido se cierra por WhatsApp con mensaje prellenado (carrito en el navegador con zustand + persist).
- **Canales de YouTube** en el CMS (`site.youtube.channels[]`): nombre, URL, channelId, descripción, avatar (subible), video destacado. Sin API key: se incrusta la lista de subidas (`UU` + id) o el video destacado.
- **QR**: generado en el frontend (`/api/qr`, paquete `qrcode`) en SVG/PNG con colores y tamaño; página admin `/admin/dashboard/qr` para previsualizar, descargar e imprimir; opcionalmente en el footer (`site.qr.showInFooter`).
- **CMS**: nuevas secciones `home.stats`, `artists.producerImageUrl`, `artists.members[].imageUrl`, `youtube`, `shop`, `qr`. La fusión con defaults (`mergeSiteContent`) hace que configuraciones ya publicadas sigan funcionando.
- **Migraciones**: `prisma migrate deploy` en el build de Vercel (script tolerante a baseline P3005) + `ensureShopSchema()` idempotente en runtime por si el build no alcanza la BD.
- Ruta pública de la tienda: `/tienda` y `/tienda/[slug]`. El enlace "Tienda" se añade al menú automáticamente si `shop.enabled` y no existe ya.

## No-objetivos
- Pasarela de pagos (Wompi/MercadoPago) — se deja para una fase 2; el flujo actual es pedido por WhatsApp.
- API de YouTube Data (requiere key); se usa embed de playlist de subidas.
