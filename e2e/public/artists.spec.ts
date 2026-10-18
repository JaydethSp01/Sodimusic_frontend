import { test, expect, API_URL, standaloneAdminApi, uniq } from "../fixtures";

type Artist = { id: string; slug: string; name: string; role: string; status: string };

const PROBE = `${API_URL}/api/artists`;

/** La API de artistas puede no estar desplegada aún: los tests se saltan (no fallan) si responde 404. */
async function artistsApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch(PROBE);
    return res.status !== 404;
  } catch {
    return false;
  }
}

test.describe("Artistas (público)", () => {
  const token = uniq("E2E-art");
  const name = `${token} Visible`;
  const hiddenName = `${token} Oculto`;
  let slug = "";
  let hiddenSlug = "";
  const ids: string[] = [];
  let available = false;

  test.beforeAll(async () => {
    available = await artistsApiAvailable();
    if (!available) return;
    const { api, dispose } = await standaloneAdminApi();
    try {
      const a = await api.post<Artist>("/api/admin/artists", {
        name,
        role: "Artista",
        city: "Cartagena",
        genres: ["Trap", "Afrobeat"],
        aliases: [],
        shortBio: "Bio corta de prueba e2e.",
        bio: "Primer párrafo de la bio.\n\nSegundo párrafo de la bio.",
        spotifyUrl: "https://open.spotify.com/artist/4q3ewBCX7sLwd24euuV69X",
        instagramUrl: "https://www.instagram.com/sodimusic",
        youtubeUrl: "https://www.youtube.com/@sodimusic",
        featured: false,
        status: "ACTIVE",
        sortOrder: 900,
      });
      const h = await api.post<Artist>("/api/admin/artists", {
        name: hiddenName,
        role: "Crew",
        genres: [],
        aliases: [],
        featured: false,
        status: "HIDDEN",
        sortOrder: 901,
      });
      slug = a.slug;
      hiddenSlug = h.slug;
      ids.push(a.id, h.id);
    } finally {
      await dispose();
    }
  });

  test.afterAll(async () => {
    if (!ids.length) return;
    const { api, dispose } = await standaloneAdminApi();
    try {
      for (const id of ids) await api.delete(`/api/admin/artists/${id}`);
    } finally {
      await dispose();
    }
  });

  test("la lista pública muestra solo ACTIVE y cada tarjeta enlaza a su ficha", async ({ page, request }) => {
    test.setTimeout(150_000);
    test.skip(!available, "La API /api/artists aún no está desplegada");
    const pub = (await (await request.get(PROBE)).json()) as { items: Artist[] };
    expect(pub.items.map((a) => a.name)).toContain(name);
    expect(pub.items.map((a) => a.name)).not.toContain(hiddenName);

    await page.goto("/artists");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const grid = page.getByRole("list", { name: "Artistas del sello" });
    await expect(grid).toBeVisible();
    const card = grid.locator("article").filter({ hasText: name });
    // El artista se creó por API (sin revalidar la caché de Next): /artists se regenera cada 60 s.
    await expect
      .poll(
        async () => {
          if ((await card.count()) === 1) return 1;
          await page.waitForTimeout(8_000);
          await page.reload();
          return card.count();
        },
        { timeout: 90_000, intervals: [1_000] },
      )
      .toBe(1);
    await expect(card.getByRole("link", { name })).toHaveAttribute("href", `/artists/${slug}`);
    await expect(grid.locator("article").filter({ hasText: hiddenName })).toHaveCount(0);

    await card.getByRole("link", { name }).click();
    await expect(page).toHaveURL(new RegExp(`/artists/${slug}$`));
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  });

  test("la ficha tiene H1, plataformas con rel=noopener y secciones según datos", async ({ page }) => {
    test.skip(!available, "La API /api/artists aún no está desplegada");
    await page.goto(`/artists/${slug}`);
    await expect(page).toHaveTitle(new RegExp(name));
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.getByText("Artista", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Cartagena").first()).toBeVisible();
    await expect(page.getByRole("list", { name: "Géneros" })).toContainText("Trap");

    const platforms = page.getByRole("navigation", { name: `Plataformas de ${name}` });
    for (const label of ["Spotify", "YouTube", "Instagram"]) {
      const link = platforms.getByRole("link", { name: label });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(link).toHaveAttribute("rel", /noreferrer/);
    }
    await expect(platforms.getByRole("link", { name: "TikTok" })).toHaveCount(0);

    // Bio con dos párrafos; secciones sin datos ausentes.
    const bio = page.getByRole("region", { name: "Historia" });
    await expect(bio).toContainText("Primer párrafo de la bio.");
    await expect(bio).toContainText("Segundo párrafo de la bio.");
    await expect(page.getByRole("region", { name: /producciones de/i })).toHaveCount(0);
    await expect(page.getByRole("region", { name: /lo último en video/i })).toHaveCount(0);

    // Spotify: el iframe solo se monta al pulsar.
    expect(await page.locator("iframe").count()).toBe(0);
    await page.getByRole("button", { name: /escuchar .* en spotify/i }).click();
    const iframe = page.locator("iframe[title^='Reproductor de Spotify']");
    await expect(iframe).toHaveCount(1);
    expect(await iframe.getAttribute("src")).toContain("open.spotify.com/embed/artist/4q3ewBCX7sLwd24euuV69X");

    // JSON-LD con sameAs.
    const ld = await page.locator("script[type='application/ld+json']").first().textContent();
    expect(ld).toContain('"sameAs"');
    expect(ld).toContain("open.spotify.com/artist/4q3ewBCX7sLwd24euuV69X");

    // Scope al artículo: la navbar también tiene un «Agendar sesión».
    await expect(page.locator("article").first().getByRole("link", { name: "Agendar sesión" })).toHaveAttribute("href", /\S+/);
  });

  test("un artista HIDDEN o inexistente devuelve 404", async ({ page }) => {
    test.skip(!available, "La API /api/artists aún no está desplegada");
    const res = await page.goto(`/artists/${hiddenSlug}`);
    expect(res?.status()).toBe(404);
    const res2 = await page.goto(`/artists/no-existe-${token}`);
    expect(res2?.status()).toBe(404);
  });

  test("el sitemap incluye la ficha del artista activo", async ({ request }) => {
    test.skip(!available, "La API /api/artists aún no está desplegada");
    test.setTimeout(150_000);
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    let xml = await res.text();
    test.skip(/<sitemapindex/i.test(xml), "sitemap de next-sitemap (índice): la ruta dinámica se valida en app/sitemap.ts");
    // El artista se creó por API (sin revalidar la caché de Next): el sitemap se regenera cada 60 s.
    await expect
      .poll(
        async () => {
          if (xml.includes(`/artists/${slug}`)) return true;
          await new Promise((r) => setTimeout(r, 8_000));
          xml = await (await request.get("/sitemap.xml")).text();
          return xml.includes(`/artists/${slug}`);
        },
        { timeout: 90_000, intervals: [1_000] },
      )
      .toBe(true);
    expect(xml).not.toContain(`/artists/${hiddenSlug}`);
  });
});
