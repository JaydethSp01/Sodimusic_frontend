import { test, expect, ADMIN_STORAGE_STATE, API_URL, cleanup, expectToast, uniqEmail } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });

test.describe("Admin · Mensajes", () => {
  const emails: string[] = [];
  test.afterEach(() => {
    for (const e of emails.splice(0)) {
      cleanup.contactMessagesByEmail(e);
      cleanup.beatInterestsByEmail(e);
    }
  });

  test("marcar leído, archivar y reabrir un mensaje de contacto", async ({ page, request }) => {
    const email = uniqEmail("e2e-msg");
    emails.push(email);
    const created = await request.post(`${API_URL}/api/contact/messages`, {
      data: {
        subject: "COLABORACION",
        name: "E2E Mensajes",
        email,
        message: "Mensaje creado por la suite e2e para probar el CRM.",
        policyAccepted: true,
        policyVersion: "2026-10-17",
      },
    });
    expect(created.status()).toBe(201);

    await page.goto("/admin/dashboard/mensajes");
    await expect(page.getByRole("heading", { level: 1, name: /^mensajes$/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /contacto/i })).toHaveAttribute("aria-selected", "true");
    const card = page.getByRole("listitem").filter({ hasText: email });
    await expect(card).toBeVisible();
    await expect(card).toContainText("Nuevo");
    await expect(card).toContainText("Colaboración");

    await card.getByRole("button", { name: /marcar leído/i }).click();
    await expectToast(page, /marcado como leído/i);
    await expect(card).toContainText("Leído");
    await expect(card.getByRole("button", { name: /marcar leído/i })).toHaveCount(0);

    await card.getByRole("button", { name: /archivar/i }).click();
    await expectToast(page, /mensaje archivado/i);
    await expect(card).toContainText("Archivado");

    await card.getByRole("button", { name: /reabrir/i }).click();
    await expectToast(page, /mensaje reabierto/i);
    await expect(card).toContainText("Nuevo");

    // Filtros por estado por URL.
    await page.getByRole("group", { name: "Filtrar por estado" }).getByRole("link", { name: "Archivados" }).click();
    await expect(page).toHaveURL(/status=ARCHIVED/);
    await expect(page.getByRole("listitem").filter({ hasText: email })).toHaveCount(0);
  });

  test("pestaña Beats lista los intereses y permite buscar", async ({ page, request }) => {
    const email = uniqEmail("e2e-interest");
    emails.push(email);
    const beats = (await (await request.get(`${API_URL}/api/beats?pageSize=1`)).json()) as { items: { id: string; title: string }[] };
    expect(beats.items.length).toBeGreaterThan(0);
    const created = await request.post(`${API_URL}/api/contact/beat-interest`, {
      data: {
        beatId: beats.items[0].id,
        artistName: "E2E Interest",
        email,
        phone: "+573001234567",
        licenseType: "WAV",
        exclusiveIntent: false,
        policyAccepted: true,
        policyVersion: "2026-10-17",
        marketingOptIn: true,
      },
    });
    expect(created.status()).toBe(201);

    await page.goto("/admin/dashboard/mensajes?tab=beats");
    await expect(page.getByRole("tab", { name: /beats/i })).toHaveAttribute("aria-selected", "true");
    await page.getByLabel(/buscar por beat, artista o correo/i).fill(email);
    await page.getByRole("search").getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(email)}`));
    const row = page.getByRole("row").filter({ hasText: email });
    await expect(row).toBeVisible({ timeout: 20_000 });
    await expect(row).toContainText(beats.items[0].title);
    await expect(row).toContainText("WAV");
    await expect(row).toContainText("Sí");
    await expect(row.getByRole("link", { name: /responder por whatsapp/i })).toHaveAttribute("href", /^https:\/\/wa\.me\/573001234567\?text=/);
    await expect(page.getByText("Intereses en beats (1)")).toBeVisible();
  });
});
