import { test, expect } from "../fixtures";

/**
 * /novedades: feed social público. Si el backend aún no tiene publicaciones
 * (o la ruta no existe), solo se valida el estado vacío.
 */
test.describe("Novedades (público)", () => {
  test("la página carga con H1, chips de tipo y grilla o estado vacío", async ({ page }) => {
    await page.goto("/novedades");
    await expect(page.getByRole("heading", { level: 1, name: "Novedades" })).toBeVisible();

    const list = page.getByRole("region", { name: "Listado de novedades" });
    await expect(list).toBeVisible();
    const chips = page.getByRole("navigation", { name: "Tipo de novedad" });
    await expect(chips.getByRole("link", { name: /^Todas/ })).toHaveAttribute("aria-current", "page");
    await expect(chips.getByRole("link", { name: "YouTube" })).toHaveAttribute("href", "/novedades?kind=YOUTUBE_VIDEO");
    await expect(chips.getByRole("link", { name: "Facebook" })).toHaveAttribute("href", "/novedades?kind=FACEBOOK_POST");
    await expect(chips.getByRole("link", { name: "Enlace" })).toHaveAttribute("href", "/novedades?kind=LINK");

    const cards = list.locator("article");
    const count = await cards.count();
    if (count === 0) {
      await expect(list).toContainText(/todavía no hay novedades/i);
      return;
    }
    expect(count).toBeLessThanOrEqual(48);
    await expect(cards.first().getByRole("heading", { level: 3 })).toBeVisible();
    await expect(cards.first().locator("time").first()).toHaveAttribute("datetime", /\d{4}-\d{2}-\d{2}/);
  });

  test("las chips cambian ?kind= y el filtro se refleja en la lista", async ({ page }) => {
    await page.goto("/novedades");
    const chips = page.getByRole("navigation", { name: "Tipo de novedad" });
    await chips.getByRole("link", { name: "YouTube" }).click();
    await expect(page).toHaveURL(/\/novedades\?kind=YOUTUBE_VIDEO$/);
    await expect(chips.getByRole("link", { name: "YouTube" })).toHaveAttribute("aria-current", "page");

    const list = page.getByRole("region", { name: "Listado de novedades" });
    const cards = list.locator("article");
    if ((await cards.count()) === 0) {
      await expect(list).toContainText(/no hay novedades de este tipo/i);
      await expect(list.getByRole("link", { name: /ver todas las novedades/i })).toHaveAttribute("href", "/novedades");
    } else {
      // Todas las tarjetas del filtro son de YouTube.
      await expect(list.locator("article[data-kind='YOUTUBE_VIDEO']")).toHaveCount(await cards.count());
      await expect(cards.first().getByRole("button", { name: /^Ver en YouTube:/ }).first()).toBeVisible();
    }

    await chips.getByRole("link", { name: /^Todas/ }).click();
    await expect(page).toHaveURL(/\/novedades$/);
  });

  test("los enlaces externos de las tarjetas abren en pestaña nueva con rel=noopener", async ({ page }) => {
    await page.goto("/novedades");
    const list = page.getByRole("region", { name: "Listado de novedades" });
    const externals = list.locator("article a[target='_blank']");
    const n = await externals.count();
    test.skip(n === 0, "Feed vacío: no hay tarjetas con enlace externo");
    for (let i = 0; i < Math.min(n, 12); i++) {
      const rel = (await externals.nth(i).getAttribute("rel")) ?? "";
      expect(rel.split(/\s+/), `rel del enlace ${i}`).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
      expect((await externals.nth(i).getAttribute("href")) ?? "").toMatch(/^https?:\/\//);
    }
  });

  test("una tarjeta de YouTube abre el embed en un diálogo (un solo iframe)", async ({ page }) => {
    await page.goto("/novedades?kind=YOUTUBE_VIDEO");
    const list = page.getByRole("region", { name: "Listado de novedades" });
    const watch = list.getByRole("button", { name: "Ver", exact: true });
    test.skip((await watch.count()) === 0, "No hay videos de YouTube en el feed");
    expect(await page.locator("iframe").count()).toBe(0);
    await watch.first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const poster = dialog.getByRole("button", { name: /^Reproducir:/ });
    if (await poster.isVisible().catch(() => false)) await poster.click();
    await expect(dialog.locator("iframe")).toHaveCount(1);
    expect((await dialog.locator("iframe").getAttribute("src")) ?? "").toContain("youtube-nocookie.com");
    await dialog.getByRole("button", { name: "Cerrar diálogo" }).click();
    await expect(dialog).toBeHidden();
    expect(await page.locator("iframe").count()).toBe(0);
  });
});
