import { test, expect, ADMIN_STORAGE_STATE } from "../fixtures";

/**
 * UAT automatizado original (antes `e2e/uat-automated.spec.ts`), integrado en la
 * suite: usa el storageState del proyecto en vez de iniciar sesión en cada test.
 */
test.use({ storageState: ADMIN_STORAGE_STATE });

test.describe("UAT automatizado — panel admin", () => {
  test("login y panel principal", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole("heading", { level: 1, name: /^panel$/i })).toBeVisible({ timeout: 15_000 });
  });

  test("beats: tabla y crear", async ({ page }) => {
    await page.goto("/admin/dashboard/beats");
    await expect(page.getByRole("button", { name: /nuevo beat/i })).toBeVisible({ timeout: 20_000 });
  });

  test("producciones: tabla y crear", async ({ page }) => {
    await page.goto("/admin/dashboard/productions");
    await expect(page.getByRole("button", { name: /nueva producción/i })).toBeVisible({ timeout: 20_000 });
  });

  test("releases: tabla y crear", async ({ page }) => {
    await page.goto("/admin/dashboard/releases");
    await expect(page.getByRole("button", { name: /nueva release/i })).toBeVisible({ timeout: 20_000 });
  });

  test("sitio web: editor CMS", async ({ page }) => {
    await page.goto("/admin/dashboard/site");
    await expect(page.getByRole("heading", { name: /sitio web público/i })).toBeVisible({ timeout: 20_000 });
  });

  test("sesiones: listado", async ({ page }) => {
    await page.goto("/admin/dashboard/sessions");
    await expect(page.getByRole("heading", { level: 1, name: /^sesiones$/i })).toBeVisible({ timeout: 20_000 });
  });

  test("calendario", async ({ page }) => {
    await page.goto("/admin/dashboard/calendar");
    await expect(page.getByRole("heading", { name: /calendario del estudio/i })).toBeVisible({ timeout: 20_000 });
  });
});
