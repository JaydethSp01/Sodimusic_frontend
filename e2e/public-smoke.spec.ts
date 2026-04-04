import { test, expect } from "@playwright/test";

test.describe("Humo público (regresión UI)", () => {
  test("inicio carga y muestra marca", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("beats, producciones, lanzamientos responden 200", async ({ page }) => {
    for (const path of ["/beats", "/productions", "/releases", "/booking", "/artists"]) {
      const res = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(res?.ok(), `${path} debe responder OK`).toBeTruthy();
    }
  });
});
