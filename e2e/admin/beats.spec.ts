import { test, expect, ADMIN_STORAGE_STATE, expectToast, fieldByLabel, standaloneAdminApi, uniq } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });
test.describe.configure({ mode: "serial" });

test.describe("Admin · Beats (CRUD por UI con precios por licencia)", () => {
  const title = uniq("E2E Beat");
  const edited = `${title} editado`;

  test.afterAll(async () => {
    const { api, dispose } = await standaloneAdminApi();
    try {
      const data = await api.get<{ items: { id: string; title: string }[] }>("/api/admin/beats");
      for (const b of data.items.filter((x) => x.title.startsWith(title))) await api.delete(`/api/admin/beats/${b.id}`);
    } finally {
      await dispose();
    }
  });

  test("crear con 4 precios: «desde» = mínimo", async ({ page }) => {
    await page.goto("/admin/dashboard/beats");
    await page.getByRole("button", { name: /nuevo beat/i }).click();
    const dialog = page.getByRole("dialog", { name: "Crear beat" });
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, /completa título, género/i);

    await fieldByLabel(dialog, "Título").fill(title);
    await fieldByLabel(dialog, "Género").fill("Trap");
    await fieldByLabel(dialog, "BPM (opcional)").fill("128");
    await fieldByLabel(dialog, "Mood (opcional)").fill("E2E");
    await dialog.getByLabel("Licencia MP3").fill("150000");
    await dialog.getByLabel("Licencia WAV").fill("120000");
    await dialog.getByLabel("Licencia Stems").fill("300000");
    await dialog.getByLabel("Licencia exclusiva").fill("900000");
    // El precio «desde» se calcula con la licencia más barata y queda de solo lectura.
    const from = fieldByLabel(dialog, "Precio «desde» COP");
    await expect(from).toHaveValue("120000");
    await expect(from).toHaveAttribute("readonly", "");
    await expect(dialog.getByText(/se calcula con la licencia más barata/i)).toBeVisible();
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Beat creado");

    const row = page.getByRole("row").filter({ hasText: title });
    await expect(row).toBeVisible({ timeout: 20_000 });
    await expect(row).toContainText("120.000 COP");
    await expect(row).toContainText("MP3 · WAV · Stems · Excl.");
    await expect(row).toContainText("AVAILABLE");
  });

  test("el sitio público muestra «Desde» con el mínimo y las 4 licencias", async ({ page }) => {
    await page.goto("/beats");
    const card = page.getByRole("article", { name: title });
    await expect(card).toBeVisible({ timeout: 20_000 });
    await expect(card).toContainText("Desde");
    await expect(card).toContainText("$ 120.000");
    await card.getByRole("button", { name: `Elegir licencia para ${title}` }).click();
    const dialog = page.getByRole("dialog", { name: "Elegir licencia" });
    const rows = dialog.getByRole("list", { name: "Licencias disponibles" }).getByRole("button");
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(0)).toContainText("$ 150.000");
    await expect(rows.nth(1)).toContainText("$ 120.000");
    await expect(rows.nth(3)).toContainText("$ 900.000");
  });

  test("editar: quitar licencias y cambiar estado a vendido", async ({ page }) => {
    await page.goto("/admin/dashboard/beats");
    const row = page.getByRole("row").filter({ hasText: title });
    await row.getByRole("button", { name: "Editar" }).click();
    const dialog = page.getByRole("dialog", { name: "Editar beat" });
    await expect(fieldByLabel(dialog, "Título")).toHaveValue(title);
    await fieldByLabel(dialog, "Título").fill(edited);
    await dialog.getByLabel("Licencia WAV").fill("");
    await dialog.getByLabel("Licencia Stems").fill("");
    await expect(fieldByLabel(dialog, "Precio «desde» COP")).toHaveValue("150000");
    await fieldByLabel(dialog, "Estado").selectOption("SOLD");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Beat actualizado");
    const updated = page.getByRole("row").filter({ hasText: edited });
    await expect(updated).toContainText("150.000 COP");
    await expect(updated).toContainText("MP3 · Excl.");
    await expect(updated).toContainText("SOLD");
  });

  test("borrar con AlertDialog", async ({ page }) => {
    await page.goto("/admin/dashboard/beats");
    const row = page.getByRole("row").filter({ hasText: edited });
    await row.getByRole("button", { name: "Borrar" }).click();
    const alert = page.getByRole("alertdialog", { name: /borrar este beat/i });
    await expect(alert).toContainText(edited);
    await alert.getByRole("button", { name: "Borrar" }).click();
    await expectToast(page, "Beat borrado");
    await expect(page.getByRole("row").filter({ hasText: edited })).toHaveCount(0, { timeout: 20_000 });
  });
});
