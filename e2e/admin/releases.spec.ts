import { test, expect, ADMIN_STORAGE_STATE, dateKey, expectToast, fieldByLabel, standaloneAdminApi, uniq } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });
test.describe.configure({ mode: "serial" });

test.describe("Admin · Releases (CRUD por UI con smart links y fecha)", () => {
  const slug = uniq("e2e-release").toLowerCase();
  const title = `E2E Release ${slug.slice(-5)}`;
  const future = new Date();
  future.setDate(future.getDate() + 45);
  const futureKey = dateKey(future);

  test.afterAll(async () => {
    const { api, dispose } = await standaloneAdminApi();
    try {
      const data = await api.get<{ items: { id: string; slug: string }[] }>("/api/admin/releases");
      for (const r of data.items.filter((x) => x.slug.startsWith(slug))) await api.delete(`/api/admin/releases/${r.id}`);
    } finally {
      await dispose();
    }
  });

  test("crear con smart links (validación de URL) y fecha futura", async ({ page }) => {
    await page.goto("/admin/dashboard/releases");
    await page.getByRole("button", { name: /nueva release/i }).click();
    const dialog = page.getByRole("dialog", { name: /crear release/i });
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, /completa título, slug/i);

    await fieldByLabel(dialog, "Título").fill(title);
    await fieldByLabel(dialog, "Slug (único)").fill(slug);
    await fieldByLabel(dialog, "Artista").fill("E2E Artist");
    await fieldByLabel(dialog, "Género").fill("Afrobeat");
    await fieldByLabel(dialog, "Fecha de lanzamiento (opcional)").fill(futureKey);
    await expect(fieldByLabel(dialog, "Año de release")).toHaveValue(futureKey.slice(0, 4));
    await fieldByLabel(dialog, "Descripción (opcional)").fill("Descripción E2E");

    await dialog.getByLabel("Spotify").fill("no-es-url");
    await expect(dialog.getByRole("alert").filter({ hasText: /https:\/\//i })).toBeVisible();
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, /enlace de spotify debe ser una url válida/i);
    await dialog.getByLabel("Spotify").fill("https://open.spotify.com/album/e2e");
    await dialog.getByLabel("Deezer").fill("https://www.deezer.com/album/e2e");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Release creada");

    const row = page.getByRole("row").filter({ hasText: title });
    await expect(row).toBeVisible({ timeout: 20_000 });
    await expect(row).toContainText(slug);
    await expect(row).toContainText(futureKey.slice(0, 4));
    await expect(row.getByRole("link", { name: "Preview" })).toHaveAttribute("href", `/releases/${slug}`);
  });

  test("detalle público: solo Spotify y Deezer, fecha y cuenta regresiva", async ({ page }) => {
    await page.goto(`/releases/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Escuchar en plataformas" }).first();
    await expect(nav.getByRole("link")).toHaveCount(2);
    await expect(nav.getByRole("link", { name: /spotify/i })).toHaveAttribute("href", "https://open.spotify.com/album/e2e");
    await expect(nav.getByRole("link", { name: /deezer/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /youtube/i })).toHaveCount(0);
    await expect(page.locator("time").first()).toHaveAttribute("datetime", new RegExp(`^${futureKey}`));
    await expect(page.getByRole("timer")).toContainText(/faltan/i);
    await expect(page.getByRole("timer")).not.toContainText("--");
    await expect(page.getByRole("link", { name: /lanzamientos|inicio/i }).first()).toBeVisible();
  });

  test("editar: quitar fecha y pasar a catálogo", async ({ page }) => {
    await page.goto("/admin/dashboard/releases");
    const row = page.getByRole("row").filter({ hasText: title });
    await row.getByRole("button", { name: "Editar" }).click();
    const dialog = page.getByRole("dialog", { name: /editar release/i });
    await expect(dialog.getByLabel("Spotify")).toHaveValue("https://open.spotify.com/album/e2e");
    await fieldByLabel(dialog, "Fecha de lanzamiento (opcional)").fill("");
    await dialog.getByLabel("Spotify").fill("");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Release actualizada");
    await page.goto(`/releases/${slug}`);
    await expect(page.getByRole("navigation", { name: "Escuchar en plataformas" }).first().getByRole("link")).toHaveCount(1);
    await expect(page.getByRole("timer")).toHaveCount(0);
  });

  test("borrar con AlertDialog y 404 posterior", async ({ page }) => {
    await page.goto("/admin/dashboard/releases");
    const row = page.getByRole("row").filter({ hasText: title });
    await row.getByRole("button", { name: "Borrar" }).click();
    const alert = page.getByRole("alertdialog", { name: /borrar esta release/i });
    await expect(alert).toContainText(slug);
    await alert.getByRole("button", { name: "Borrar" }).click();
    await expectToast(page, "Release borrada");
    await expect(page.getByRole("row").filter({ hasText: title })).toHaveCount(0, { timeout: 20_000 });
    const res = await page.goto(`/releases/${slug}`);
    expect(res?.status()).toBe(404);
  });
});
