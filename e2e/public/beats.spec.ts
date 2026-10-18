import { test, expect, API_URL, cleanup, createAdminApi, uniqEmail } from "../fixtures";

type Beat = {
  id: string;
  title: string;
  genre: string;
  mood: string | null;
  bpm: number | null;
  status: string;
  priceCOP: number;
  priceMp3COP?: number | null;
  priceWavCOP?: number | null;
  priceStemsCOP?: number | null;
  priceExclusiveCOP?: number | null;
  audioUrl?: string | null;
};

async function fetchBeats(request: import("@playwright/test").APIRequestContext): Promise<Beat[]> {
  const res = await request.get(`${API_URL}/api/beats?pageSize=48`);
  return ((await res.json()) as { items: Beat[] }).items;
}

test.describe("Beats", () => {
  test("chips de género y mood filtran la lista", async ({ page, request }) => {
    const beats = await fetchBeats(request);
    await page.goto("/beats");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const genreNav = page.getByRole("navigation", { name: "Género" });
    await expect(genreNav.getByRole("button", { name: /^Todos/ })).toHaveAttribute("aria-pressed", "true");
    const genre = beats.find((b) => b.genre)?.genre ?? "Trap";
    const expected = beats.filter((b) => b.genre === genre).length;
    await genreNav.getByRole("button", { name: new RegExp(`^${genre}\\b`) }).click();
    await expect(genreNav.getByRole("button", { name: new RegExp(`^${genre}\\b`) })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("article")).toHaveCount(expected);
    await expect(page.locator("p[aria-live='polite']").filter({ hasText: /beats?/ }).first()).toContainText(new RegExp(`^${expected} beats?`));

    const mood = beats.find((b) => b.genre === genre && b.mood)?.mood;
    if (mood) {
      const moodNav = page.getByRole("navigation", { name: "Mood" });
      await moodNav.getByRole("button", { name: mood, exact: true }).click();
      const expectedMood = beats.filter((b) => b.genre === genre && b.mood === mood).length;
      await expect(page.locator("article")).toHaveCount(expectedMood);
      await moodNav.getByRole("button", { name: /cualquier mood/i }).click();
    }
    await genreNav.getByRole("button", { name: /^Todos/ }).click();
    await expect(page.locator("article")).toHaveCount(beats.length);
  });

  test("filtro de BPM y «Solo disponibles» oculta vendidos; vendidos sin botón", async ({ page, request }) => {
    const beats = await fetchBeats(request);
    await page.goto("/beats");
    await expect(page.locator("article")).toHaveCount(beats.length);

    const sold = beats.filter((b) => b.status === "SOLD");
    for (const b of sold) {
      const card = page.getByRole("article", { name: `${b.title} (vendido)` });
      await expect(card).toBeVisible();
      await expect(card.getByText("Vendido", { exact: true })).toBeVisible();
      await expect(card.getByRole("button", { name: /elegir licencia/i })).toHaveCount(0);
    }

    await page.getByRole("checkbox", { name: /solo disponibles/i }).check();
    await expect(page.locator("article")).toHaveCount(beats.length - sold.length);
    for (const b of sold) await expect(page.getByRole("article", { name: `${b.title} (vendido)` })).toHaveCount(0);
    await page.getByRole("checkbox", { name: /solo disponibles/i }).uncheck();

    const withBpm = beats.filter((b) => b.bpm != null);
    if (withBpm.length) {
      const maxBpm = Math.max(...withBpm.map((b) => b.bpm as number));
      const min = maxBpm; // solo quedan los beats con bpm == max o sin bpm
      await page.getByLabel("BPM mín").fill(String(min));
      const expected = beats.filter((b) => b.bpm == null || b.bpm >= min).length;
      await expect(page.locator("article")).toHaveCount(expected);
    }
  });

  test("ninguna tarjeta muestra el badge «Sin preview»", async ({ page, request }) => {
    const beats = await fetchBeats(request);
    await page.goto("/beats");
    await expect(page.locator("article")).toHaveCount(beats.length);
    await expect(page.getByText(/sin preview/i)).toHaveCount(0);
    // Sin audio no hay botón de play; con audio sí.
    for (const b of beats) {
      await expect(page.getByRole("button", { name: `Reproducir ${b.title}`, exact: true })).toHaveCount(b.audioUrl ? 1 : 0);
    }
  });

  test("play en la tarjeta abre la barra global con el título y se puede cerrar", async ({ page, request }) => {
    const beats = await fetchBeats(request);
    const beat = beats.find((b) => b.audioUrl);
    test.skip(!beat, "no hay beats con preview de audio en la API");
    await page.goto("/beats");
    await expect(page.getByRole("region", { name: /reproductor/i })).toHaveCount(0);

    await page.getByRole("button", { name: `Reproducir ${beat!.title}`, exact: true }).click();
    const bar = page.getByRole("region", { name: /reproductor/i });
    await expect(bar).toBeVisible();
    await expect(bar).toContainText(beat!.title);
    await expect(bar.getByRole("button", { name: /elegir licencia para/i })).toBeVisible();
    // El contenido deja hueco bajo la barra (--player-bar-h) para que no quede tapado.
    const padding = await page.locator("body").evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
    expect(padding).toBeGreaterThan(40);

    await bar.getByRole("button", { name: /cerrar reproductor/i }).click();
    await expect(page.getByRole("region", { name: /reproductor/i })).toHaveCount(0);
  });

  test("modal «Elegir licencia» muestra tabla de licencias y enlace legal", async ({ page, request }) => {
    const beats = await fetchBeats(request);
    const beat = beats.find((b) => b.status !== "SOLD" && (b.priceMp3COP || b.priceCOP));
    expect(beat, "hace falta un beat disponible en el seed").toBeTruthy();
    await page.goto("/beats");
    await page.getByRole("button", { name: `Elegir licencia para ${beat!.title}` }).click();
    const dialog = page.getByRole("dialog", { name: "Elegir licencia" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(beat!.title);
    await expect(dialog).toContainText(/IVA incluido/);
    const list = dialog.getByRole("list", { name: "Licencias disponibles" });
    const rows = list.getByRole("button");
    const prices = [beat!.priceMp3COP, beat!.priceWavCOP, beat!.priceStemsCOP, beat!.priceExclusiveCOP].filter(
      (p) => typeof p === "number" && p > 0,
    );
    await expect(rows).toHaveCount(prices.length || 1);
    await expect(list).toContainText(/MP3/);
    await expect(dialog.getByRole("link", { name: /licencia de beats/i })).toHaveAttribute("href", "/legal/licencia-beats");

    // Elegir MP3 abre el formulario «Me interesa» con la licencia preseleccionada.
    await rows.first().click();
    const interest = page.getByRole("dialog", { name: new RegExp(`Me interesa: ${beat!.title}`) });
    await expect(interest).toBeVisible();
    await expect(interest.getByRole("radio", { checked: true })).toContainText(/MP3/);
  });

  test.describe("formulario «Me interesa»", () => {
    const emails: string[] = [];
    test.afterEach(() => {
      for (const e of emails.splice(0)) cleanup.beatInterestsByEmail(e);
    });

    test("validación inline (sin consentimiento → error) y envío válido crea BeatInterest", async ({ page, request }) => {
      const beats = await fetchBeats(request);
      const beat = beats.find((b) => b.status === "AVAILABLE") ?? beats.find((b) => b.status !== "SOLD");
      expect(beat).toBeTruthy();
      const email = uniqEmail("e2e-beat");
      emails.push(email);

      await page.goto("/beats");
      await page.getByRole("button", { name: `Elegir licencia para ${beat!.title}` }).click();
      await page.getByRole("dialog", { name: "Elegir licencia" }).getByRole("list", { name: "Licencias disponibles" }).getByRole("button").first().click();
      const dialog = page.getByRole("dialog", { name: /me interesa/i });
      await expect(dialog).toBeVisible();

      // Enviar vacío: errores inline con role=alert, sin petición al backend.
      await dialog.getByRole("button", { name: /^enviar$/i }).click();
      await expect(dialog.getByRole("alert").first()).toBeVisible();
      await expect(dialog.getByLabel("Nombre artístico")).toHaveAttribute("aria-invalid", "true");

      await dialog.getByLabel("Nombre artístico").fill("E2E Tester");
      await dialog.getByRole("textbox", { name: "Email", exact: true }).fill(email);
      await dialog.getByRole("textbox", { name: "WhatsApp", exact: true }).fill("+57 300 123 4567");
      await dialog.getByLabel("Instagram (opcional)").fill("@e2e");
      await dialog.getByLabel("Mensaje (opcional)").fill("Mensaje de prueba automatizada");
      // Sin consentimiento → error específico del checkbox.
      await dialog.getByRole("button", { name: /^enviar$/i }).click();
      await expect(dialog.getByRole("alert").filter({ hasText: /autorizar el tratamiento/i })).toBeVisible();

      await dialog.getByRole("checkbox", { name: /autorizo a/i }).check();
      const responsePromise = page.waitForResponse((r) => r.url().includes("/api/contact/beat-interest") && r.request().method() === "POST");
      await dialog.getByRole("button", { name: /^enviar$/i }).click();
      const res = await responsePromise;
      expect(res.status()).toBe(201);
      await expect(page.locator("[data-sonner-toast]").filter({ hasText: /te contactamos pronto/i })).toBeVisible();
      await expect(dialog).toBeHidden();

      const api = await createAdminApi(request);
      const list = await api.get<{ items: { email: string; beatTitle: string; licenseType: string | null; policyVersion: string }[] }>(
        `/api/admin/beat-interests?q=${encodeURIComponent(email)}`,
      );
      expect(list.items).toHaveLength(1);
      expect(list.items[0].beatTitle).toBe(beat!.title);
      expect(list.items[0].licenseType).toBeTruthy();
      expect(list.items[0].policyVersion).toBeTruthy();
    });
  });
});
