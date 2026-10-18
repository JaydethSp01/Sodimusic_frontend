import { test, expect, ADMIN_STORAGE_STATE, API_URL, expectToast, standaloneAdminApi, uniq } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });
test.describe.configure({ mode: "serial" });

type SiteConfig = { draft: { legal: { hours: string } }; published: { legal: { hours: string } } };

/**
 * Edita «Horario de atención» (card Legal), guarda borrador, previsualiza con la cookie
 * `site_preview`, publica y comprueba en el sitio público. Restaura el valor al final.
 */
test.describe("Admin · Sitio web (borrador, vista previa y publicación)", () => {
  let originalHours = "";
  const newHours = `Lunes a viernes, 9:00 a 18:00 · ${uniq("E2E")}`;

  test.beforeAll(async () => {
    const { api, dispose } = await standaloneAdminApi();
    try {
      const cfg = await api.get<SiteConfig>("/api/admin/site-config");
      originalHours = cfg.published.legal.hours;
    } finally {
      await dispose();
    }
  });

  test.afterAll(async () => {
    // Restaurar: borrador = valor original y publicar de nuevo.
    const { api, dispose } = await standaloneAdminApi();
    try {
      const cfg = await api.get<{ draft: Record<string, unknown> & { legal: { hours: string } } }>("/api/admin/site-config");
      cfg.draft.legal.hours = originalHours;
      await api.raw("PUT", "/api/admin/site-config/draft", cfg.draft);
      await api.raw("POST", "/api/admin/site-config/publish");
    } finally {
      await dispose();
    }
  });

  test("editar el horario en la card Legal y guardar borrador", async ({ page, adminApi }) => {
    await page.goto("/admin/dashboard/site");
    await expect(page.getByRole("heading", { name: /sitio web público/i })).toBeVisible();
    await page.getByRole("navigation", { name: "Secciones del editor" }).getByRole("link", { name: /legal/i }).click();
    const legal = page.locator("#site-section-legal");
    await expect(legal.getByRole("heading", { name: /legal y cumplimiento/i })).toBeVisible();
    const hours = legal.getByLabel(/horario de atención/i);
    await expect(hours).toHaveValue(originalHours);
    await hours.fill(newHours);
    await page.getByRole("button", { name: "Guardar borrador" }).click();
    await expectToast(page, /borrador guardado/i);

    const cfg = await adminApi.get<SiteConfig>("/api/admin/site-config");
    expect(cfg.draft.legal.hours).toBe(newHours);
    expect(cfg.published.legal.hours).toBe(originalHours);
  });

  test("vista previa con `site_preview` muestra el borrador solo con sesión", async ({ page, context }) => {
    await page.goto("/admin/dashboard/site");
    await page.getByRole("button", { name: "Vista previa" }).click();
    await expectToast(page, /vista previa activada/i);
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "site_preview")?.value).toBe("draft");

    await page.goto("/contacto");
    await expect(page.getByRole("status").filter({ hasText: /vista previa del borrador/i })).toBeVisible();
    await expect(page.getByRole("region", { name: "Hablemos" })).toContainText(newHours);

    // Sin sesión el borrador no se ve aunque exista la cookie.
    // (`browser.newContext()` hereda las opciones `use` del proyecto, incluido el storageState: se vacía explícitamente.)
    const anon = await page.context().browser()!.newContext({ storageState: { cookies: [], origins: [] } });
    await anon.addCookies([{ name: "site_preview", value: "draft", url: page.url() }]);
    const anonPage = await anon.newPage();
    await anonPage.goto("/contacto");
    await expect(anonPage.getByRole("region", { name: "Hablemos" })).toContainText(originalHours);
    await expect(anonPage.getByText(/vista previa del borrador/i)).toHaveCount(0);
    await anon.close();

    await page.getByRole("button", { name: /salir de vista previa/i }).click();
    await expect(page.getByText(/vista previa del borrador/i)).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Hablemos" })).toContainText(originalHours);
  });

  test("publicar y comprobar en el sitio público (sin sesión)", async ({ page, browser, request }) => {
    await page.goto("/admin/dashboard/site");
    await page.getByRole("button", { name: "Publicar" }).click();
    await expectToast(page, /cambios publicados/i);
    const pub = (await (await request.get(`${API_URL}/api/site-config`)).json()) as { content: { legal: { hours: string } } };
    expect(pub.content.legal.hours).toBe(newHours);

    const anon = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const anonPage = await anon.newPage();
    await anonPage.goto("/contacto");
    await expect(anonPage.getByRole("region", { name: "Hablemos" })).toContainText(newHours, { timeout: 20_000 });
    await expect(anonPage.getByText(/vista previa del borrador/i)).toHaveCount(0);
    await anon.close();
  });
});

test.describe("Admin · Sitio web (tarjeta «Inicio · Lo último, merch, leads y testimonios»)", () => {
  test("la tarjeta expone fuente, límites, leads y testimonios con los valores del borrador (sin guardar)", async ({ page, adminApi }) => {
    const cfg = await adminApi.get<{ draft: { home: { latest?: { source?: string; title?: string }; lead?: { title?: string } } } }>(
      "/api/admin/site-config",
    );
    await page.goto("/admin/dashboard/site");
    await page.getByRole("navigation", { name: "Secciones del editor" }).getByRole("link", { name: /inicio · lo último/i }).click();
    const card = page.locator("#site-section-home-latest");
    await expect(card.getByRole("heading", { name: /inicio · lo último, merch, leads y testimonios/i })).toBeVisible();
    // Los configs antiguos no traen estas claves: el editor rellena con los defaults.
    await expect(card.getByLabel(/lo último — fuente/i)).toHaveValue(cfg.draft.home.latest?.source ?? "feed");
    await expect(card.getByLabel(/lo último — título/i)).toHaveValue(cfg.draft.home.latest?.title ?? "Lo último del sello");
    await expect(card.getByLabel(/merch — productos a mostrar/i)).toHaveValue(/^\d+$/);
    await expect(card.getByLabel(/leads — título/i)).toHaveValue(cfg.draft.home.lead?.title ?? "¿Grabamos tu próximo tema?");
    await expect(card.getByRole("checkbox", { name: /mostrar el formulario de cotización/i })).toBeVisible();
    await expect(card.getByRole("button", { name: /añadir beneficio/i })).toBeVisible();
    await expect(card.getByRole("button", { name: /añadir testimonio/i })).toBeVisible();
  });
});
