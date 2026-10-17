import type { Page } from "@playwright/test";
import { test, expect, PNG_1X1 } from "../fixtures";

/**
 * Regresión visual: capturas de página completa en escritorio y móvil.
 * - Animaciones deshabilitadas y `prefers-reduced-motion` (los revelados y contadores son instantáneos).
 * - Las imágenes remotas (Unsplash, YouTube) se sustituyen por un PNG transparente: así el
 *   hero conserva el texto visible y la captura no depende de la red. Máscara sobre iframes/embeds.
 * - Baselines en `e2e/__screenshots__` (regenerar con `npm run test:e2e:update-snapshots`).
 */
test.use({ contextOptions: { reducedMotion: "reduce" } });

/**
 * `fullPage` solo en páginas de contenido estático. En inicio, beats y tienda las secciones
 * dependen de datos que otros tests crean en paralelo (canales, beats, productos): se captura
 * el viewport (hero + primer bloque), que es estable.
 */
const ROUTES: Array<[string, string, boolean]> = [
  ["/", "inicio", false],
  ["/beats", "beats", false],
  ["/tienda", "tienda", false],
  ["/legal/privacidad", "legal-privacidad", true],
];

/** Sustituye imágenes remotas (directas o vía /_next/image) por un PNG 1×1 transparente. */
async function stubRemoteImages(page: Page): Promise<void> {
  const isRemoteImage = (url: string) =>
    /images\.unsplash\.com|i\.ytimg\.com|img\.youtube\.com/.test(url) ||
    (/\/_next\/image\?/.test(url) && /url=https?%3A/.test(url));
  await page.route("**/*", (route) => {
    if (isRemoteImage(route.request().url())) {
      return route.fulfill({ status: 200, contentType: "image/png", body: PNG_1X1 });
    }
    return route.continue();
  });
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  // Forzar la carga de imágenes lazy recorriendo la página.
  await page.evaluate(async () => {
    const step = Math.max(400, window.innerHeight);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

test.describe("Visual", () => {
  for (const [route, name, fullPage] of ROUTES) {
    test(`${route} coincide con la referencia`, async ({ page }) => {
      await stubRemoteImages(page);
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage,
        maxDiffPixelRatio: 0.02,
        animations: "disabled",
        mask: [page.locator("iframe"), page.locator("a[aria-label^='Escribir a']"), page.locator("time")],
      });
    });
  }
});
