import { test, expect, ADMIN_STORAGE_STATE, API_URL, PNG_1X1, expectToast } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });

test.describe("Admin · subida de imágenes", () => {
  test("subir un PNG 1×1 en el gestor de canales y que la URL resultante se sirva (200 image/png)", async ({ page, request }) => {
    await page.goto("/admin/dashboard/canales");
    await page.getByRole("button", { name: /nuevo canal/i }).click();
    const dialog = page.getByRole("dialog", { name: "Crear canal" });
    await expect(dialog.getByLabel("Avatar")).toHaveValue("");

    await dialog.locator("input[type='file']").setInputFiles({ name: "e2e-1x1.png", mimeType: "image/png", buffer: PNG_1X1 });
    await expectToast(page, /imagen subida/i);
    const urlInput = dialog.getByLabel("Avatar");
    await expect(urlInput).toHaveValue(/^(https?:\/\/|\/uploads\/).+\.png$/i);
    const value = await urlInput.inputValue();
    const absolute = value.startsWith("http") ? value : `${API_URL}${value}`;

    const res = await request.get(absolute);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^image\/png/);
    const body = await res.body();
    expect(body.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");

    // La previsualización usa la misma URL y el botón «Quitar» la limpia.
    const path = new URL(absolute).pathname;
    await expect(dialog.locator("img").first()).toHaveAttribute("src", new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
    await dialog.getByRole("button", { name: "Quitar" }).click();
    await expect(urlInput).toHaveValue("");
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(dialog).toBeHidden();
  });

  test("tipos no admitidos se rechazan con mensaje", async ({ page }) => {
    await page.goto("/admin/dashboard/canales");
    await page.getByRole("button", { name: /nuevo canal/i }).click();
    const dialog = page.getByRole("dialog", { name: "Crear canal" });
    await dialog.locator("input[type='file']").setInputFiles({ name: "nota.txt", mimeType: "text/plain", buffer: Buffer.from("hola") });
    await expectToast(page, /formato no admitido/i);
    await expect(dialog.getByLabel("Avatar")).toHaveValue("");
  });
});
