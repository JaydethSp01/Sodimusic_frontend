import { test, expect, ADMIN_STORAGE_STATE, API_URL, expectToast, fieldByLabel, standaloneAdminApi, type AdminApi } from "../fixtures";

test.use({ storageState: ADMIN_STORAGE_STATE });
test.describe.configure({ mode: "serial" });

const VIDEO_ID = "CLWusvMQpcE";
const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const EXTERNAL_ID = `yt:${VIDEO_ID}`;

type Post = { id: string; externalId: string; title: string; status: "VISIBLE" | "HIDDEN"; url: string };

/**
 * Busca la publicación de prueba por `externalId` (con y sin `q`, por si el backend no
 * busca en la URL). Tolera un backend sin el módulo (404) devolviendo `null`.
 */
async function findTestPost(api: AdminApi): Promise<Post | null> {
  for (const q of [VIDEO_ID, ""]) {
    const qs = new URLSearchParams({ status: "ALL", pageSize: "100" });
    if (q) qs.set("q", q);
    const res = await api.raw("GET", `/api/admin/social/posts?${qs.toString()}`);
    if (!res.ok()) return null;
    const data = (await res.json()) as { items?: Post[] };
    const hit = (data.items ?? []).find((p) => p.externalId === EXTERNAL_ID || p.url.includes(VIDEO_ID));
    if (hit) return hit;
  }
  return null;
}

test.describe("Admin · Novedades", () => {
  /** Si el video ya estaba en el feed (lo trae la sincronización real), no se borra al final. */
  let existedBefore = false;

  test.beforeAll(async () => {
    const { api, dispose } = await standaloneAdminApi();
    try {
      existedBefore = (await findTestPost(api)) !== null;
    } finally {
      await dispose();
    }
  });

  test.afterAll(async () => {
    if (existedBefore) return;
    const { api, dispose } = await standaloneAdminApi();
    try {
      const post = await findTestPost(api);
      if (post) await api.delete(`/api/admin/social/posts/${post.id}`);
    } finally {
      await dispose();
    }
  });

  test("la página carga con estado, fuentes y publicaciones", async ({ page }) => {
    await page.goto("/admin/dashboard/novedades");
    await expect(page.getByRole("heading", { name: "Novedades", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fuentes", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Publicaciones", exact: true })).toBeVisible();
    await expect(page.getByText("Última sincronización")).toBeVisible();
    await expect(page.getByText("YOUTUBE_API_KEY", { exact: true })).toBeVisible();
    await expect(page.getByText("FACEBOOK_PAGE_TOKEN", { exact: true })).toBeVisible();
    await expect(page.getByText("CRON_SECRET", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /sincronizar ahora/i })).toBeEnabled();
    await expect(page.getByRole("button", { name: /añadir enlace/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /añadir fuente/i })).toBeVisible();
  });

  test("«Sincronizar ahora» muestra un toast con el resumen", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/admin/dashboard/novedades");
    await page.getByRole("button", { name: /sincronizar ahora/i }).click();
    // La sincronización puede tardar (presupuesto de 25 s en el backend).
    await expectToast(page, /sincronización completada|no se pudo sincronizar|no autorizado/i, 60_000);
  });

  test("«Añadir enlace» crea la publicación y aparece en la lista", async ({ page }) => {
    await page.goto("/admin/dashboard/novedades");
    await page.getByRole("button", { name: /añadir enlace/i }).click();
    const dialog = page.getByRole("dialog", { name: "Añadir enlace" });
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, /indica una url válida/i);
    await fieldByLabel(dialog, "URL").fill(VIDEO_URL);
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expectToast(page, "Publicación añadida", 30_000);
    await expect(dialog).toBeHidden();

    const row = page.getByRole("row").filter({ hasText: VIDEO_ID });
    await expect(row).toBeVisible({ timeout: 20_000 });
    await expect(row).toContainText("YouTube");
    await expect(row).toContainText("Visible");
  });

  test("«Ocultar» la saca del feed público y «Mostrar» la devuelve", async ({ page, request }) => {
    const feedHas = async () => {
      const res = await request.get(`${API_URL}/api/social/feed?limit=48&kind=YOUTUBE_VIDEO`);
      const data = (await res.json()) as { items: Post[] };
      return data.items.some((p) => p.externalId === EXTERNAL_ID);
    };
    expect(await feedHas(), "la publicación recién creada está en el feed público").toBe(true);

    await page.goto(`/admin/dashboard/novedades?q=${VIDEO_ID}`);
    let row = page.getByRole("row").filter({ hasText: VIDEO_ID });
    if ((await row.count()) === 0) {
      // El buscador del backend puede no indexar la URL: lista completa.
      await page.goto("/admin/dashboard/novedades");
      row = page.getByRole("row").filter({ hasText: VIDEO_ID });
    }
    await expect(row).toBeVisible({ timeout: 20_000 });
    await row.getByRole("button", { name: /^Ocultar:/ }).click();
    await expectToast(page, "Publicación oculta");
    await expect(page.getByRole("row").filter({ hasText: VIDEO_ID })).toContainText("Oculta", { timeout: 20_000 });
    await expect.poll(feedHas, { timeout: 20_000 }).toBe(false);

    await page.getByRole("row").filter({ hasText: VIDEO_ID }).getByRole("button", { name: /^Mostrar:/ }).click();
    await expectToast(page, "Publicación visible");
    await expect.poll(feedHas, { timeout: 20_000 }).toBe(true);
  });

  test("borrar con AlertDialog (cancelar y confirmar)", async ({ page }) => {
    // Se borra un enlace creado solo para esta prueba, nunca una publicación real del feed.
    const LINK_URL = "https://example.com/sodimusic-e2e-borrar";
    const { api, dispose } = await standaloneAdminApi();
    try {
      await api.post("/api/admin/social/posts", { url: LINK_URL, title: "Enlace e2e para borrar" });
    } finally {
      await dispose();
    }
    await page.goto("/admin/dashboard/novedades");
    const row = page.getByRole("row").filter({ hasText: "Enlace e2e para borrar" });
    await expect(row).toBeVisible({ timeout: 20_000 });
    await row.getByRole("button", { name: /^Borrar:/ }).click();
    const alert = page.getByRole("alertdialog", { name: /borrar esta publicación/i });
    await alert.getByRole("button", { name: "Cancelar" }).click();
    await expect(alert).toBeHidden();
    await expect(page.getByRole("row").filter({ hasText: "Enlace e2e para borrar" })).toBeVisible();

    await row.getByRole("button", { name: /^Borrar:/ }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Borrar" }).click();
    await expectToast(page, "Publicación borrada");
    await expect(page.getByRole("row").filter({ hasText: "Enlace e2e para borrar" })).toHaveCount(0, { timeout: 20_000 });
  });
});
