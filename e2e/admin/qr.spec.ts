import { readFileSync } from "node:fs";
import { test, expect, ADMIN_STORAGE_STATE } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });

test.describe("Admin · Código QR", () => {
  test("vista previa, validación de URL y descarga de PNG", async ({ page }) => {
    await page.goto("/admin/dashboard/qr");
    await expect(page.getByRole("heading", { name: /estudio de código qr/i })).toBeVisible();
    const preview = page.getByRole("img", { name: /código qr hacia/i });
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute("src", /\/api\/qr\?.*format=svg/);

    const url = page.getByPlaceholder(/^https?:\/\//).first();
    await url.fill("no-es-una-url");
    await expect(page.getByText(/escribe una url completa/i)).toBeVisible();
    await url.fill("https://sodimusic.com/beats");
    await expect(page.getByRole("paragraph").filter({ hasText: "https://sodimusic.com/beats" })).toBeVisible();

    await page.getByRole("button", { name: "Naranja Sodimusic" }).click();
    await expect(page.getByRole("img", { name: /código qr hacia/i })).toHaveAttribute("src", /fg=ff6b00/);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: /descargar png/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("sodimusic-qr.png");
    const bytes = readFileSync((await download.path()) as string);
    expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(bytes.byteLength).toBeGreaterThan(500);
    await expect(page.getByRole("link", { name: /descargar svg/i })).toHaveAttribute("href", /format=svg/);
  });
});
