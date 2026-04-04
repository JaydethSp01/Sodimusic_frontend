import { test, expect } from "@playwright/test";

const SEED_EMAIL = "Jeivymusicdinero@gmail.com";
const SEED_PASSWORD = "sodimusic2016";

const email =
  process.env.E2E_ADMIN_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || SEED_EMAIL;
let password = process.env.E2E_ADMIN_PASSWORD?.trim() || process.env.ADMIN_PASSWORD?.trim() || "";
if (!password && email.toLowerCase() === SEED_EMAIL.toLowerCase()) {
  password = SEED_PASSWORD;
}
const canRun = Boolean(email && password);

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /entrar|iniciar sesión/i }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 25_000 });
}

test.describe("UAT automatizado — panel admin", () => {
  test.skip(!canRun, "Sin credenciales (usa seed o E2E_ADMIN_* / ADMIN_* en env)");

  test("login y panel principal", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { level: 1, name: /^panel$/i })).toBeVisible({ timeout: 15_000 });
  });

  test("beats: tabla y crear", async ({ page }) => {
    await login(page);
    await page.goto("/admin/dashboard/beats");
    await expect(page.getByRole("button", { name: /nuevo beat/i })).toBeVisible({ timeout: 20_000 });
  });

  test("producciones: tabla y crear", async ({ page }) => {
    await login(page);
    await page.goto("/admin/dashboard/productions");
    await expect(page.getByRole("button", { name: /nueva producción/i })).toBeVisible({ timeout: 20_000 });
  });

  test("releases: tabla y crear", async ({ page }) => {
    await login(page);
    await page.goto("/admin/dashboard/releases");
    await expect(page.getByRole("button", { name: /nueva release/i })).toBeVisible({ timeout: 20_000 });
  });

  test("sitio web: editor CMS", async ({ page }) => {
    await login(page);
    await page.goto("/admin/dashboard/site");
    await expect(page.getByRole("heading", { name: /sitio web público/i })).toBeVisible({ timeout: 20_000 });
  });

  test("sesiones: listado", async ({ page }) => {
    await login(page);
    await page.goto("/admin/dashboard/sessions");
    await expect(page.getByRole("heading", { level: 1, name: /^sesiones$/i })).toBeVisible({ timeout: 20_000 });
  });

  test("calendario", async ({ page }) => {
    await login(page);
    await page.goto("/admin/dashboard/calendar");
    await expect(page.getByRole("heading", { name: /calendario y disponibilidad/i })).toBeVisible({
      timeout: 20_000,
    });
  });
});
