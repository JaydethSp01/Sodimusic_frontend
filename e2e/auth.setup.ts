import { test as setup, expect } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_STORAGE_STATE } from "./fixtures";

/**
 * Inicia sesión una vez por ejecución y guarda cookies en `e2e/.auth/admin.json`.
 * Los specs de admin lo reutilizan con `test.use({ storageState })`.
 */
setup("sesión admin (storageState)", async ({ page }) => {
  expect(ADMIN_PASSWORD, "Faltan credenciales admin (E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD)").toBeTruthy();
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Contraseña", { exact: true }).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /iniciar sesión en el panel/i }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: /^panel$/i })).toBeVisible({ timeout: 20_000 });
  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});
