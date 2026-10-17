import { test, expect } from "../fixtures";

const LEGAL_PAGES: Array<[string, RegExp]> = [
  ["/legal/privacidad", /privacidad|datos personales/i],
  ["/legal/terminos-tienda", /tienda/i],
  ["/legal/terminos-estudio", /estudio/i],
  ["/legal/licencia-beats", /beats/i],
  ["/legal/aviso-legal", /aviso legal/i],
];

test.describe("Páginas legales", () => {
  for (const [path, title] of LEGAL_PAGES) {
    test(`${path}: 200, H1, índice, «Última actualización» y sin marcadores pendientes`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
      await expect(h1).toHaveText(title);
      await expect(page.getByRole("navigation", { name: "Contenido del documento" })).toBeVisible();
      const tocLinks = page.getByRole("navigation", { name: "Contenido del documento" }).getByRole("link");
      expect(await tocLinks.count()).toBeGreaterThanOrEqual(3);
      await expect(page.getByText(/última actualización:/i)).toBeVisible();
      await expect(page.locator("article header time")).toHaveAttribute("datetime", /\d{4}-\d{2}-\d{2}/);

      // El índice enlaza a secciones existentes.
      const firstHref = (await tocLinks.first().getAttribute("href")) ?? "";
      expect(firstHref).toMatch(/^#/);
      await expect(page.locator(firstHref)).toHaveCount(1);

      // Para el público (sin sesión) nunca se muestran los marcadores de datos pendientes.
      const body = await page.locator("main").innerText();
      expect(body).not.toMatch(/\[pendiente/i);
      expect(body).not.toMatch(/vista de administrador/i);
    });
  }

  test("navegación lateral (escritorio) o selector (móvil) entre documentos", async ({ page, isMobile }) => {
    await page.goto("/legal/privacidad");
    if (isMobile) {
      const select = page.getByLabel("Documento", { exact: true });
      await expect(select).toBeVisible();
      await expect(select).toHaveValue("/legal/privacidad");
      await select.selectOption("/legal/licencia-beats");
      await expect(page).toHaveURL(/\/legal\/licencia-beats$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(/beats/i);
      return;
    }
    const nav = page.getByRole("navigation", { name: "Documentos legales" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link")).toHaveCount(5);
    await expect(nav.getByRole("link", { name: "Política de privacidad" })).toHaveAttribute("aria-current", "page");
    await nav.getByRole("link", { name: "Términos del estudio" }).click();
    await expect(page).toHaveURL(/\/legal\/terminos-estudio$/);
    await expect(nav.getByRole("link", { name: "Términos del estudio" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Política de privacidad" })).not.toHaveAttribute("aria-current", "page");
  });
});
