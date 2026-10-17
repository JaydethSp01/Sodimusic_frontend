import { test, expect, ADMIN_STORAGE_STATE, API_URL, expectToast, fieldByLabel, standaloneAdminApi, uniq } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });
test.describe.configure({ mode: "serial" });

const CHANNEL_ID = "UCbCYvwiAsoIdumPbFBe1x6A"; // formato UC + 22 caracteres (canal real de Sodimusic)

test.describe("Admin · Canales (CRUD por UI)", () => {
  const token = uniq("E2E Canal");
  const nameA = `${token} A`;
  const nameB = `${token} B`;
  const edited = `${token} A editado`;

  test.afterAll(async () => {
    const { api, dispose } = await standaloneAdminApi();
    try {
      const data = await api.get<{ items: { id: string; name: string }[] }>(`/api/admin/channels?q=${encodeURIComponent(token)}&pageSize=200`);
      for (const c of data.items) await api.delete(`/api/admin/channels/${c.id}`);
    } finally {
      await dispose();
    }
  });

  test("crear: la URL autodetecta el channelId y el canal aparece en la tabla", async ({ page }) => {
    await page.goto("/admin/dashboard/canales");
    await expect(page.getByRole("heading", { name: /canales de youtube/i })).toBeVisible();
    await page.getByRole("button", { name: /nuevo canal/i }).click();
    const dialog = page.getByRole("dialog", { name: "Crear canal" });
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, /el nombre es obligatorio/i);
    await fieldByLabel(dialog, "Nombre").fill(nameA);
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, /url válida de youtube/i);

    const url = fieldByLabel(dialog, "URL del canal");
    await url.fill("https://example.com/no-youtube");
    await expect(dialog.getByText(/no parece una url de youtube/i)).toBeVisible();
    await url.fill("https://www.youtube.com/@sodimusic");
    await expect(dialog.getByText(/handle:/i)).toContainText("@sodimusic");
    await url.fill(`https://www.youtube.com/channel/${CHANNEL_ID}`);
    await expect(dialog.getByText(/channelId:/i)).toContainText(CHANNEL_ID);
    await expect(dialog.getByText(/lista de subidas disponible/i)).toBeVisible();

    await fieldByLabel(dialog, "Descripción").fill("Canal creado por la suite e2e");
    await fieldByLabel(dialog, "Categoría").fill("E2E");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Canal creado");
    await expect(dialog).toBeHidden();

    const row = page.getByRole("row").filter({ hasText: nameA });
    await expect(row).toBeVisible({ timeout: 20_000 });
    await expect(row).toContainText(CHANNEL_ID);
    await expect(row).toContainText("E2E");
    await expect(row).toContainText("Activo");
    await expect(row.getByRole("link", { name: /youtube/i })).toHaveAttribute("href", `https://www.youtube.com/channel/${CHANNEL_ID}`);

    // Segundo canal para probar el orden.
    await page.getByRole("button", { name: /nuevo canal/i }).click();
    const dialog2 = page.getByRole("dialog", { name: "Crear canal" });
    await fieldByLabel(dialog2, "Nombre").fill(nameB);
    await fieldByLabel(dialog2, "URL del canal").fill("https://www.youtube.com/@e2e-canal-b");
    await fieldByLabel(dialog2, "Categoría").fill("E2E");
    await dialog2.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Canal creado");
    await expect(page.getByRole("row").filter({ hasText: nameB })).toBeVisible();
  });

  test("destacado y subir/bajar orden", async ({ page, request }) => {
    await page.goto(`/admin/dashboard/canales?q=${encodeURIComponent(token)}`);
    const rowA = page.getByRole("row").filter({ hasText: nameA });
    await rowA.getByRole("checkbox", { name: "Marcar destacado" }).click();
    await expectToast(page, /marcado como destacado/i);
    await expect(page.getByRole("row").filter({ hasText: nameA }).getByRole("checkbox", { name: "Quitar destacado" })).toBeVisible();
    const pub = (await (await request.get(`${API_URL}/api/channels?featured=1&q=${encodeURIComponent(token)}`)).json()) as { items: { name: string }[] };
    expect(pub.items.map((c) => c.name)).toContain(nameA);

    const rowIndex = async (name: string) => {
      const rows = await page.locator("table tbody tr").allInnerTexts();
      return rows.findIndex((t) => t.includes(name));
    };
    const idxA = await rowIndex(nameA);
    const idxB = await rowIndex(nameB);
    expect(idxA, "fila de A").toBeGreaterThanOrEqual(0);
    expect(idxB, "fila de B").toBeGreaterThanOrEqual(0);
    const upper = idxA < idxB ? nameA : nameB;
    const lower = idxA < idxB ? nameB : nameA;
    await page.getByRole("button", { name: `Bajar ${upper}` }).click();
    await expectToast(page, /orden actualizado/i);
    await expect.poll(async () => (await rowIndex(lower)) < (await rowIndex(upper)) && (await rowIndex(lower)) >= 0, { timeout: 20_000 }).toBe(true);
    await page.getByRole("button", { name: `Subir ${upper}` }).click();
    await expectToast(page, /orden actualizado/i);
    await expect.poll(async () => (await rowIndex(upper)) < (await rowIndex(lower)) && (await rowIndex(upper)) >= 0, { timeout: 20_000 }).toBe(true);
  });

  test("editar y poner en HIDDEN: desaparece de /canales", async ({ page, request }) => {
    await page.goto(`/admin/dashboard/canales?q=${encodeURIComponent(token)}`);
    await page.getByRole("row").filter({ hasText: nameA }).getByRole("button", { name: "Editar" }).click();
    const dialog = page.getByRole("dialog", { name: "Editar canal" });
    await expect(fieldByLabel(dialog, "Nombre")).toHaveValue(nameA);
    await fieldByLabel(dialog, "Nombre").fill(edited);
    await fieldByLabel(dialog, "Estado").selectOption("HIDDEN");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Canal actualizado");
    const row = page.getByRole("row").filter({ hasText: edited });
    await expect(row).toContainText("Oculto");

    const pub = (await (await request.get(`${API_URL}/api/channels?q=${encodeURIComponent(token)}`)).json()) as { items: { name: string }[] };
    expect(pub.items.map((c) => c.name)).not.toContain(edited);
    expect(pub.items.map((c) => c.name)).toContain(nameB);

    await page.goto(`/canales?q=${encodeURIComponent(token)}`);
    const list = page.getByRole("region", { name: "Listado de canales" });
    await expect(list.getByRole("heading", { level: 3, name: nameB })).toBeVisible();
    await expect(list.getByRole("heading", { level: 3, name: edited })).toHaveCount(0);

    // El filtro de estado del admin también lo lista como oculto.
    await page.goto(`/admin/dashboard/canales?q=${encodeURIComponent(token)}`);
    await page.getByLabel("Estado").selectOption("HIDDEN");
    await expect(page).toHaveURL(/status=HIDDEN/);
    await expect(page.getByRole("row").filter({ hasText: edited })).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: nameB })).toHaveCount(0, { timeout: 20_000 });
  });

  test("borrar con AlertDialog (cancelar y confirmar)", async ({ page }) => {
    await page.goto(`/admin/dashboard/canales?q=${encodeURIComponent(token)}`);
    const row = page.getByRole("row").filter({ hasText: edited });
    await row.getByRole("button", { name: "Borrar" }).click();
    const alert = page.getByRole("alertdialog", { name: /borrar este canal/i });
    await expect(alert).toContainText(edited);
    await alert.getByRole("button", { name: "Cancelar" }).click();
    await expect(alert).toBeHidden();
    await expect(page.getByRole("row").filter({ hasText: edited })).toBeVisible();
    await row.getByRole("button", { name: "Borrar" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Borrar" }).click();
    await expectToast(page, "Canal borrado");
    await expect(page.getByRole("row").filter({ hasText: edited })).toHaveCount(0, { timeout: 20_000 });

    await page.getByRole("row").filter({ hasText: nameB }).getByRole("button", { name: "Borrar" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Borrar" }).click();
    await expectToast(page, "Canal borrado");
    await expect(page.getByRole("row").filter({ hasText: nameB })).toHaveCount(0, { timeout: 20_000 });
  });
});
