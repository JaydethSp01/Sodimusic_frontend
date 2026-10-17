import { test, expect, ADMIN_STORAGE_STATE, API_URL, cleanup, uniqEmail } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });

test.describe("Admin · Suscriptores", () => {
  const emails: string[] = [];
  test.afterEach(() => {
    for (const e of emails.splice(0)) cleanup.subscriber(e);
  });

  test("búsqueda y exportación CSV con cabecera", async ({ page, request }) => {
    const email = uniqEmail("e2e-sub");
    emails.push(email);
    const res = await request.post(`${API_URL}/api/newsletter/subscribe`, {
      data: { email, name: "E2E Suscriptor", source: "e2e", policyAccepted: true, policyVersion: "2026-10-17" },
    });
    expect(res.status()).toBe(201);

    await page.goto("/admin/dashboard/suscriptores");
    await expect(page.getByRole("heading", { level: 1, name: /^suscriptores$/i })).toBeVisible();
    await page.getByLabel(/buscar por correo o nombre/i).fill(email);
    await page.getByRole("search").getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(email)}`));
    const row = page.getByRole("row").filter({ hasText: email });
    await expect(row).toBeVisible({ timeout: 20_000 });
    await expect(row).toContainText("E2E Suscriptor");
    await expect(row).toContainText("Activo");
    await expect(row).toContainText("e2e");
    await expect(page.getByText("Suscriptores (1)")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /exportar csv/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
    const path = await download.path();
    expect(path).toBeTruthy();
    const content = (await import("node:fs")).readFileSync(path as string, "utf8");
    const [header, ...lines] = content.split("\n");
    expect(header).toBe("email,name,source,policyVersion,policyAcceptedAt,unsubscribedAt,createdAt");
    expect(lines.some((l) => l.includes(`"${email}"`))).toBe(true);
    await expect(page.locator("[data-sonner-toast]").filter({ hasText: /csv descargado/i })).toBeVisible();
  });
});
