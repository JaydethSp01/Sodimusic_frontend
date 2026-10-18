import type { APIRequestContext, Page } from "@playwright/test";
import { test, expect, API_URL, cleanup, createAdminApi, dateKey, futureBookingDate, uniqEmail } from "../fixtures";

type Slot = "morning" | "afternoon" | "night";
const SLOT_LABEL: Record<Slot, string> = { morning: "Mañana", afternoon: "Tarde", night: "Noche" };

/** Busca un día hábil (≥ +4 días) sin bloqueo y con al menos una franja libre. */
async function findFreeDate(request: APIRequestContext): Promise<{ date: Date; slot: Slot }> {
  for (let offset = 4; offset < 40; offset++) {
    const d = futureBookingDate(offset);
    const key = dateKey(d);
    const res = await request.get(`${API_URL}/api/booking/availability?date=${key}`);
    const data = (await res.json()) as { occupied: string[]; blocked: boolean };
    if (data.blocked) continue;
    const free = (["morning", "afternoon", "night"] as Slot[]).find((s) => !data.occupied.includes(s));
    if (free) return { date: d, slot: free };
  }
  throw new Error("No se encontró una fecha libre para el booking");
}

async function pickCalendarDay(page: Page, date: Date): Promise<void> {
  const key = dateKey(date);
  const cell = page.locator(`td[data-day="${key}"] button, [data-day="${key}"]`).first();
  const today = new Date();
  const monthsAhead = (date.getFullYear() - today.getFullYear()) * 12 + (date.getMonth() - today.getMonth());
  for (let i = 0; i < monthsAhead; i++) {
    await page.locator("button.rdp-button_next, button[aria-label*='Next Month'], button[aria-label*='mes siguiente' i]").first().click();
  }
  await expect(cell).toBeVisible();
  await cell.click();
}

test.describe("Booking (wizard de 5 pasos)", () => {
  const emails: string[] = [];
  test.afterEach(() => {
    for (const e of emails.splice(0)) cleanup.bookingSessionsByEmail(e);
  });

  test("validaciones por paso, indicador, calendario, menor de edad, consentimiento y creación de sesión", async ({
    page,
    request,
    isMobile,
  }) => {
    test.skip(isMobile, "Envío real solo en escritorio: el backend limita los formularios públicos a 10 envíos / 10 min por IP");
    test.setTimeout(120_000);
    const email = uniqEmail("e2e-booking");
    emails.push(email);
    const { date, slot } = await findFreeDate(request);

    await page.goto("/booking");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/agenda tu sesión/i);
    const progress = page.getByRole("progressbar", { name: /paso 1 de 5/i });
    await expect(progress).toHaveAttribute("aria-valuenow", "1");
    if (isMobile) {
      await expect(page.getByText(/Paso\s*1\s*de 5/)).toBeVisible();
    } else {
      const steps = page.getByRole("list", { name: "Pasos de la reserva" });
      await expect(steps.getByRole("listitem")).toHaveCount(5);
      await expect(steps.getByRole("listitem").first()).toHaveAttribute("aria-current", "step");
    }

    // Paso 1: sin servicio → error inline.
    const next = page.getByRole("button", { name: "Siguiente", exact: true });
    await next.click();
    await expect(page.getByRole("alert").filter({ hasText: /elige al menos un servicio/i })).toBeVisible();
    const service = page.getByRole("button", { name: /grabación vocal/i });
    // Icono Lucide (svg) en vez de emoji, coherente con la portada.
    await expect(service.locator("svg").first()).toBeVisible();
    await service.click();
    await expect(service).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("p[role='alert']")).toHaveCount(0);
    await next.click();

    // Paso 2: validaciones inline por campo.
    await expect(page.getByRole("progressbar", { name: /paso 2 de 5/i })).toHaveAttribute("aria-valuenow", "2");
    await next.click();
    await expect(page.getByRole("alert").filter({ hasText: /nombre artístico/i })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: /al menos un género/i })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: /enlace de spotify/i })).toBeVisible();
    await expect(page.getByLabel("¿Cómo te llaman?")).toHaveAttribute("aria-invalid", "true");
    await page.getByLabel("¿Cómo te llaman?").fill("E2E Artista");
    await page.getByRole("group", { name: "Géneros" }).getByRole("button").first().click();
    await page.getByLabel(/a qué artista o canción/i).fill("https://example.com/no-valido");
    await next.click();
    await expect(page.getByRole("alert").filter({ hasText: /spotify, youtube o soundcloud/i })).toBeVisible();
    await page.getByLabel(/a qué artista o canción/i).fill("https://open.spotify.com/track/e2e");
    await page.getByLabel(/visión para esta sesión/i).fill("Sesión de prueba automatizada");
    await next.click();

    // Paso 3: fecha y franja.
    await expect(page.getByRole("progressbar", { name: /paso 3 de 5/i })).toHaveAttribute("aria-valuenow", "3");
    await next.click();
    await expect(page.getByRole("alert").filter({ hasText: /elige una fecha/i })).toBeVisible();
    await pickCalendarDay(page, date);
    const slots = page.getByRole("radiogroup", { name: "Horarios" });
    await expect(slots).toBeVisible();
    await next.click();
    await expect(page.getByRole("alert").filter({ hasText: /elige un horario/i })).toBeVisible();
    await slots.getByRole("radio", { name: new RegExp(`^${SLOT_LABEL[slot]}`) }).click();
    await expect(slots.getByRole("radio", { name: new RegExp(`^${SLOT_LABEL[slot]}`) })).toHaveAttribute("aria-checked", "true");
    await next.click();

    // Paso 4: contacto.
    await expect(page.getByRole("progressbar", { name: /paso 4 de 5/i })).toHaveAttribute("aria-valuenow", "4");
    await next.click();
    await expect(page.getByRole("alert").filter({ hasText: /nombre completo/i })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: /whatsapp/i })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: /email válido/i })).toBeVisible();
    await page.getByLabel("Nombre completo").fill("Prueba E2E Automatizada");
    await page.getByRole("textbox", { name: "WhatsApp", exact: true }).fill("+57 300 000 0000");
    await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
    await page.getByLabel("Instagram (opcional, sin @)").fill("e2e");
    await next.click();

    // Paso 5: resumen, anticipo/cancelación, mayoría de edad y consentimiento.
    await expect(page.getByRole("progressbar", { name: /paso 5 de 5/i })).toHaveAttribute("aria-valuenow", "5");
    const summary = page.getByRole("region", { name: "Resumen de tu sesión" });
    await expect(summary).toContainText("E2E Artista");
    await expect(summary).toContainText(email);
    const terms = page.getByRole("region", { name: "Anticipo y cancelación" });
    await expect(terms).toContainText(/anticipo del \d+%/i);
    await expect(terms).toContainText(/\d+ h/);
    await expect(terms.getByRole("link", { name: /términos del estudio/i })).toHaveAttribute("href", "/legal/terminos-estudio");

    const confirm = page.getByRole("button", { name: /confirmar sesión/i });
    await confirm.click();
    await expect(page.getByRole("alert").filter({ hasText: /mayor de 18/i })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: /anticipo y cancelación/i })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: /autorizar el tratamiento/i })).toBeVisible();

    // Menor de edad: aviso informativo sin bloquear.
    await page.getByRole("radio", { name: /no, soy menor de edad/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /acudiente/i })).toBeVisible();
    await page.getByRole("radio", { name: /sí, soy mayor de edad/i }).click();
    await expect(page.getByRole("status").filter({ hasText: /acudiente/i })).toHaveCount(0);

    await page.getByRole("checkbox", { name: /entiendo la política de anticipo/i }).check();
    await page.getByRole("region", { name: "Datos personales" }).getByRole("checkbox", { name: /autorizo a/i }).check();
    await confirm.click();

    // Página de éxito.
    await expect(page).toHaveURL(/\/booking\/success\?id=/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const id = new URL(page.url()).searchParams.get("id") ?? "";
    expect(id.length).toBeGreaterThan(8);
    await expect(page.getByText(id.slice(-8).toUpperCase())).toBeVisible();

    // La sesión existe en el backend con los datos del wizard.
    const api = await createAdminApi(request);
    const sessions = await api.get<{ items: { id: string; artistEmail: string; timeSlot: string; status: string; isAdult?: boolean | null; policyVersion?: string | null; scheduledDate: string }[] }>(
      "/api/admin/sessions?status=PENDING",
    );
    const row = sessions.items.find((s) => s.id === id);
    expect(row).toBeTruthy();
    expect(row!.artistEmail).toBe(email);
    expect(row!.timeSlot).toBe(slot);
    expect(row!.isAdult).toBe(true);
    expect(row!.policyVersion).toBeTruthy();
    expect(row!.scheduledDate.slice(0, 10)).toBe(dateKey(date));
  });

  test("página de éxito sin id muestra el marcador y enlaces de salida", async ({ page }) => {
    await page.goto("/booking/success");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/");
  });
});
