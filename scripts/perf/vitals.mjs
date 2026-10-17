#!/usr/bin/env node
/**
 * Fallback sin Lighthouse: mide LCP, CLS, TTFB y bytes transferidos por ruta
 * con Playwright (Chromium, emulación móvil, red "Slow 4G" aproximada).
 *
 *   node scripts/perf/vitals.mjs --base http://localhost:3001 --routes /,/beats,/tienda
 *
 * Usa `playwright` (dependencia de @playwright/test) y el Chromium ya instalado
 * en ~/.cache/ms-playwright.
 */
import { chromium, devices } from "playwright";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]);
    return acc;
  }, []),
);
const base = (args.base ?? "http://localhost:3000").replace(/\/$/, "");
const routes = (args.routes ?? "/,/beats,/tienda,/canales").split(",").map((r) => r.trim()).filter(Boolean);
const runs = Number(args.runs ?? 1);

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const kb = (n) => `${Math.round(n / 1024)} kB`;
const rows = [];

for (const route of routes) {
  const samples = [];
  for (let i = 0; i < runs; i++) {
    const context = await browser.newContext({ ...devices["Pixel 5"] });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    const bytes = { total: 0, script: 0, image: 0, font: 0, document: 0, stylesheet: 0 };
    cdp.on("Network.loadingFinished", (e) => {
      bytes.total += e.encodedDataLength;
      const t = (types.get(e.requestId) ?? "other").toLowerCase();
      if (t in bytes) bytes[t] += e.encodedDataLength;
    });
    const types = new Map();
    cdp.on("Network.responseReceived", (e) => types.set(e.requestId, e.type));

    await page.addInitScript(() => {
      window.__vitals = { lcp: 0, cls: 0 };
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__vitals.lcp = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__vitals.cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    const t0 = Date.now();
    await page.goto(`${base}${route}`, { waitUntil: "networkidle", timeout: 90_000 });
    await page.waitForTimeout(1500);
    const v = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      return { ...window.__vitals, ttfb: nav?.responseStart ?? 0, domContentLoaded: nav?.domContentLoadedEventEnd ?? 0 };
    });
    samples.push({ ...v, ...bytes, wall: Date.now() - t0 });
    await context.close();
  }
  const med = (k) => {
    const s = samples.map((x) => x[k]).sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };
  rows.push({
    route,
    ttfb: `${Math.round(med("ttfb"))} ms`,
    lcp: `${Math.round(med("lcp"))} ms`,
    cls: med("cls").toFixed(3),
    total: kb(med("total")),
    js: kb(med("script")),
    img: kb(med("image")),
    font: kb(med("font")),
  });
}
await browser.close();

console.log(`\nPlaywright vitals (Pixel 5, ~Slow 4G, CPU x4) — ${base}\n`);
console.log("| Ruta | TTFB | LCP | CLS | Total | JS | Img | Fuentes |");
console.log("|---|---|---|---|---|---|---|---|");
for (const r of rows) console.log(`| ${r.route} | ${r.ttfb} | ${r.lcp} | ${r.cls} | ${r.total} | ${r.js} | ${r.img} | ${r.font} |`);
