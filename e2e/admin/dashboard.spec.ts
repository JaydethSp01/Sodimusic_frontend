import { test, expect, ADMIN_STORAGE_STATE } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });

test.describe("Admin · panel", () => {
  test("KPIs visibles con valores numéricos (incluye canales, mensajes, suscriptores e intereses)", async ({ page, adminApi }) => {
    const stats = await adminApi.get<Record<string, number>>("/api/admin/dashboard/stats");
    await page.goto("/admin/dashboard");
    await expect(page.getByRole("heading", { level: 1, name: /^panel$/i })).toBeVisible();

    const kpis: Array<[string, string]> = [
      ["Sesiones pendientes", "pendingSessions"],
      ["Sesiones esta semana", "sessionsWeek"],
      ["Beats disponibles", "beatsAvailable"],
      ["Producciones en portafolio", "productionsTotal"],
      ["Productos activos", "productsActive"],
      ["Canales activos", "channelsActive"],
      ["Mensajes nuevos", "messagesNew"],
      ["Suscriptores", "subscribersActive"],
      ["Intereses en beats", "beatInterests30d"],
    ];
    for (const [label, key] of kpis) {
      const title = page.locator("main").getByText(label, { exact: true }).first();
      await expect(title, `KPI «${label}»`).toBeVisible();
      const value = title.locator("xpath=ancestor::div[contains(@class,'rounded-2xl')][1]//p[last()]");
      // El contador anima hasta el valor del backend; esperamos el valor final.
      await expect(value).toHaveText(String(stats[key]), { timeout: 10_000 });
    }
    await expect(page.getByRole("link", { name: "Mensajes nuevos" })).toHaveAttribute("href", "/admin/dashboard/mensajes");
    await expect(page.getByRole("link", { name: "Intereses en beats" })).toHaveAttribute("href", /mensajes\?tab=beats/);
    await expect(page.getByRole("heading", { name: "Visitas al sitio" })).toBeVisible();
    await expect(page.getByText("Vistas por día")).toBeVisible();
    await expect(page.getByText("Sesiones por estado")).toBeVisible();
  });

  test("navegación lateral llega a cada módulo", async ({ page }) => {
    test.fixme(!process.env.CI, "fixme (test/entorno): 11 navegaciones del panel superan el presupuesto con el dev server cargado en local; no es bug del producto. Se ejecuta en CI.");
    test.setTimeout(150_000);
    await page.goto("/admin/dashboard");
    const nav = page.getByRole("navigation", { name: "Panel admin" });
    const modules: Array<[string, RegExp]> = [
      ["Sitio web", /sitio web público/i],
      ["Sesiones", /^sesiones$/i],
      ["Producciones", /^producciones$/i],
      ["Beats", /^beats$/i],
      ["Releases", /^releases$/i],
      ["Tienda", /^tienda$/i],
      ["Mensajes", /^mensajes$/i],
      ["Suscriptores", /^suscriptores$/i],
      ["Canales", /canales de youtube/i],
      ["Calendario", /calendario del estudio/i],
      ["Código QR", /estudio de código qr/i],
    ];
    for (const [label, heading] of modules) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible({ timeout: 30_000 });
    }
  });
});
