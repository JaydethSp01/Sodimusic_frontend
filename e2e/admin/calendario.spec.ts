import { test, expect, ADMIN_STORAGE_STATE, API_URL, dateKey, expectToast, futureBookingDate, standaloneAdminApi } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });
test.describe.configure({ mode: "serial" });

test.describe("Admin · Calendario (bloqueos de fechas)", () => {
  // Día hábil dentro de ~3 semanas, sin sesiones (comprobado por API) para poder bloquearlo.
  let target = futureBookingDate(20);
  let key = dateKey(target);

  test.beforeAll(async () => {
    const { api, dispose } = await standaloneAdminApi();
    try {
      for (let offset = 20; offset < 60; offset++) {
        target = futureBookingDate(offset);
        key = dateKey(target);
        const month = key.slice(0, 7);
        const cal = await api.get<{ days: { date: string; blocked: boolean; slots: Record<string, string> }[]; blocked: { id: string; dateKey: string }[] }>(
          `/api/admin/calendar?month=${month}`,
        );
        const day = cal.days.find((d) => d.date === key);
        const free = day && !day.blocked && Object.values(day.slots).every((s) => s === "FREE");
        const noBlocks = !cal.blocked.some((b) => b.dateKey === key);
        if (free && noBlocks) return;
      }
      throw new Error("No hay un día libre para la prueba de bloqueo");
    } finally {
      await dispose();
    }
  });

  test.afterAll(async () => {
    const { api, dispose } = await standaloneAdminApi();
    try {
      const cal = await api.get<{ blocked: { id: string; dateKey: string }[] }>(`/api/admin/calendar?month=${key.slice(0, 7)}`);
      for (const b of cal.blocked.filter((x) => x.dateKey === key)) await api.delete(`/api/admin/blocked-dates/${b.id}`);
    } finally {
      await dispose();
    }
  });

  test("bloquear una franja y el día completo desde el detalle; el booking público lo refleja", async ({ page, request }) => {
    await page.goto(`/admin/dashboard/calendar?month=${key.slice(0, 7)}`);
    await expect(page.getByRole("heading", { name: /calendario del estudio/i })).toBeVisible();
    const dayNumber = String(Number(key.slice(8, 10)));
    const cell = page.locator("button:not([disabled])").filter({ has: page.locator(`span.font-mono:text-is("${dayNumber}")`) }).first();
    await cell.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/^Mañana/)).toBeVisible();

    await dialog.getByRole("button", { name: /bloquear esta franja/i }).first().click();
    await expectToast(page, /franja bloqueada/i);
    await expect(dialog.getByRole("button", { name: /desbloquear franja/i })).toBeVisible();
    const avail = (await (await request.get(`${API_URL}/api/booking/availability?date=${key}`)).json()) as { occupied: string[]; blocked: boolean };
    expect(avail.occupied).toContain("morning");
    expect(avail.blocked).toBe(false);

    await dialog.getByLabel(/motivo opcional/i).fill("Bloqueo e2e");
    await dialog.getByRole("button", { name: /bloquear día completo/i }).click();
    await expectToast(page, /día bloqueado/i);
    await expect(dialog).toBeHidden();
    const blocks = page.getByRole("heading", { name: "Bloqueos del mes" }).locator("xpath=following-sibling::ul");
    await expect(blocks).toContainText("Día completo");
    await expect(blocks).toContainText("Bloqueo e2e");
    const availDay = (await (await request.get(`${API_URL}/api/booking/availability?date=${key}`)).json()) as { blocked: boolean; occupied: string[] };
    expect(availDay.blocked).toBe(true);
    expect(availDay.occupied).toHaveLength(3);
    const publicBlocked = (await (await request.get(`${API_URL}/api/blocked-dates?from=${key}&to=${key}`)).json()) as { items: { scope: string }[] };
    expect(publicBlocked.items.map((b) => b.scope)).toEqual(["DAY"]);
  });

  test("desbloquear desde la lista de bloqueos", async ({ page, request }) => {
    await page.goto(`/admin/dashboard/calendar?month=${key.slice(0, 7)}`);
    const blocks = page.getByRole("heading", { name: "Bloqueos del mes" }).locator("xpath=following-sibling::ul");
    const item = blocks.getByRole("listitem").filter({ hasText: "Bloqueo e2e" });
    await expect(item).toBeVisible();
    await item.getByRole("button", { name: /desbloquear/i }).click();
    await expectToast(page, /bloqueo eliminado/i);
    await expect(blocks.getByRole("listitem").filter({ hasText: "Bloqueo e2e" })).toHaveCount(0);
    const avail = (await (await request.get(`${API_URL}/api/booking/availability?date=${key}`)).json()) as { blocked: boolean };
    expect(avail.blocked).toBe(false);
  });
});
