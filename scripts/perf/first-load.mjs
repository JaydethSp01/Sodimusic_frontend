// First Load JS real por ruta pública: unión de los chunks JS de /layout + /(public)/layout + la página
// (la tabla de `next build` NO suma los chunks propios de los layouts). Requiere un `next build` previo.
// Uso: node scripts/perf/first-load.mjs [--chunks]
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const root = process.cwd();
const m = JSON.parse(readFileSync(join(root, ".next/app-build-manifest.json"), "utf8")).pages;
const gz = (f) => gzipSync(readFileSync(join(root, ".next", f))).length / 1024;
const js = (files) => files.filter((f) => f.endsWith(".js"));
const sizeOf = (files) => js(files).reduce((a, f) => a + gz(f), 0);
const union = (...keys) => [...new Set(keys.flatMap((k) => m[k] ?? []))];

const layouts = ["/layout", "/(public)/layout"];
console.log(`entry /layout: ${sizeOf(m["/layout"]).toFixed(1)} kB gz · entry /(public)/layout: ${sizeOf(m["/(public)/layout"]).toFixed(1)} kB gz`);
console.log("ruta                      real (layouts+page)   solo página (tabla next build)");
for (const key of Object.keys(m).filter((k) => k.startsWith("/(public)/") && k.endsWith("/page")).sort()) {
  const route = key.replace("/(public)", "").replace(/\/page$/, "") || "/";
  console.log(`${route.padEnd(26)}${sizeOf(union(...layouts, key)).toFixed(1).padStart(8)} kB${sizeOf(m[key]).toFixed(1).padStart(18)} kB`);
}
if (process.argv.includes("--chunks")) {
  for (const k of [...layouts, "/(public)/page"]) {
    console.log(`\n== ${k}`);
    for (const f of js(m[k] ?? [])) console.log(`  ${gz(f).toFixed(1).padStart(6)} kB  ${f}`);
  }
}
