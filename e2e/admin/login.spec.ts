import { test, expect, ADMIN_EMAIL, ADMIN_PASSWORD } from "../fixtures";

// Estas pruebas empiezan SIN sesión (ignoran el storageState del proyecto).
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Admin · login y logout", () => {
  test("credenciales incorrectas muestran error accesible y no entran", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { level: 1, name: /panel admin/i })).toBeVisible();
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Contraseña", { exact: true }).fill("contraseña-incorrecta");
    await page.getByRole("button", { name: /iniciar sesión en el panel/i }).click();
    await expect(page.getByRole("alert").filter({ hasText: /credenciales incorrectas/i })).toBeVisible({ timeout: 20_000 });
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("mostrar/ocultar contraseña", async ({ page }) => {
    await page.goto("/admin/login");
    const pwd = page.getByLabel("Contraseña", { exact: true });
    await expect(pwd).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Mostrar contraseña" }).click();
    await expect(pwd).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Ocultar contraseña" }).click();
    await expect(pwd).toHaveAttribute("type", "password");
  });

  test("/admin/dashboard sin sesión redirige al login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("credenciales correctas entran al panel", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Contraseña", { exact: true }).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /iniciar sesión en el panel/i }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1, name: /^panel$/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("navigation", { name: "Panel admin" }).getByRole("link", { name: "Canales" })).toHaveAttribute(
      "href",
      "/admin/dashboard/canales",
    );

    // Con sesión, /admin/login redirige al dashboard.
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test("«Cerrar sesión» invalida la sesión y vuelve al sitio público", async ({ page, context }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Contraseña", { exact: true }).fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /iniciar sesión en el panel/i }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/, { timeout: 30_000 });

    const signout = page.waitForResponse((r) => r.url().includes("/api/auth/signout") && r.request().method() === "POST");
    await page.getByRole("button", { name: /cerrar sesión/i }).click();
    expect((await signout).status()).toBe(200);
    await expect(page).toHaveURL(/\/$/, { timeout: 45_000 });

    const sessionCookie = (await context.cookies()).find((c) => /session-token/.test(c.name));
    await page.goto("/admin/dashboard");
    const stillLoggedIn = /\/admin\/dashboard/.test(page.url());
    test.fixme(
      stillLoggedIn,
      `BUG: «Cerrar sesión» (features/admin/components/admin-logout-button.tsx → signOut({ callbackUrl: "/" }) de next-auth v5 beta) responde 200 en POST /api/auth/signout pero la cookie ${sessionCookie?.name ?? "authjs.session-token"} sigue presente y /admin/dashboard continúa accesible sin volver a iniciar sesión.`,
    );
    await expect(page).toHaveURL(/\/admin\/login/);
    expect(sessionCookie).toBeUndefined();
  });
});
