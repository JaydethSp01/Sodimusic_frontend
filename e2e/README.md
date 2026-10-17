# Suite e2e (Playwright)

Pruebas de extremo a extremo del frontend de Sodimusic: módulos públicos, panel admin,
accesibilidad (axe + contraste), UX responsive y regresión visual.

## Requisitos

- Backend en `http://localhost:4000` con la base de datos local de seed
  (Docker Postgres `postgresql://sodimusic:sodimusic@127.0.0.1:5434/sodimusic`).
- Frontend `next dev` en `http://localhost:3000` (con `.env.local` apuntando al backend).
- `psql` en el PATH (se usa para limpiar datos de prueba en tablas sin endpoint de borrado).
- Navegadores de Playwright instalados: `npx playwright install chromium`.

Alternativa: `PLAYWRIGHT_START_SERVERS=1 npm run test:e2e` levanta backend (`../Sodimusic_backend`,
`npm run dev`) y frontend (`npm run dev`) antes de las pruebas.

Variables opcionales:

| Variable | Por defecto | Uso |
| --- | --- | --- |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:3000` | URL del frontend (usa `localhost`, no `127.0.0.1`: NEXTAUTH_URL y CORS) |
| `PLAYWRIGHT_API_URL` | `http://localhost:4000` | URL del backend |
| `PLAYWRIGHT_DATABASE_URL` | `postgresql://sodimusic:sodimusic@127.0.0.1:5434/sodimusic` | BD para limpieza por SQL |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | credenciales del seed | Admin del panel |

## Comandos

```bash
npm run test:e2e                  # todo (setup + chromium + mobile)
npm run test:e2e:public           # solo módulos públicos (escritorio y móvil)
npm run test:e2e:admin            # solo panel admin (escritorio)
npm run test:e2e:a11y             # axe, contraste, responsive y visual
npm run test:e2e:update-snapshots # regenerar baselines visuales
npm run test:e2e:ui               # modo UI
npx playwright show-report        # informe HTML de la última ejecución
```

## Estructura

```
e2e/
  fixtures.ts        # test extendido: API admin (token), limpieza SQL (psql), helpers de UI
  auth.setup.ts      # login admin una vez → e2e/.auth/admin.json (storageState)
  public/*.spec.ts   # inicio, navegación, footer/newsletter, producciones, beats, lanzamientos,
                     # artistas, canales, tienda, booking, contacto, legal, SEO/QR/404, smoke
  admin/*.spec.ts    # login, panel, CRUD (producciones, beats, releases, tienda, canales),
                     # mensajes, suscriptores, sitio (borrador/preview/publicar), calendario,
                     # sesiones, QR, subida de imágenes, UAT heredado
  a11y/axe.spec.ts   # axe wcag2a/wcag2aa + contraste calculado
  a11y/responsive.spec.ts  # sin scroll horizontal, objetivos táctiles ≥ 44 px, reduced-motion
  a11y/visual.spec.ts      # toHaveScreenshot (desktop y móvil)
  __screenshots__/   # baselines visuales
```

Proyectos (`playwright.config.ts`): `setup`, `chromium` (escritorio, todo) y `mobile`
(Pixel 7: specs públicos + responsive + visual). El admin solo corre en escritorio.

## Reglas de la suite

- Cada test limpia lo que crea (`afterEach`/`afterAll`), por API admin o por SQL (`cleanup.*`).
  Los datos de prueba llevan prefijo `E2E`/`e2e-` para poder barrerlos (`cleanup.staleCrm()`).
- Selectores por rol/etiqueta/texto; en los formularios del admin (`<Label>` sin `htmlFor`)
  se usa `fieldByLabel(dialog, "Título")`.
- `test.describe.configure({ mode: "serial" })` solo en los CRUD.
- `retries: 1` en local (2 en CI): un fallo transitorio por HMR del dev server se reintenta.
- Los bugs reales del producto se marcan con `test.fixme(...)` y evidencia en el nombre.
- El backend limita los formularios públicos (newsletter, contacto, booking) a 10 envíos / 10 min por IP
  (`publicFormLimit`): los envíos reales se hacen solo en el proyecto `chromium`; el móvil cubre layout y validación.
