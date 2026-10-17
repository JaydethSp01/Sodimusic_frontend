import { test, expect, ADMIN_STORAGE_STATE, expectToast, fieldByLabel, standaloneAdminApi, uniq } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });
test.describe.configure({ mode: "serial" });

test.describe("Admin · Producciones (CRUD por UI)", () => {
  const title = `${uniq("E2E Prod")}`;
  const edited = `${title} editada`;

  test.afterAll(async () => {
    const { api, dispose } = await standaloneAdminApi();
    try {
      const data = await api.get<{ items: { id: string; title: string }[] }>("/api/admin/productions");
      for (const p of data.items.filter((x) => x.title.startsWith(title))) await api.delete(`/api/admin/productions/${p.id}`);
    } finally {
      await dispose();
    }
  });

  test("crear", async ({ page }) => {
    await page.goto("/admin/dashboard/productions");
    await page.getByRole("button", { name: /nueva producción/i }).click();
    const dialog = page.getByRole("dialog", { name: "Crear producción" });
    await expect(dialog).toBeVisible();
    // Validación: campos requeridos.
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, /completa campos requeridos/i);

    await fieldByLabel(dialog, "Título").fill(title);
    await fieldByLabel(dialog, "Artista").fill("E2E Artist");
    await fieldByLabel(dialog, "Ciudad").fill("Medellín");
    await fieldByLabel(dialog, "País").fill("Colombia");
    await fieldByLabel(dialog, "Año").fill("2021");
    await fieldByLabel(dialog, "Género").fill("Trap");
    await fieldByLabel(dialog, "YouTube URL (opcional)").fill("https://www.youtube.com/watch?v=e2e");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Producción creada");
    await expect(dialog).toBeHidden();
    const row = page.getByRole("row").filter({ hasText: title });
    await expect(row).toBeVisible({ timeout: 20_000 });
    await expect(row).toContainText("E2E Artist");
    await expect(row).toContainText("2021");
    await expect(row).toContainText("No");
  });

  test("editar", async ({ page }) => {
    await page.goto("/admin/dashboard/productions");
    const row = page.getByRole("row").filter({ hasText: title });
    await row.getByRole("button", { name: "Editar" }).click();
    const dialog = page.getByRole("dialog", { name: "Editar producción" });
    await expect(fieldByLabel(dialog, "Título")).toHaveValue(title);
    await fieldByLabel(dialog, "Título").fill(edited);
    await dialog.getByRole("checkbox").check();
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Producción actualizada");
    const updated = page.getByRole("row").filter({ hasText: edited });
    await expect(updated).toBeVisible({ timeout: 20_000 });
    await expect(updated).toContainText("Sí");
  });

  test("borrar con AlertDialog", async ({ page }) => {
    await page.goto("/admin/dashboard/productions");
    const row = page.getByRole("row").filter({ hasText: edited });
    await row.getByRole("button", { name: "Borrar" }).click();
    const alert = page.getByRole("alertdialog", { name: /borrar esta producción/i });
    await expect(alert).toContainText(edited);
    await alert.getByRole("button", { name: "Cancelar" }).click();
    await expect(alert).toBeHidden();
    await expect(page.getByRole("row").filter({ hasText: edited })).toBeVisible();

    await row.getByRole("button", { name: "Borrar" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Borrar" }).click();
    await expectToast(page, "Producción borrada");
    await expect(page.getByRole("row").filter({ hasText: edited })).toHaveCount(0, { timeout: 20_000 });
  });
});
