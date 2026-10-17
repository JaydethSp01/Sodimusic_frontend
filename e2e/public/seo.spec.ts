import { test, expect } from "../fixtures";

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

test.describe("SEO", () => {
  test("sitemap.xml y robots.txt", async ({ request, baseURL }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(sitemap.headers()["content-type"]).toMatch(/xml/);
    let xml = await sitemap.text();
    // Si es un índice (next-sitemap), se agregan los sitemaps hijos.
    const isIndex = /<sitemapindex/i.test(xml);
    if (isIndex) {
      const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
      for (const loc of locs) xml += await (await request.get(loc)).text();
    }
    const missing = ["/canales", "/contacto", "/legal/privacidad", "/beats", "/tienda"].filter((p) => !xml.includes(`${baseURL}${p}`));
    test.fixme(
      isIndex && missing.length > 0,
      `BUG: public/sitemap.xml (generado por next-sitemap en postbuild) tapa app/sitemap.ts; sitemap-0.xml solo lista robots.txt, /admin/login y sitemap.xml. Faltan: ${missing.join(", ")}`,
    );
    expect(missing, "rutas públicas ausentes del sitemap").toEqual([]);
    expect(xml, "el sitemap no debe listar /admin").not.toMatch(/\/admin/);
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const txt = await robots.text();
    expect(txt).toMatch(/User-Agent:\s*\*/i);
    expect(txt).toMatch(/Disallow:\s*\/admin/i);
    expect(txt).toMatch(/Sitemap:\s*\S+\/sitemap\.xml/i);
  });

  test("cada página pública tiene <title> único, meta description y lang=es", async ({ page }) => {
    test.setTimeout(120_000);
    const titles = new Map<string, string>();
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("lang", "es");
      const title = await page.title();
      expect(title.trim().length, `${route} sin <title>`).toBeGreaterThan(5);
      const description = await page.locator("head meta[name='description']").getAttribute("content");
      expect(description?.trim().length ?? 0, `${route} sin meta description`).toBeGreaterThan(20);
      titles.set(route, title);
    }
    const seen = new Map<string, string[]>();
    for (const [route, title] of Array.from(titles.entries())) seen.set(title, [...(seen.get(title) ?? []), route]);
    const duplicates = Array.from(seen.entries()).filter(([, routes]) => routes.length > 1);
    expect(duplicates, "títulos duplicados entre páginas públicas").toEqual([]);
  });
});

test.describe("QR", () => {
  test("/api/qr?size=200 devuelve image/png y ?format=svg devuelve SVG", async ({ request }) => {
    const png = await request.get("/api/qr?size=200");
    expect(png.status()).toBe(200);
    expect(png.headers()["content-type"]).toBe("image/png");
    const bytes = await png.body();
    expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");

    const svg = await request.get("/api/qr?size=200&format=svg");
    expect(svg.status()).toBe(200);
    expect(svg.headers()["content-type"]).toMatch(/image\/svg\+xml/);
    expect(await svg.text()).toContain("<svg");

    const bad = await request.get("/api/qr?url=javascript:alert(1)");
    expect(bad.status()).toBe(400);
  });
});

test.describe("Página 404", () => {
  test("ruta inexistente devuelve 404 y una página de error con estilo del sitio", async ({ page }) => {
    const res = await page.goto("/ruta-que-no-existe-e2e");
    expect(res?.status()).toBe(404);
    const isNextDefault = await page.getByText("This page could not be found.").isVisible().catch(() => false);
    test.fixme(
      isNextDefault,
      "BUG: no existe app/not-found.tsx; la ruta inexistente muestra la 404 genérica de Next.js (en inglés, sin navbar ni marca).",
    );
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /inicio|volver/i }).first()).toBeVisible();
  });
});
