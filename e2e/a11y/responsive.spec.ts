import { test, expect, API_URL } from "../fixtures";

const PUBLIC_ROUTES = [
  "/",
  "/productions",
  "/releases",
  "/beats",
  "/artists",
  "/tienda",
  "/canales",
  "/contacto",
  "/booking",
  "/legal/privacidad",
  "/legal/terminos-tienda",
  "/legal/terminos-estudio",
  "/legal/licencia-beats",
  "/legal/aviso-legal",
];

/** Selectores de los objetivos táctiles «principales» (no todo enlace de texto en párrafos). */
const TOUCH_TARGETS = [
  "header a",
  "header button",
  "main button",
  "main a[href='/booking']",
  "main a[href='/contacto']",
  "main a[href='/tienda']",
  "main a[href='/productions']",
  "main a[href='/canales']",
  "main a[href^='https://wa.me']",
  "main a[target='_blank']",
  "footer [aria-label='Redes sociales'] a",
  "footer form button",
  "a[aria-label^='Escribir a']",
].join(", ");

test.describe("UX responsive (móvil)", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(!isMobile, "Solo en el proyecto móvil");
  });

  for (const route of PUBLIC_ROUTES) {
    test(`${route}: sin scroll horizontal y objetivos táctiles ≥ 44 px`, async ({ page, request }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      // Dejar que las imágenes/fuentes asienten el layout.
      await page.evaluate(() => document.fonts.ready);

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        bodyScroll: document.body.scrollWidth,
      }));
      expect(metrics.scrollWidth, `scroll horizontal en ${route}`).toBeLessThanOrEqual(metrics.innerWidth);
      expect(metrics.bodyScroll, `body más ancho que el viewport en ${route}`).toBeLessThanOrEqual(metrics.innerWidth);

      const small = await page.evaluate((selector) => {
        const out: { tag: string; label: string; w: number; h: number }[] = [];
        for (const el of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
          if (el.closest("[aria-hidden='true']")) continue;
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden" || el.offsetParent === null) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          // Enlaces de texto en línea (p. ej. «Licencia de beats» dentro de un párrafo) no son CTAs.
          if (el.tagName === "A" && cs.display === "inline") continue;
          // Checkbox/radio de Radix (20 px): el objetivo táctil es su <label> envolvente (min-h-11).
          const role = el.getAttribute("role");
          if (role === "checkbox" || role === "radio") continue;
          // Botones secundarios «Descargar» del kit de prensa (size=sm, 36 px): no son CTAs principales.
          if (el.tagName === "A" && el.hasAttribute("download")) continue;
          if (r.height < 44 || r.width < 44) {
            out.push({ tag: el.tagName, label: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) });
          }
        }
        return out;
      }, TOUCH_TARGETS);
      expect(small, `objetivos táctiles < 44 px en ${route}`).toEqual([]);

      // Comprobación extra en el detalle de producto (primer producto activo).
      if (route === "/tienda") {
        const data = (await (await request.get(`${API_URL}/api/products?pageSize=1`)).json()) as { items: { slug: string }[] };
        if (data.items[0]) {
          await page.goto(`/tienda/${data.items[0].slug}`);
          const m = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, w: window.innerWidth }));
          expect(m.s, "scroll horizontal en el detalle de producto").toBeLessThanOrEqual(m.w);
        }
      }
    });
  }

  test("prefers-reduced-motion: todo el inicio queda visible sin hacer scroll", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, baseURL });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Sin scroll: las secciones con revelado deben estar ya con opacidad 1 y sin transformación.
    const hidden = await page.evaluate(() => {
      const out: { id: string; opacity: string; transform: string }[] = [];
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], section[aria-labelledby]"))) {
        const cs = getComputedStyle(el);
        if (Number(cs.opacity) < 1 || (cs.transform !== "none" && cs.transform !== "matrix(1, 0, 0, 1, 0, 0)")) {
          out.push({ id: el.getAttribute("aria-labelledby") ?? el.className.slice(0, 30), opacity: cs.opacity, transform: cs.transform });
        }
      }
      return out;
    });
    expect(hidden, "secciones ocultas con reduced-motion").toEqual([]);
    // Las cifras muestran el valor final sin animar.
    const about = page.locator("section[aria-labelledby='about-title'] dl dd");
    const values = await about.allInnerTexts();
    expect(values.length).toBeGreaterThan(0);
    for (const v of values) expect(v).not.toBe("0");
    await context.close();
  });
});
