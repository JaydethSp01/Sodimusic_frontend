import { test, expect, ADMIN_STORAGE_STATE, cleanup, dateKey, expectToast, futureBookingDate, standaloneAdminApi, uniqEmail } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });

test.describe("Admin · Sesiones", () => {
  const email = uniqEmail("e2e-session");
  const artist = `E2E Sesión ${email.slice(4, 12)}`;
  let sessionId = "";

  test.beforeAll(async () => {
    const { api, dispose } = await standaloneAdminApi();
    try {
      // Busca una franja libre entre +25 y +60 días.
      for (let offset = 25; offset < 60; offset++) {
        const d = futureBookingDate(offset);
        const key = dateKey(d);
        const res = await api.raw("POST", "/api/admin/sessions", {
          serviceType: "MIX_MASTER",
          artistName: artist,
          artistEmail: email,
          artistPhone: "+573000000000",
          musicReference: "https://open.spotify.com/track/e2e",
          genres: "Trap",
          scheduledDate: key,
          timeSlot: "night",
          isFirstTime: true,
        });
        if (res.ok()) {
          sessionId = ((await res.json()) as { id: string }).id;
          return;
        }
      }
      throw new Error("No se pudo crear la sesión de prueba");
    } finally {
      await dispose();
    }
  });

  test.afterAll(() => {
    cleanup.bookingSessionsByEmail(email);
  });

  test("cambiar estado desde la tabla, ver briefing y filtrar", async ({ page, adminApi }) => {
    await page.goto("/admin/dashboard/sessions?status=PENDING");
    await expect(page.getByRole("heading", { level: 1, name: /^sesiones$/i })).toBeVisible();
    const row = page.getByRole("row").filter({ hasText: artist });
    await expect(row).toBeVisible({ timeout: 20_000 });
    await expect(row).toContainText("Mezcla y masterización");
    await expect(row).toContainText("Noche");

    const select = row.getByRole("combobox", { name: `Estado para ${artist}` });
    await expect(select).toContainText("Pendiente");
    await select.click();
    await page.getByRole("option", { name: "Confirmada" }).click();
    await expectToast(page, /estado actualizado/i);
    await expect.poll(async () => {
      const data = await adminApi.get<{ items: { id: string; status: string; confirmedAt: string | null }[] }>("/api/admin/sessions?status=CONFIRMED");
      return data.items.find((s) => s.id === sessionId)?.status ?? null;
    }).toBe("CONFIRMED");

    // Con el filtro «Pendientes» ya no aparece; en «Confirmadas» sí.
    await page.goto("/admin/dashboard/sessions?status=PENDING");
    await expect(page.getByRole("row").filter({ hasText: artist })).toHaveCount(0, { timeout: 20_000 });
    await page.getByRole("link", { name: "Confirmadas" }).click();
    await expect(page).toHaveURL(/status=CONFIRMED/);
    const confirmed = page.getByRole("row").filter({ hasText: artist });
    await expect(confirmed).toBeVisible({ timeout: 20_000 });

    await confirmed.getByRole("button", { name: /ver briefing/i }).click();
    const dialog = page.getByRole("dialog", { name: new RegExp(`briefing — ${artist}`, "i") });
    await expect(dialog).toContainText(email);
    await expect(dialog.getByRole("link", { name: /spotify/i })).toHaveAttribute("href", "https://open.spotify.com/track/e2e");
    await dialog.getByRole("textbox").fill("Nota interna e2e");
    await dialog.getByRole("button", { name: /guardar notas/i }).click();
    await expectToast(page, /notas guardadas/i);
    const data = await adminApi.get<{ items: { id: string; internalNotes: string | null }[] }>("/api/admin/sessions?status=CONFIRMED");
    expect(data.items.find((s) => s.id === sessionId)?.internalNotes).toBe("Nota interna e2e");
  });
});
