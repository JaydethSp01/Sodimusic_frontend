import { test, expect, ADMIN_STORAGE_STATE, API_URL, expectToast, fieldByLabel, standaloneAdminApi, uniq } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });
test.describe.configure({ mode: "serial" });

async function artistsApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/artists`);
    return res.status !== 404;
  } catch {
    return false;
  }
}

/** CRUD por UI, no destructivo sobre los artistas sembrados: crea «E2E Artista-…» y los borra al final. */
test.describe("Admin · Artistas (CRUD por UI)", () => {
  const token = uniq("E2E Artista");
  const nameA = `${token} A`;
  const nameB = `${token} B`;
  const edited = `${token} A editado`;
  let available = false;

  test.beforeAll(async () => {
    available = await artistsApiAvailable();
  });

  test.afterAll(async () => {
    if (!available) return;
    const { api, dispose } = await standaloneAdminApi();
    try {
      const data = await api.get<{ items: { id: string; name: string }[] } | { id: string; name: string }[]>(
        `/api/admin/artists?q=${encodeURIComponent(token)}`,
      );
      const items = Array.isArray(data) ? data : data.items;
      for (const a of items) if (a.name.startsWith(token)) await api.delete(`/api/admin/artists/${a.id}`);
    } finally {
      await dispose();
    }
  });

  test("crear: validación, slug automático y aparece en la tabla", async ({ page }) => {
    test.skip(!available, "La API /api/artists aún no está desplegada");
    await page.goto("/admin/dashboard/artistas");
    await expect(page.getByRole("heading", { level: 1, name: "Artistas" })).toBeVisible();
    await page.getByRole("button", { name: /nuevo artista/i }).click();
    const dialog = page.getByRole("dialog", { name: "Crear artista" });
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, /el nombre es obligatorio/i);

    await fieldByLabel(dialog, "Nombre").fill(nameA);
    await expect(fieldByLabel(dialog, "Slug")).toHaveValue(/^e2e-artista-/);
    await fieldByLabel(dialog, "Spotify").fill("no-es-url");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, /la url de spotify no es válida/i);
    await fieldByLabel(dialog, "Spotify").fill("https://open.spotify.com/artist/4q3ewBCX7sLwd24euuV69X");
    await fieldByLabel(dialog, "Rol").fill("Crew");
    await fieldByLabel(dialog, "Ciudad").fill("Medellín");
    await fieldByLabel(dialog, "Géneros").fill("Trap, Afrobeat");
    await fieldByLabel(dialog, "Alias").fill(`${token} alias`);
    await fieldByLabel(dialog, "Bio corta").fill("Artista creado por la suite e2e.");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Artista creado");
    await expect(dialog).toBeHidden();

    const row = page.getByRole("row").filter({ hasText: nameA });
    await expect(row).toBeVisible({ timeout: 20_000 });
    await expect(row).toContainText("Crew");
    await expect(row).toContainText("Medellín");
    await expect(row).toContainText("Activo");
    await expect(row.getByRole("link", { name: `Ver ficha de ${nameA}` })).toHaveAttribute("href", /^\/artists\/e2e-artista-/);

    // Segundo artista para probar el orden.
    await page.getByRole("button", { name: /nuevo artista/i }).click();
    const dialog2 = page.getByRole("dialog", { name: "Crear artista" });
    await fieldByLabel(dialog2, "Nombre").fill(nameB);
    await dialog2.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Artista creado");
    await expect(page.getByRole("row").filter({ hasText: nameB })).toBeVisible();
  });

  test("destacado y subir/bajar orden", async ({ page, request }) => {
    test.skip(!available, "La API /api/artists aún no está desplegada");
    await page.goto(`/admin/dashboard/artistas?q=${encodeURIComponent(token)}`);
    const rowA = page.getByRole("row").filter({ hasText: nameA });
    await rowA.getByRole("checkbox", { name: "Marcar destacado" }).click();
    await expectToast(page, /marcado como destacado/i);
    await expect(page.getByRole("row").filter({ hasText: nameA }).getByRole("checkbox", { name: "Quitar destacado" })).toBeVisible();
    const pub = (await (await request.get(`${API_URL}/api/artists?featured=1`)).json()) as { items: { name: string }[] };
    expect(pub.items.map((a) => a.name)).toContain(nameA);

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

  test("editar y poner en HIDDEN: desaparece de /artists y su ficha da 404", async ({ page, request }) => {
    test.skip(!available, "La API /api/artists aún no está desplegada");
    await page.goto(`/admin/dashboard/artistas?q=${encodeURIComponent(token)}`);
    await page.getByRole("row").filter({ hasText: nameA }).getByRole("button", { name: "Editar" }).click();
    const dialog = page.getByRole("dialog", { name: "Editar artista" });
    await expect(fieldByLabel(dialog, "Nombre")).toHaveValue(nameA);
    const slug = await fieldByLabel(dialog, "Slug").inputValue();
    await fieldByLabel(dialog, "Nombre").fill(edited);
    await fieldByLabel(dialog, "Estado").selectOption("HIDDEN");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Artista actualizado");
    const row = page.getByRole("row").filter({ hasText: edited });
    await expect(row).toContainText("Oculto");

    const pub = (await (await request.get(`${API_URL}/api/artists`)).json()) as { items: { name: string }[] };
    expect(pub.items.map((a) => a.name)).not.toContain(edited);
    expect(pub.items.map((a) => a.name)).toContain(nameB);
    expect((await request.get(`${API_URL}/api/artists/${slug}`)).status()).toBe(404);

    await page.goto("/artists");
    const grid = page.getByRole("list", { name: "Artistas del sello" });
    await expect(grid.locator("article").filter({ hasText: nameB })).toHaveCount(1);
    await expect(grid.locator("article").filter({ hasText: edited })).toHaveCount(0);

    await page.goto(`/admin/dashboard/artistas?q=${encodeURIComponent(token)}`);
    await page.getByLabel("Estado").selectOption("HIDDEN");
    await expect(page).toHaveURL(/status=HIDDEN/);
    await expect(page.getByRole("row").filter({ hasText: edited })).toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: nameB })).toHaveCount(0, { timeout: 20_000 });
  });

  test("borrar con AlertDialog (cancelar y confirmar)", async ({ page }) => {
    test.skip(!available, "La API /api/artists aún no está desplegada");
    await page.goto(`/admin/dashboard/artistas?q=${encodeURIComponent(token)}`);
    const row = page.getByRole("row").filter({ hasText: edited });
    await row.getByRole("button", { name: "Borrar" }).click();
    const alert = page.getByRole("alertdialog", { name: /borrar este artista/i });
    await expect(alert).toContainText(edited);
    await alert.getByRole("button", { name: "Cancelar" }).click();
    await expect(alert).toBeHidden();
    await expect(page.getByRole("row").filter({ hasText: edited })).toBeVisible();
    await row.getByRole("button", { name: "Borrar" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Borrar" }).click();
    await expectToast(page, "Artista borrado");
    await expect(page.getByRole("row").filter({ hasText: edited })).toHaveCount(0, { timeout: 20_000 });

    await page.getByRole("row").filter({ hasText: nameB }).getByRole("button", { name: "Borrar" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Borrar" }).click();
    await expectToast(page, "Artista borrado");
    await expect(page.getByRole("row").filter({ hasText: nameB })).toHaveCount(0, { timeout: 20_000 });
  });
});
