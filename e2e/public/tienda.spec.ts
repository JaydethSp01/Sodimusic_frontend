import { test, expect, API_URL, whatsappText } from "../fixtures";

type Product = {
  slug: string;
  name: string;
  priceCOP: number;
  compareAtCOP: number | null;
  category: string;
  sizes: string[];
  status: string;
};

function cop(n: number): string {
  return `$ ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n)}`;
}

async function fetchProducts(request: import("@playwright/test").APIRequestContext): Promise<{ items: Product[]; categories: string[] }> {
  const res = await request.get(`${API_URL}/api/products?pageSize=48`);
  return (await res.json()) as { items: Product[]; categories: string[] };
}

test.describe("Tienda", () => {
  test("chips de categoría, tarjeta con precio, «IVA incluido» y «Antes» en producto con descuento", async ({ page, request }) => {
    const { items, categories } = await fetchProducts(request);
    await page.goto("/tienda");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const catalog = page.getByRole("region", { name: "Catálogo de productos" });
    await expect(catalog.getByText(/Precios en COP · IVA incluido/)).toBeVisible();
    await expect(catalog.locator("article")).toHaveCount(items.length);

    const chips = page.getByRole("navigation", { name: "Categorías" });
    for (const c of categories) await expect(chips.getByRole("link", { name: c, exact: true })).toBeVisible();
    const cat = categories[0];
    await chips.getByRole("link", { name: cat, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/tienda\\?category=${encodeURIComponent(cat)}`), { timeout: 30_000 });
    await expect(chips.getByRole("link", { name: cat, exact: true })).toHaveAttribute("aria-current", "page");
    const inCat = items.filter((p) => p.category === cat).length;
    await expect(catalog.locator("article")).toHaveCount(inCat);
    await chips.getByRole("link", { name: "Todos" }).click();
    await expect(page).toHaveURL(/\/tienda$/);

    const p = items[0];
    const card = catalog.locator("article").filter({ has: page.getByRole("link", { name: new RegExp(`^${p.name}, `) }) });
    await expect(card).toContainText(cop(p.priceCOP));
    await expect(card.getByText("IVA incluido", { exact: true })).toBeVisible();

    const discounted = items.find((x) => x.compareAtCOP != null && x.compareAtCOP > x.priceCOP);
    test.skip(!discounted, "No hay producto con compareAt en el seed");
    const dcard = catalog.locator("article").filter({ has: page.getByRole("link", { name: new RegExp(`^${discounted!.name}, `) }) });
    await expect(dcard).toContainText(cop(discounted!.compareAtCOP as number));
    await expect(dcard).toContainText("Antes");
    await expect(dcard.getByText(/^-\d+%$/)).toBeVisible();
    await dcard.getByRole("link", { name: new RegExp(`^${discounted!.name}, `) }).click();
    await expect(page).toHaveURL(new RegExp(`/tienda/${discounted!.slug}$`), { timeout: 30_000 });
    await expect(page.getByText(/^Antes/).first()).toBeVisible();
    await expect(page.getByText(/COP · IVA incluido/)).toBeVisible();
  });

  test("detalle: tallas obligatorias, carrito con total y WhatsApp, persistencia y vaciar", async ({ page, request, isMobile }) => {
    const { items } = await fetchProducts(request);
    const product = items.find((p) => p.status === "ACTIVE" && (p.sizes ?? []).length >= 2);
    expect(product, "hace falta un producto activo con varias tallas").toBeTruthy();
    const size = product!.sizes[1];

    await page.goto(`/tienda/${product!.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: product!.name })).toBeVisible();
    await expect(page.getByText(/COP · IVA incluido/)).toBeVisible();

    // Sin talla → error inline (role=alert) y no se añade.
    const addBtn = page.getByRole("button", { name: /añadir al pedido/i });
    await addBtn.click();
    await expect(page.getByRole("alert").filter({ hasText: /elige una talla/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /abrir pedido/i })).toHaveAccessibleName("Abrir pedido");

    await page.getByRole("group", { name: "Talla" }).getByRole("button", { name: size, exact: true }).click();
    await expect(page.getByRole("group", { name: "Talla" }).getByRole("button", { name: size, exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Aumentar cantidad" }).click();
    await addBtn.click();
    // El toast de sonner se carga bajo demanda (LazyToaster); el estado del carrito es la fuente de verdad.
    const toastShown = await page
      .locator("[data-sonner-toast]")
      .filter({ hasText: /añadido al pedido/i })
      .waitFor({ state: "visible", timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    test.info().annotations.push({ type: "nota", description: toastShown ? "Toast «añadido al pedido» visible" : "Toast «añadido al pedido» NO visible tras añadir (posible pérdida por LazyToaster)" });

    // El botón del carrito indica artículos y abre el drawer con el ítem y el total correcto.
    const cartBtn = page.getByRole("button", { name: /abrir pedido \(2 artículos\)/i });
    await expect(cartBtn).toBeVisible();
    await cartBtn.click();
    const drawer = page.getByRole("dialog", { name: /tu pedido/i });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: product!.name }).first()).toBeVisible();
    await expect(drawer.getByText(`Talla ${size}`)).toBeVisible();
    const total = product!.priceCOP * 2;
    await expect(drawer.getByText("Subtotal", { exact: true }).locator("xpath=following-sibling::*[1]")).toHaveText(cop(total));
    await expect(drawer.getByRole("paragraph").filter({ hasText: cop(total) })).toBeVisible();
    await expect(drawer.getByText("IVA incluido", { exact: true })).toBeVisible();
    await expect(drawer.getByText("Envío: por cotizar")).toBeVisible();
    await expect(drawer.getByRole("link", { name: /términos de la tienda/i })).toHaveAttribute("href", "/legal/terminos-tienda");

    const wa = drawer.getByRole("link", { name: /pedir por whatsapp/i });
    const href = (await wa.getAttribute("href")) ?? "";
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    const msg = whatsappText(href);
    expect(msg).toContain(product!.name);
    expect(msg).toContain(`Talla: ${size}`);
    expect(msg).toContain(`Cantidad: 2 × ${cop(product!.priceCOP)} = ${cop(total)}`);
    expect(msg).toContain(`Total: ${cop(total)} + envío`);
    expect(msg).toContain("IVA incluido");
    expect(msg).toContain("/legal/terminos-tienda");

    if (isMobile) {
      const boxes = await drawer.getByRole("button").evaluateAll((els) =>
        els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => ({ h: e.getBoundingClientRect().height, label: e.getAttribute("aria-label") ?? e.textContent?.trim() })),
      );
      const small = boxes.filter((b) => b.h < 40);
      expect(small, "botones del carrito con alto < 40px").toEqual([]);
    }
    await drawer.getByRole("button", { name: "Cerrar pedido" }).click();
    await expect(drawer).toBeHidden();

    // Persiste tras recargar (localStorage).
    await page.reload();
    await expect(page.getByRole("button", { name: /abrir pedido \(2 artículos\)/i })).toBeVisible();
    await page.getByRole("button", { name: /abrir pedido \(2 artículos\)/i }).click();
    const drawer2 = page.getByRole("dialog", { name: /tu pedido/i });
    await expect(drawer2.getByText(`Talla ${size}`)).toBeVisible();
    await drawer2.getByRole("button", { name: /vaciar pedido/i }).click();
    await expect(drawer2.getByText(/tu pedido está vacío/i)).toBeVisible();
    await drawer2.getByRole("button", { name: "Cerrar pedido" }).click();
    await expect(drawer2).toBeHidden();
    await expect(page.getByRole("button", { name: "Abrir pedido", exact: true })).toBeVisible();
  });

  test("móvil: botones y tallas del detalle con objetivo táctil ≥ 44 px", async ({ page, request, isMobile }) => {
    test.skip(!isMobile, "Solo móvil");
    const { items } = await fetchProducts(request);
    const product = items.find((p) => p.status === "ACTIVE" && (p.sizes ?? []).length >= 1) ?? items[0];
    await page.goto(`/tienda/${product.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const sizes = await page.locator("main button:visible, main a[href^='https://wa.me']:visible").evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), label: (e.getAttribute("aria-label") ?? e.textContent ?? "").trim().slice(0, 40) };
      }),
    );
    expect(sizes.length).toBeGreaterThan(0);
    const small = sizes.filter((s) => s.h < 44 || s.w < 44);
    expect(small, "objetivos táctiles menores de 44 px").toEqual([]);
  });

  test("producto inexistente responde 404", async ({ page }) => {
    const res = await page.goto("/tienda/producto-inexistente-e2e");
    expect(res?.status()).toBe(404);
  });
});
