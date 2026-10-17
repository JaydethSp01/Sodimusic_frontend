import { test, expect, API_URL, standaloneAdminApi, uniq } from "../fixtures";

test.describe("Producciones", () => {
  test("los chips de filtro cambian la URL y la lista", async ({ page }) => {
    await page.goto("/productions");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const genreNav = page.getByRole("navigation", { name: "Filtrar por género" });
    await expect(genreNav.getByRole("link", { name: "Todos" })).toHaveAttribute("aria-current", "page");

    await genreNav.getByRole("link", { name: "Trap", exact: true }).click();
    await expect(page).toHaveURL(/\/productions\?genre=Trap$/);
    await expect(genreNav.getByRole("link", { name: "Trap", exact: true })).toHaveAttribute("aria-current", "page");

    const list = page.getByRole("region", { name: "Listado de producciones" });
    await expect(list.locator("article").first()).toBeVisible();
    const genres = await list.locator("article").evaluateAll((cards) =>
      cards.map((c) => Array.from(c.querySelectorAll("span")).map((s) => s.textContent?.trim())),
    );
    for (const chips of genres) expect(chips).toContain("Trap");

    // Combinar filtros conserva el género y reinicia la página.
    await page.getByRole("navigation", { name: "Filtrar por país" }).getByRole("link", { name: "Colombia" }).click();
    await expect(page).toHaveURL(/genre=Trap/);
    await expect(page).toHaveURL(/country=Colombia/);
    await expect(page.getByRole("link", { name: /limpiar filtros/i })).toBeVisible();
    await page.getByRole("link", { name: /limpiar filtros/i }).click();
    await expect(page).toHaveURL(/\/productions$/);
  });

  test("filtro sin resultados muestra estado vacío y «Quitar filtros»", async ({ page }) => {
    await page.goto("/productions?year=2016&country=Otro");
    const list = page.getByRole("region", { name: "Listado de producciones" });
    await expect(list.getByText("Sin resultados")).toBeVisible();
    await expect(list.getByRole("link", { name: /quitar filtros/i })).toHaveAttribute("href", "/productions");
  });

  test("tarjeta con enlaces externos rel=noopener y target=_blank", async ({ page }) => {
    await page.goto("/productions");
    const list = page.getByRole("region", { name: "Listado de producciones" });
    const external = list.locator("article a[target='_blank']");
    expect(await external.count()).toBeGreaterThan(0);
    const attrs = await external.evaluateAll((links) =>
      links.map((a) => ({ rel: a.getAttribute("rel") ?? "", href: a.getAttribute("href") ?? "", label: a.getAttribute("aria-label") ?? "" })),
    );
    for (const a of attrs) {
      expect(a.rel).toMatch(/noopener/);
      expect(a.href).toMatch(/^https?:\/\//);
      expect(a.label).toMatch(/spotify|youtube/i);
    }
  });

  test.describe("paginación", () => {
    const genre = `E2E-${uniq("pag")}`;
    const created: string[] = [];

    test.beforeAll(async () => {
      const { api, dispose } = await standaloneAdminApi();
      try {
        for (let i = 0; i < 13; i++) {
          const row = await api.post<{ id: string }>("/api/admin/productions", {
            title: `E2E paginación ${i + 1}`,
            artistName: "E2E Artist",
            artistCity: "Medellín",
            artistCountry: "Colombia",
            year: 2020,
            genre,
            coverUrl: null,
            spotifyUrl: null,
            youtubeUrl: null,
            featured: false,
          });
          created.push(row.id);
        }
      } finally {
        await dispose();
      }
    });

    test.afterAll(async () => {
      const { api, dispose } = await standaloneAdminApi();
      try {
        for (const id of created) await api.delete(`/api/admin/productions/${id}`);
      } finally {
        await dispose();
      }
    });

    test("muestra «Página 1 de 2» y navega a la página 2", async ({ page, request }) => {
      const check = await request.get(`${API_URL}/api/productions?genre=${encodeURIComponent(genre)}&pageSize=12`);
      expect((await check.json()).total).toBe(13);

      await page.goto(`/productions?genre=${encodeURIComponent(genre)}`);
      const list = page.getByRole("region", { name: "Listado de producciones" });
      await expect(list.getByText("Página 1 de 2")).toBeVisible();
      await expect(list.locator("article")).toHaveCount(12);
      const pagination = list.getByRole("navigation", { name: "Paginación" });
      await expect(pagination.getByRole("link", { name: /siguiente/i })).toHaveAttribute("rel", "next");
      await pagination.getByRole("link", { name: /siguiente/i }).click();
      await expect(page).toHaveURL(/page=2/, { timeout: 30_000 });
      await expect(list.getByText("Página 2 de 2")).toBeVisible();
      await expect(list.locator("article")).toHaveCount(1);
      await expect(list.getByRole("navigation", { name: "Paginación" }).getByRole("link", { name: /anterior/i })).toHaveAttribute(
        "rel",
        "prev",
      );
    });
  });
});
