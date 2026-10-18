import { test, expect, API_URL } from "../fixtures";

type Release = {
  slug: string;
  title: string;
  artistName: string;
  releaseDate: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  appleUrl?: string | null;
  deezerUrl?: string | null;
  amazonUrl?: string | null;
  tidalUrl?: string | null;
  soundcloudUrl?: string | null;
};

const PLATFORMS: Array<[keyof Release, RegExp]> = [
  ["spotifyUrl", /spotify/i],
  ["appleUrl", /apple music/i],
  ["youtubeUrl", /youtube/i],
  ["deezerUrl", /deezer/i],
  ["amazonUrl", /amazon music/i],
  ["tidalUrl", /tidal/i],
  ["soundcloudUrl", /soundcloud/i],
];

test.describe("Lanzamientos", () => {
  test("lista con tarjetas y enlace al detalle", async ({ page, request }) => {
    const data = (await (await request.get(`${API_URL}/api/releases`)).json()) as { items: Release[] };
    await page.goto("/releases");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const list = page.getByRole("region", { name: "Lanzamientos" });
    if (data.items.length === 0) {
      await expect(list).toContainText(/\S/);
      return;
    }
    await expect(list.locator("article")).toHaveCount(data.items.length);
    const first = data.items[0];
    const card = list.locator("article").filter({ has: page.getByRole("heading", { level: 2, name: first.title }) });
    await expect(card.getByRole("link", { name: first.title, exact: true })).toHaveAttribute("href", `/releases/${first.slug}`);
    await card.getByRole("link", { name: first.title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/releases/${first.slug}$`), { timeout: 30_000 });
  });

  test("lanzamiento destacado en formato ancho con título enlazado, fecha y smart links", async ({ page, request }) => {
    const data = (await (await request.get(`${API_URL}/api/releases`)).json()) as { items: Release[] };
    test.skip(data.items.length === 0, "Sin lanzamientos en el seed");
    await page.goto("/releases");
    const list = page.getByRole("region", { name: "Lanzamientos" });
    const featured = list.getByTestId("featured-release");
    await expect(featured).toBeVisible();
    await expect(featured).toContainText(/próximo lanzamiento|último lanzamiento/i);
    const title = featured.getByRole("heading", { level: 2 });
    await expect(title).toBeVisible();
    const titleText = (await title.textContent())?.trim() ?? "";
    const match = data.items.find((r) => r.title === titleText);
    expect(match, `el destacado «${titleText}» debe ser un lanzamiento de la API`).toBeTruthy();
    await expect(featured.getByRole("link", { name: titleText, exact: true })).toHaveAttribute("href", `/releases/${match!.slug}`);
    if (match!.releaseDate) {
      await expect(featured.locator("time")).toHaveAttribute("datetime", /\d{4}-\d{2}-\d{2}/);
      if (new Date(match!.releaseDate).getTime() > Date.now()) {
        await expect(featured.getByRole("timer")).toBeVisible();
      }
    }
    const hasLinks = PLATFORMS.some(([key]) => typeof match![key] === "string" && /^https?:\/\//.test(match![key] as string));
    if (hasLinks) {
      await expect(featured.getByRole("navigation", { name: "Escuchar en plataformas" })).toBeVisible();
    }
    // Con un solo lanzamiento no se pinta la grilla «Más lanzamientos».
    if (data.items.length === 1) {
      await expect(list.getByRole("list", { name: "Más lanzamientos" })).toHaveCount(0);
    } else {
      await expect(list.getByRole("list", { name: "Más lanzamientos" }).locator("article")).toHaveCount(data.items.length - 1);
    }
  });

  test("detalle: solo los smart links existentes, fecha y cuenta regresiva si es futura", async ({ page, request }) => {
    const data = (await (await request.get(`${API_URL}/api/releases`)).json()) as { items: Release[] };
    test.skip(data.items.length === 0, "Sin lanzamientos en el seed");
    const r = data.items[0];
    await page.goto(`/releases/${r.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: r.title })).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Escuchar en plataformas" }).first();
    for (const [key, label] of PLATFORMS) {
      const url = r[key];
      const link = nav.getByRole("link", { name: label });
      if (typeof url === "string" && /^https?:\/\//.test(url)) {
        await expect(link).toHaveAttribute("href", url.trim());
        await expect(link).toHaveAttribute("rel", /noopener/);
      } else {
        await expect(link).toHaveCount(0);
      }
    }

    if (r.releaseDate) {
      const time = page.locator("time").first();
      await expect(time).toHaveAttribute("datetime", /\d{4}-\d{2}-\d{2}/);
      const future = new Date(r.releaseDate).getTime() > Date.now();
      if (future) {
        const timer = page.getByRole("timer");
        await expect(timer).toBeVisible();
        await expect(timer).toContainText(/faltan/i);
        await expect(timer).toContainText(/días|día/);
        // Tras montar, los guiones «--» se sustituyen por números.
        await expect(timer).not.toContainText("--", { timeout: 10_000 });
      } else {
        await expect(page.getByRole("timer")).toHaveCount(0);
      }
    }
  });

  test("slug inexistente responde 404 real", async ({ page }) => {
    const res = await page.goto("/releases/slug-que-no-existe-e2e");
    expect(res?.status()).toBe(404);
  });
});

test.describe("Artistas", () => {
  test("productor principal y crew con redes (si están configuradas)", async ({ page, request }) => {
    const cfg = (await (await request.get(`${API_URL}/api/site-config`)).json()) as {
      content: { artists: { producerName: string; members: { name: string; instagramUrl?: string; youtubeUrl?: string }[] } };
    };
    await page.goto("/artists");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: cfg.content.artists.producerName })).toBeVisible();
    await expect(page.getByRole("list", { name: "Géneros" }).getByRole("listitem").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /agendar sesión/i }).first()).toHaveAttribute("href", "/booking");

    const crew = page.locator("section[aria-labelledby='crew-xmen']");
    await crew.scrollIntoViewIfNeeded();
    const members = cfg.content.artists.members;
    if (!members.length) {
      await expect(crew).toContainText(/pronto presentaremos/i);
      return;
    }
    await expect(crew.locator("article")).toHaveCount(members.length);
    for (const m of members) {
      const card = crew.locator("article").filter({ has: page.getByRole("heading", { level: 3, name: m.name }) });
      await expect(card).toBeVisible();
      if (m.instagramUrl?.trim()) {
        const ig = card.getByRole("link", { name: `Instagram de ${m.name}` });
        await expect(ig).toHaveAttribute("href", m.instagramUrl.trim());
        await expect(ig).toHaveAttribute("rel", /noopener/);
      }
      if (m.youtubeUrl?.trim()) {
        await expect(card.getByRole("link", { name: `YouTube de ${m.name}` })).toHaveAttribute("rel", /noopener/);
      }
    }
    const anyLinks = members.some((m) => m.instagramUrl?.trim() || m.youtubeUrl?.trim());
    test.info().annotations.push({
      type: "nota",
      description: anyLinks ? "Crew con redes verificadas" : "El seed no tiene redes en el crew: solo se valida la grilla",
    });
  });
});
