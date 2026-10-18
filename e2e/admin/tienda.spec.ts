import { test, expect, ADMIN_STORAGE_STATE, expectToast, fieldByLabel, fieldInputNear, standaloneAdminApi, uniq } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });
test.describe.configure({ mode: "serial" });

const IMAGE_URL = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop";

test.describe("Admin · Tienda (CRUD de productos por UI)", () => {
  const name = uniq("E2E Camiseta");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const edited = `${name} v2`;

  test.afterAll(async () => {
    const { api, dispose } = await standaloneAdminApi();
    try {
      const data = await api.get<{ items: { id: string; name: string }[] }>("/api/admin/products");
      for (const p of data.items.filter((x) => x.name.startsWith(name))) await api.delete(`/api/admin/products/${p.id}`);
    } finally {
      await dispose();
    }
  });

  test("crear activo con imagen, tallas y precio anterior", async ({ page }) => {
    await page.goto("/admin/dashboard/tienda");
    await page.getByRole("button", { name: /nuevo producto/i }).click();
    const dialog = page.getByRole("dialog", { name: "Crear producto" });
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, /el nombre es obligatorio/i);

    await fieldByLabel(dialog, "Nombre").fill(name);
    await expect(fieldInputNear(dialog, "Slug (URL)")).toHaveValue(slug);
    await fieldByLabel(dialog, "Descripción").fill("Producto de prueba automatizada.");
    await fieldByLabel(dialog, "Precio COP").fill("80000");
    await fieldByLabel(dialog, "Precio anterior (opcional)").fill("70000");
    await fieldByLabel(dialog, "Categoría").fill("E2E");
    await fieldByLabel(dialog, "Tallas (separadas por coma)").fill("S, M, L");
    await fieldByLabel(dialog, "Stock").fill("3");
    await fieldByLabel(dialog, "Estado").selectOption("ACTIVE");
    // Validaciones: precio anterior debe ser mayor y un producto activo necesita imagen.
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, /precio anterior debe ser mayor/i);
    await fieldByLabel(dialog, "Precio anterior (opcional)").fill("95000");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, /al menos una imagen/i);
    await dialog.getByPlaceholder("https://… o /uploads/…").fill(IMAGE_URL);
    await dialog.getByRole("button", { name: "Añadir URL" }).click();
    await expect(dialog.getByText("Portada", { exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Producto creado");

    const row = page.getByRole("row").filter({ hasText: name });
    await expect(row).toBeVisible({ timeout: 20_000 });
    await expect(row).toContainText(`/${slug}`);
    await expect(row).toContainText("E2E");
    await expect(row).toContainText("Activo");
    await expect(row.getByRole("link", { name: /ver en la tienda/i })).toHaveAttribute("href", `/tienda/${slug}`);
  });

  test("el detalle público muestra tallas, «Antes» y «IVA incluido»", async ({ page }) => {
    const res = await page.goto(`/tienda/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: name })).toBeVisible();
    await expect(page.getByText(/^Antes/).first()).toContainText("$ 95.000");
    await expect(page.getByText("$ 80.000", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/COP · IVA incluido/)).toBeVisible();
    const sizes = page.getByRole("group", { name: "Talla" });
    await expect(sizes.getByRole("button")).toHaveCount(3);
    await expect(page.getByText(/quedan 3 unidades/i)).toBeVisible();
  });

  test("editar: renombrar, destacar desde la tabla y pasar a borrador", async ({ page }) => {
    await page.goto("/admin/dashboard/tienda");
    const row = page.getByRole("row").filter({ hasText: name });
    await row.getByRole("checkbox", { name: "Marcar destacado" }).click();
    await expectToast(page, /marcado como destacado/i);
    await expect(page.getByRole("row").filter({ hasText: name }).getByRole("checkbox", { name: "Quitar destacado" })).toBeVisible();

    await page.getByRole("row").filter({ hasText: name }).getByRole("button", { name: "Editar" }).click();
    const dialog = page.getByRole("dialog", { name: "Editar producto" });
    await expect(fieldByLabel(dialog, "Nombre")).toHaveValue(name);
    await fieldByLabel(dialog, "Nombre").fill(edited);
    await fieldByLabel(dialog, "Estado").selectOption("DRAFT");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Producto actualizado");
    const updated = page.getByRole("row").filter({ hasText: edited });
    await expect(updated).toContainText("Borrador");
    await expect(updated.getByRole("link", { name: /ver en la tienda/i })).toHaveCount(0);
    // En borrador no se sirve al público.
    const res = await page.goto(`/tienda/${slug}`);
    expect(res?.status()).toBe(404);
  });

  test("borrar con AlertDialog", async ({ page }) => {
    await page.goto("/admin/dashboard/tienda");
    const row = page.getByRole("row").filter({ hasText: edited });
    await row.getByRole("button", { name: "Borrar" }).click();
    const alert = page.getByRole("alertdialog", { name: /borrar este producto/i });
    await expect(alert).toContainText(edited);
    await alert.getByRole("button", { name: "Borrar" }).click();
    await expectToast(page, "Producto borrado");
    await expect(page.getByRole("row").filter({ hasText: edited })).toHaveCount(0, { timeout: 20_000 });
  });
});
