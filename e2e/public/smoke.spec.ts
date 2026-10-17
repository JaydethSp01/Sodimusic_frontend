import { test, expect } from "@playwright/test";

test.describe("Humo público (regresión UI)", () => {
  test("inicio carga y muestra marca", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("beats, producciones, lanzamientos responden 200", async ({ page, isMobile }) => {
      // fixme (test/entorno): inestable con el dev server cargado (page.goto > 45 s, ERR_ABORTED por recompilaciones HMR); no es bug del producto.
    test.fixme(isMobile, "Inestable en el proyecto móvil con el dev server cargado (timeouts de navegación); no es bug del producto");
    for (const path of ["/beats", "/productions", "/releases", "/booking", "/artists", "/tienda", "/canales", "/contacto", "/legal/privacidad", "/legal/terminos-tienda", "/legal/terminos-estudio", "/legal/licencia-beats", "/legal/aviso-legal"]) {
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(res?.ok(), `${path} debe responder OK`).toBeTruthy();
    }
  });
});
