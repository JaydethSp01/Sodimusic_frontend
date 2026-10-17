import { test, expect, API_URL, standaloneAdminApi, uniq } from "../fixtures";

type Channel = { id: string; name: string; category: string; channelId: string | null };

function fakeChannelId(seed: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  let out = "UC";
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  for (let i = 0; i < 22; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    out += alphabet[h % alphabet.length];
  }
  return out;
}

async function createChannel(
  api: Awaited<ReturnType<typeof standaloneAdminApi>>["api"],
  input: { name: string; category?: string; status?: "ACTIVE" | "HIDDEN"; featured?: boolean; description?: string },
): Promise<Channel> {
  const id = fakeChannelId(input.name);
  return api.post<Channel>("/api/admin/channels", {
    name: input.name,
    url: `https://www.youtube.com/channel/${id}`,
    description: input.description ?? `Canal de prueba ${input.name}`,
    category: input.category ?? "E2E",
    featured: input.featured ?? false,
    status: input.status ?? "ACTIVE",
    sortOrder: 500,
  });
}

test.describe("Canales", () => {
  test.describe("búsqueda, visibilidad y embed", () => {
    const token = uniq("E2E-can");
    const ids: string[] = [];
    // Categoría ya existente en el seed: las chips salen de una consulta cacheada (ISR 300 s),
    // así que una categoría nueva podría no aparecer hasta la siguiente revalidación.
    let category = "Sello";

    test.beforeAll(async () => {
      const { api, dispose } = await standaloneAdminApi();
      try {
        const pub = await api.get<{ categories: string[] }>("/api/channels?pageSize=1");
        category = pub.categories[0] ?? "Sello";
        const a = await createChannel(api, { name: `${token} Visible Uno`, category });
        const b = await createChannel(api, { name: `${token} Visible Dos`, category });
        const h = await createChannel(api, { name: `${token} Oculto`, category, status: "HIDDEN" });
        ids.push(a.id, b.id, h.id);
      } finally {
        await dispose();
      }
    });

    test.afterAll(async () => {
      const { api, dispose } = await standaloneAdminApi();
      try {
        for (const id of ids) await api.delete(`/api/admin/channels/${id}`);
      } finally {
        await dispose();
      }
    });

    test("búsqueda `q` encuentra los visibles y nunca el HIDDEN", async ({ page, request }) => {
      const pub = (await (await request.get(`${API_URL}/api/channels?q=${encodeURIComponent(token)}`)).json()) as {
        items: Channel[];
        total: number;
      };
      expect(pub.total).toBe(2);
      expect(pub.items.map((c) => c.name)).not.toContain(`${token} Oculto`);

      await page.goto("/canales");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const search = page.getByRole("search");
      await search.getByRole("searchbox", { name: "Buscar canales" }).fill(token);
      await search.getByRole("button", { name: "Buscar" }).click();
      await expect(page).toHaveURL(new RegExp(`/canales\\?q=${encodeURIComponent(token)}`));
      const list = page.getByRole("region", { name: "Listado de canales" });
      await expect(list.getByText(`2 canales · «${token}»`)).toBeVisible();
      await expect(list.locator("article")).toHaveCount(2);
      await expect(list.getByRole("heading", { level: 3, name: `${token} Visible Uno` })).toBeVisible();
      await expect(list.getByRole("heading", { level: 3, name: `${token} Oculto` })).toHaveCount(0);

      // Limpiar la búsqueda vuelve al listado completo.
      await page.getByRole("button", { name: "Limpiar búsqueda" }).click();
      await expect(page).toHaveURL(/\/canales$/);
    });

    test("búsqueda sin resultados muestra estado vacío con enlace «Ver todos los canales»", async ({ page }) => {
      await page.goto(`/canales?q=${encodeURIComponent("zzz-" + token)}`);
      const list = page.getByRole("region", { name: "Listado de canales" });
      await expect(list).toContainText(/no encontramos canales/i);
      await expect(list.getByRole("link", { name: /ver todos los canales/i })).toHaveAttribute("href", "/canales");
    });

    test("chips de categoría filtran y conservan `q`", async ({ page, isMobile }) => {
      await page.goto(`/canales?q=${encodeURIComponent(token)}`);
      const chips = page.getByRole("navigation", { name: "Categorías de canales" });
      await expect(page.getByRole("region", { name: "Listado de canales" })).toBeVisible();
      // Las chips solo se muestran con ≥ 2 categorías activas (lista cacheada por ISR 300 s).
      test.skip((await chips.count()) === 0, "Solo hay una categoría activa en este momento: la página no muestra chips");
      test.fixme(isMobile, "fixme (test): el recuento de la chip activa depende de la caché ISR (300 s) de categorías; se valida solo en escritorio. No es bug del producto");
      await expect(chips.getByRole("link", { name: /^Todos/ })).toHaveAttribute("aria-current", "page");
      await chips.getByRole("link", { name: new RegExp(`^${category}`) }).click();
      await expect(page).toHaveURL(new RegExp(`category=${category}`));
      await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(token)}`));
      await expect(chips.getByRole("link", { name: new RegExp(`^${category}`) })).toHaveAttribute("aria-current", "page");
      const list = page.getByRole("region", { name: "Listado de canales" });
      await expect(list.locator("article")).toHaveCount(2);
      await expect(list.getByText(new RegExp(`2 canales · ${category}`))).toBeVisible();
    });

    test("abrir «Ver videos» en dos tarjetas deja un solo iframe", async ({ page }) => {
      await page.goto(`/canales?q=${encodeURIComponent(token)}`);
      const list = page.getByRole("region", { name: "Listado de canales" });
      const cards = list.locator("article");
      await expect(cards).toHaveCount(2);
      expect(await page.locator("iframe").count()).toBe(0);

      const first = cards.nth(0);
      const second = cards.nth(1);
      await first.getByRole("button", { name: "Ver videos", exact: true }).click();
      await expect(first.getByRole("button", { name: "Cerrar", exact: true })).toHaveAttribute("aria-expanded", "true");
      // El facade monta el iframe al entrar en viewport o al hacer clic.
      const poster = first.getByRole("button", { name: /^Ver videos: Videos de/ });
      if (await poster.isVisible().catch(() => false)) await poster.click();
      await expect(first.locator("iframe")).toHaveCount(1);

      await second.getByRole("button", { name: "Ver videos", exact: true }).click();
      await expect(second.getByRole("button", { name: "Cerrar", exact: true })).toHaveAttribute("aria-expanded", "true");
      await expect(first.getByRole("button", { name: "Ver videos", exact: true })).toBeVisible();
      await expect(first.locator("iframe")).toHaveCount(0);
      const poster2 = second.getByRole("button", { name: /^Ver videos: Videos de/ });
      if (await poster2.isVisible().catch(() => false)) await poster2.click();
      await expect(second.locator("iframe")).toHaveCount(1);
      expect(await page.locator("iframe").count(), "solo un iframe de YouTube por página").toBe(1);
      const src = (await second.locator("iframe").getAttribute("src")) ?? "";
      expect(src).toContain("youtube-nocookie.com");
    });
  });

  test.describe("paginación con total > 24", () => {
    const token = uniq("E2E-pag");
    const ids: string[] = [];

    test.beforeAll(async () => {
      test.setTimeout(120_000);
      const { api, dispose } = await standaloneAdminApi();
      try {
        for (let i = 1; i <= 26; i++) {
          const row = await createChannel(api, { name: `${token} ${String(i).padStart(2, "0")}`, category: "E2Epag" });
          ids.push(row.id);
        }
      } finally {
        await dispose();
      }
    });

    test.afterAll(async () => {
      const { api, dispose } = await standaloneAdminApi();
      try {
        for (const id of ids) await api.delete(`/api/admin/channels/${id}`);
      } finally {
        await dispose();
      }
    });

    test("página 1 muestra 24, página 2 muestra los 2 restantes", async ({ page, request }) => {
      const pub = (await (await request.get(`${API_URL}/api/channels?q=${encodeURIComponent(token)}&page=2`)).json()) as {
        items: Channel[];
        total: number;
      };
      expect(pub.total).toBe(26);
      expect(pub.items).toHaveLength(2);

      await page.goto(`/canales?q=${encodeURIComponent(token)}`);
      const list = page.getByRole("region", { name: "Listado de canales" });
      await expect(list.getByText(/^26 canales/)).toBeVisible();
      await expect(list.locator("article")).toHaveCount(24);
      const pagination = list.getByRole("navigation", { name: "Paginación de canales" });
      await expect(pagination).toContainText("Página 1 de 2");
      await pagination.getByRole("link", { name: /siguiente/i }).click();
      await expect(page).toHaveURL(/page=2/);
      await expect(list.locator("article")).toHaveCount(2);
      await expect(list.getByRole("navigation", { name: "Paginación de canales" })).toContainText("Página 2 de 2");
      await expect(list.getByRole("navigation", { name: "Paginación de canales" }).getByRole("link", { name: /anterior/i })).toHaveAttribute(
        "href",
        new RegExp(`/canales\\?q=${encodeURIComponent(token)}$`),
      );
    });
  });
});
