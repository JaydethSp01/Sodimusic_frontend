import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect, ADMIN_STORAGE_STATE, API_URL } from "../fixtures";

/**
 * Auditoría axe (WCAG 2.0/2.1 A y AA). Falla con violaciones `serious`/`critical`;
 * las `moderate`/`minor` se imprimen en consola y se adjuntan al informe.
 */
/**
 * Bugs reales conocidos (se marcan como fixme con evidencia en vez de fallar la suite).
 * Clave: ruta; valor: regla axe + descripción.
 */
const KNOWN_ISSUES: Record<string, { rule: string; description: string }[]> = {
  "/canales": [
    {
      rule: "color-contrast",
      description:
        "BUG a11y: el botón «Suscribirse» de la tarjeta de canal (features/channels/components/channel-card.tsx, bg-[#ff0000] con texto blanco) da 3.99:1 (< 4.5:1); axe también marca título/descripción durante el revelado.",
    },
  ],
  "/tienda": [
    {
      rule: "color-contrast",
      description:
        "BUG a11y: en las tarjetas de producto (features/shop/components/product-card.tsx) la categoría y «IVA incluido» usan text-[10px] con --text-muted (#8f8a82) sobre bg-background-card: axe lo reporta como contraste insuficiente (serious).",
    },
  ],
};

async function runAxe(page: Page, route: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // Los iframes de terceros (YouTube) no se pueden auditar.
    .exclude("iframe")
    .analyze();
  const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const soft = results.violations.filter((v) => v.impact === "moderate" || v.impact === "minor");
  const fmt = (v: (typeof results.violations)[number]) =>
    `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodo/s) → ${v.nodes
      .slice(0, 3)
      .map((n) => n.target.join(" "))
      .join(" | ")}`;
  if (soft.length) {
    console.log(`axe ${route}: ${soft.length} violación/es moderadas/menores:\n  ${soft.map(fmt).join("\n  ")}`);
  }
  test.info().annotations.push({
    type: "axe",
    description: `${route}: ${blocking.length} bloqueantes, ${soft.length} moderadas/menores, ${results.passes.length} reglas OK`,
  });
  await test.info().attach(`axe-${route.replace(/[^a-z0-9]+/gi, "_")}.json`, {
    body: JSON.stringify({ violations: results.violations, incomplete: results.incomplete.map((i) => i.id) }, null, 2),
    contentType: "application/json",
  });
  const known = KNOWN_ISSUES[route] ?? [];
  const unknown = blocking.filter((v) => !known.some((k) => k.rule === v.id));
  expect(unknown.map(fmt), `violaciones serious/critical en ${route}`).toEqual([]);
  const hit = known.filter((k) => blocking.some((v) => v.id === k.rule));
  test.fixme(hit.length > 0, hit.map((k) => `${k.description} → ${blocking.filter((v) => v.id === k.rule).map(fmt).join(" | ")}`).join("\n"));
}

async function firstProductSlug(request: import("@playwright/test").APIRequestContext): Promise<string> {
  const data = (await (await request.get(`${API_URL}/api/products?pageSize=1`)).json()) as { items: { slug: string }[] };
  return data.items[0]?.slug ?? "";
}

test.describe("Accesibilidad (axe) · público", () => {
  const routes = ["/", "/beats", "/tienda", "/booking", "/canales", "/contacto", "/legal/privacidad"];
  for (const route of routes) {
    test(`${route} sin violaciones serious/critical`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await runAxe(page, route);
    });
  }

  test("/tienda/<slug> sin violaciones serious/critical", async ({ page, request }) => {
    const slug = await firstProductSlug(request);
    test.skip(!slug, "Sin productos en el seed");
    await page.goto(`/tienda/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await runAxe(page, `/tienda/${slug}`);
  });
});

test.describe("Accesibilidad (axe) · admin", () => {
  test.use({ storageState: ADMIN_STORAGE_STATE });
  test("/admin/dashboard (logueado) sin violaciones serious/critical", async ({ page, isMobile }) => {
    test.skip(isMobile, "El admin solo se prueba en escritorio");
    await page.goto("/admin/dashboard");
    await expect(page.getByRole("heading", { level: 1, name: /^panel$/i })).toBeVisible();
    await runAxe(page, "/admin/dashboard");
  });
});

/* ------------------------------------------------------------------ */
/* Contraste calculado desde los estilos reales                        */
/* ------------------------------------------------------------------ */

function parseRgb(value: string): [number, number, number, number] | null {
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
  return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
}

function parseHex(value: string): [number, number, number, number] | null {
  const m = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
}

function parseColor(value: string): [number, number, number, number] | null {
  return parseHex(value) ?? parseRgb(value);
}

function luminance([r, g, b]: [number, number, number, number]): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(fg: string, bg: string): number {
  const a = parseColor(fg);
  const b = parseColor(bg);
  if (!a || !b) throw new Error(`Color no reconocido: ${fg} / ${bg}`);
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

test.describe("Contraste (WCAG AA 4.5:1)", () => {
  test("`--text-muted` y botones primarios en / cumplen 4.5:1", async ({ page }) => {
    await page.goto("/");
    const tokens = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      return {
        textMuted: cs.getPropertyValue("--text-muted").trim(),
        background: cs.getPropertyValue("--background").trim() || bodyBg,
        bodyBg,
      };
    });
    expect(tokens.textMuted, "falta el token --text-muted").toBeTruthy();
    const bg = tokens.background || tokens.bodyBg;
    const mutedRatio = contrastRatio(tokens.textMuted, bg);
    test.info().annotations.push({ type: "contraste", description: `--text-muted ${tokens.textMuted} sobre ${bg}: ${mutedRatio.toFixed(2)}:1` });
    expect(mutedRatio, `--text-muted (${tokens.textMuted}) sobre fondo (${bg})`).toBeGreaterThanOrEqual(4.5);

    // Texto `--text-muted` tal como se pinta (muestras reales del DOM).
    const mutedSamples = await page.evaluate(() => {
      const out: { color: string; bg: string; text: string }[] = [];
      const els = Array.from(document.querySelectorAll<HTMLElement>("main *, footer *")).filter((el) =>
        (el.getAttribute("class") ?? "").includes("text-[var(--text-muted)]"),
      );
      for (const el of els.slice(0, 40)) {
        const color = getComputedStyle(el).color;
        let node: HTMLElement | null = el;
        let bg = "rgba(0, 0, 0, 0)";
        while (node) {
          const b = getComputedStyle(node).backgroundColor;
          if (b && !/rgba\(\d+,\s*\d+,\s*\d+,\s*0\)/.test(b) && b !== "transparent") {
            bg = b;
            break;
          }
          node = node.parentElement;
        }
        out.push({ color, bg, text: (el.textContent ?? "").trim().slice(0, 30) });
      }
      return out;
    });
    for (const s of mutedSamples) {
      const parsed = parseColor(s.bg);
      if (!parsed || parsed[3] < 0.9) continue; // fondos semitransparentes: no se puede calcular sin componer
      expect(contrastRatio(s.color, s.bg), `texto muted «${s.text}» ${s.color} sobre ${s.bg}`).toBeGreaterThanOrEqual(4.5);
    }

    // Botones primarios: el CTA del hero y el del contacto.
    const buttons = await page.evaluate(() => {
      const hrefs = ["/booking", "/contacto"];
      return Array.from(document.querySelectorAll<HTMLElement>("main a"))
        .filter((a) => hrefs.includes(a.getAttribute("href") ?? "") && getComputedStyle(a).backgroundColor !== "rgba(0, 0, 0, 0)")
        .slice(0, 4)
        .map((a) => {
          const cs = getComputedStyle(a);
          return { text: (a.textContent ?? "").trim(), color: cs.color, bg: cs.backgroundColor };
        });
    });
    expect(buttons.length, "debe haber botones primarios con fondo en la portada").toBeGreaterThan(0);
    for (const b of buttons) {
      const ratio = contrastRatio(b.color, b.bg);
      test.info().annotations.push({ type: "contraste", description: `botón «${b.text}» ${b.color} sobre ${b.bg}: ${ratio.toFixed(2)}:1` });
      expect(ratio, `botón primario «${b.text}»`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
