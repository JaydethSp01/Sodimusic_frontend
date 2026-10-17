#!/usr/bin/env node
/**
 * Lighthouse móvil (rendimiento + accesibilidad) para varias rutas.
 *
 *   node scripts/perf/lighthouse.mjs --base https://sodimusic-frontend.vercel.app --out docs/perf/prod
 *   node scripts/perf/lighthouse.mjs --base http://localhost:3001 --out /tmp/lh-local --routes /,/beats,/tienda
 *
 * Requiere Chrome: usa $CHROME_PATH o /usr/bin/google-chrome. Imprime una tabla
 * Markdown y deja los JSON en --out.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]);
    return acc;
  }, []),
);
const base = (args.base ?? "http://localhost:3000").replace(/\/$/, "");
const out = args.out ?? "./.perf";
const routes = (args.routes ?? "/,/beats,/tienda,/canales").split(",").map((r) => r.trim()).filter(Boolean);
const chrome = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";
mkdirSync(out, { recursive: true });

const kb = (n) => `${Math.round((n ?? 0) / 1024)} kB`;
const rows = [];
for (const route of routes) {
  const name = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_");
  const file = join(out, `${name}.json`);
  const r = spawnSync(
    "npx",
    [
      "-y",
      "lighthouse@12",
      `${base}${route}`,
      "--chrome-flags=--headless=new --no-sandbox",
      "--only-categories=performance,accessibility",
      "--output=json",
      `--output-path=${file}`,
      "--quiet",
    ],
    { stdio: ["ignore", "inherit", "inherit"], env: { ...process.env, CHROME_PATH: chrome } },
  );
  if (r.status !== 0) {
    rows.push({ route, error: `lighthouse exit ${r.status}` });
    continue;
  }
  const j = JSON.parse(readFileSync(file, "utf8"));
  const a = j.audits;
  const res = (t) => a["resource-summary"]?.details?.items?.find((i) => i.resourceType === t)?.transferSize ?? 0;
  rows.push({
    route,
    perf: Math.round(j.categories.performance.score * 100),
    a11y: Math.round(j.categories.accessibility.score * 100),
    fcp: a["first-contentful-paint"].displayValue,
    lcp: a["largest-contentful-paint"].displayValue,
    tbt: a["total-blocking-time"].displayValue,
    cls: a["cumulative-layout-shift"].displayValue,
    si: a["speed-index"].displayValue,
    total: kb(a["total-byte-weight"].numericValue),
    js: kb(res("script")),
    img: kb(res("image")),
    font: kb(res("font")),
  });
}

console.log(`\nLighthouse móvil — ${base}\n`);
console.log("| Ruta | Perf | A11y | FCP | LCP | TBT | CLS | SI | Total | JS | Img | Fuentes |");
console.log("|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const r of rows) {
  if (r.error) {
    console.log(`| ${r.route} | error: ${r.error} |`);
    continue;
  }
  console.log(
    `| ${r.route} | ${r.perf} | ${r.a11y} | ${r.fcp} | ${r.lcp} | ${r.tbt} | ${r.cls} | ${r.si} | ${r.total} | ${r.js} | ${r.img} | ${r.font} |`,
  );
}
