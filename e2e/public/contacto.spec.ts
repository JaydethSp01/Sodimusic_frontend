import { test, expect, cleanup, createAdminApi, uniqEmail } from "../fixtures";

test.describe("Contacto y prensa", () => {
  const emails: string[] = [];
  test.afterEach(() => {
    for (const e of emails.splice(0)) cleanup.contactMessagesByEmail(e);
  });

  test("validación inline y envío que crea el mensaje en el CRM", async ({ page, request, isMobile }) => {
    test.skip(isMobile, "Envío real solo en escritorio: el backend limita los formularios públicos a 10 envíos / 10 min por IP");
    const email = uniqEmail("e2e-contacto");
    emails.push(email);
    await page.goto("/contacto");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/contacto/i);

    const form = page.locator("form").filter({ has: page.getByLabel("Asunto") });
    await form.getByRole("button", { name: /enviar mensaje/i }).click();
    await expect(form.getByRole("alert").filter({ hasText: /elige un asunto/i })).toBeVisible();
    await expect(form.getByRole("alert").filter({ hasText: /escribe tu nombre/i })).toBeVisible();
    await expect(form.getByRole("alert").filter({ hasText: /correo válido/i })).toBeVisible();
    await expect(form.getByRole("alert").filter({ hasText: /mínimo 10 caracteres/i })).toBeVisible();
    await expect(form.getByRole("alert").filter({ hasText: /revisa los campos/i })).toBeVisible();
    await expect(form.getByLabel("Asunto")).toHaveAttribute("aria-invalid", "true");
    await expect(form.getByLabel("Asunto")).toBeFocused();

    // El asunto es un grupo de chips (radiogroup accesible); el valor enviado sigue siendo el `value` del CMS.
    await form.getByRole("radiogroup", { name: "Asunto" }).getByRole("radio", { name: "Prensa y medios" }).click();
    await expect(form.getByRole("radio", { name: "Prensa y medios" })).toHaveAttribute("aria-checked", "true");
    await form.getByLabel("Nombre").fill("E2E Prensa");
    await form.getByLabel("Correo").fill(email);
    await form.getByLabel(/teléfono/i).fill("abc");
    await form.getByLabel("Mensaje").fill("Mensaje automatizado de prueba para el CRM.");
    await form.getByRole("button", { name: /enviar mensaje/i }).click();
    await expect(form.getByRole("alert").filter({ hasText: /teléfono válido/i })).toBeVisible();
    await form.getByLabel(/teléfono/i).fill("+57 300 000 0000");
    // Sin consentimiento → error del checkbox.
    await form.getByRole("button", { name: /enviar mensaje/i }).click();
    await expect(form.getByRole("alert").filter({ hasText: /autorización para responderte/i })).toBeVisible();

    await form.getByRole("checkbox", { name: /autorizo a/i }).check();
    await form.getByRole("button", { name: /enviar mensaje/i }).click();
    const status = page.getByRole("status").filter({ hasText: /mensaje enviado/i });
    await expect(status).toBeVisible({ timeout: 20_000 });
    await expect(status).toContainText(email);

    const api = await createAdminApi(request);
    const list = await api.get<{ items: { email: string; subject: string; status: string; name: string }[] }>(
      "/api/admin/messages?status=NEW&pageSize=100",
    );
    const row = list.items.find((m) => m.email === email);
    expect(row).toBeTruthy();
    expect(row!.subject).toBe("PRENSA");
    expect(row!.status).toBe("NEW");

    await status.getByRole("button", { name: /enviar otro mensaje/i }).click();
    await expect(page.locator("form").filter({ has: page.getByLabel("Asunto") })).toBeVisible();
  });

  test("asunto preseleccionado por query, contacto directo y kit de prensa con logo", async ({ page }) => {
    await page.goto("/contacto?asunto=DEMO");
    await expect(page.getByRole("radiogroup", { name: "Asunto" }).getByRole("radio", { name: "Enviar demo" })).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("input[name='subject']")).toHaveValue("DEMO");

    const direct = page.getByRole("region", { name: "Hablemos" });
    await expect(direct.getByRole("link", { name: /whatsapp/i })).toHaveAttribute("href", /^https:\/\/wa\.me\/\d+\?text=/);
    await expect(direct.getByRole("link", { name: /correo/i })).toHaveAttribute("href", /^mailto:/);

    const press = page.getByRole("region", { name: /kit de prensa/i });
    await expect(press).toBeVisible();
    const logo = press.getByRole("img", { name: /logo de/i });
    await expect(logo).toBeVisible();
    const natural = await logo.evaluate((img) => (img as HTMLImageElement).naturalWidth);
    expect(natural, "el logo del kit de prensa debe cargar").toBeGreaterThan(0);
    await expect(press.getByRole("link", { name: /descargar/i }).first()).toHaveAttribute("download", "");
  });
});
