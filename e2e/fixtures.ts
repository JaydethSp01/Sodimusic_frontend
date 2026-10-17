import { test as base, expect, request as playwrightRequest, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import path from "node:path";

/* ------------------------------------------------------------------ */
/* Constantes de entorno                                               */
/* ------------------------------------------------------------------ */

/** URL del backend para llamadas desde Node (127.0.0.1 evita la resolución a ::1 de `localhost`). */
export const API_URL = (process.env.PLAYWRIGHT_API_URL ?? "http://127.0.0.1:4000").replace(/\/$/, "");
export const DATABASE_URL =
  process.env.PLAYWRIGHT_DATABASE_URL ?? "postgresql://sodimusic:sodimusic@127.0.0.1:5434/sodimusic";

const SEED_EMAIL = "jeivymusicdinero@gmail.com";
const SEED_PASSWORD = "sodimusic2016";
export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || SEED_EMAIL;
export const ADMIN_PASSWORD =
  process.env.E2E_ADMIN_PASSWORD?.trim() ||
  process.env.ADMIN_PASSWORD?.trim() ||
  (ADMIN_EMAIL.toLowerCase() === SEED_EMAIL ? SEED_PASSWORD : "");

export const ADMIN_STORAGE_STATE = path.resolve(__dirname, ".auth/admin.json");

/** Prefijo común de todos los datos de prueba (facilita la limpieza por SQL/API). */
export const E2E_PREFIX = "E2E";

/** Nombre/correo único por ejecución y test. */
export function uniq(label = "e2e"): string {
  return `${label}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function uniqEmail(label = "e2e"): string {
  return `${uniq(label)}@example.com`.toLowerCase();
}

/* ------------------------------------------------------------------ */
/* API admin del backend                                               */
/* ------------------------------------------------------------------ */

let cachedToken: { value: string; at: number } | null = null;

/** Token JWT del admin (cacheado 10 min por worker). */
export async function getAdminToken(request: APIRequestContext): Promise<string> {
  if (cachedToken && Date.now() - cachedToken.at < 10 * 60_000) return cachedToken.value;
  const res = await request.post(`${API_URL}/api/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  if (!res.ok()) {
    throw new Error(`Login admin por API falló (${res.status()}): ${await res.text()}`);
  }
  const data = (await res.json()) as { token: string };
  cachedToken = { value: data.token, at: Date.now() };
  return data.token;
}

export type AdminApi = {
  get<T = unknown>(path: string): Promise<T>;
  post<T = unknown>(path: string, data?: unknown): Promise<T>;
  patch<T = unknown>(path: string, data?: unknown): Promise<T>;
  delete(path: string): Promise<void>;
  /** Devuelve la respuesta cruda (para asserts de estado). */
  raw(method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE", path: string, data?: unknown): Promise<import("@playwright/test").APIResponse>;
  token: string;
};

export async function createAdminApi(request: APIRequestContext): Promise<AdminApi> {
  const token = await getAdminToken(request);
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const raw: AdminApi["raw"] = (method, p, data) => {
    const url = `${API_URL}${p.startsWith("/") ? p : `/${p}`}`;
    if (method === "GET") return request.get(url, { headers });
    if (method === "DELETE") return request.delete(url, { headers });
    if (method === "POST") return request.post(url, { headers, data });
    if (method === "PUT") return request.put(url, { headers, data });
    return request.patch(url, { headers, data });
  };
  async function parse<T>(res: import("@playwright/test").APIResponse, label: string): Promise<T> {
    if (!res.ok()) throw new Error(`${label} → ${res.status()}: ${await res.text()}`);
    return (await res.json()) as T;
  }
  return {
    token,
    raw,
    get: (p) => raw("GET", p).then((r) => parse(r, `GET ${p}`)),
    post: (p, d) => raw("POST", p, d).then((r) => parse(r, `POST ${p}`)),
    patch: (p, d) => raw("PATCH", p, d).then((r) => parse(r, `PATCH ${p}`)),
    delete: async (p) => {
      const r = await raw("DELETE", p);
      if (!r.ok() && r.status() !== 404) throw new Error(`DELETE ${p} → ${r.status()}: ${await r.text()}`);
    },
  };
}

/* ------------------------------------------------------------------ */
/* Limpieza por SQL (psql) para tablas sin endpoint de borrado         */
/* ------------------------------------------------------------------ */

/** Ejecuta SQL contra la BD local con `psql`. Devuelve stdout (filas separadas por "\n"). */
export function sql(query: string): string {
  try {
    return execFileSync("psql", [DATABASE_URL, "-Atq", "-v", "ON_ERROR_STOP=1", "-c", query], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (err) {
    const e = err as { stderr?: string; message?: string };
    throw new Error(`psql falló: ${e.stderr ?? e.message}`);
  }
}

function sqlLiteral(v: string): string {
  return `'${v.replace(/'/g, "''")}'`;
}

export const cleanup = {
  subscriber(email: string) {
    sql(`DELETE FROM "Subscriber" WHERE lower(email) = lower(${sqlLiteral(email)})`);
  },
  contactMessagesByEmail(email: string) {
    sql(`DELETE FROM "ContactMessage" WHERE lower(email) = lower(${sqlLiteral(email)})`);
  },
  beatInterestsByEmail(email: string) {
    sql(`DELETE FROM "BeatInterest" WHERE lower(email) = lower(${sqlLiteral(email)})`);
  },
  bookingSessionsByEmail(email: string) {
    sql(`DELETE FROM "BookingSession" WHERE lower("artistEmail") = lower(${sqlLiteral(email)})`);
  },
  /** Borra cualquier resto de ejecuciones anteriores (prefijo E2E) en tablas de CRM. */
  staleCrm() {
    sql(`DELETE FROM "Subscriber" WHERE email LIKE 'e2e-%@example.com'`);
    sql(`DELETE FROM "ContactMessage" WHERE email LIKE 'e2e-%@example.com'`);
    sql(`DELETE FROM "BeatInterest" WHERE email LIKE 'e2e-%@example.com'`);
    sql(`DELETE FROM "BookingSession" WHERE "artistEmail" LIKE 'e2e-%@example.com'`);
  },
};

/* ------------------------------------------------------------------ */
/* Helpers de UI                                                       */
/* ------------------------------------------------------------------ */

/**
 * Los formularios del admin usan `<Label>` sin `htmlFor` seguido del control:
 * `<div><label>Título</label><input/></div>`. Este helper devuelve el control
 * que sigue a la etiqueta con texto exacto.
 */
export function fieldByLabel(scope: Locator | Page, label: string): Locator {
  const safe = label.replace(/"/g, '\\"');
  return scope
    .locator(`xpath=.//label[normalize-space(.)="${safe}"]/following-sibling::*[self::input or self::textarea or self::select][1]`)
    .first();
}

/** Igual que `fieldByLabel` pero para controles anidados un nivel más abajo (p. ej. dentro de un div). */
export function fieldInputNear(scope: Locator | Page, label: string): Locator {
  const safe = label.replace(/"/g, '\\"');
  return scope
    .locator(`xpath=.//label[normalize-space(.)="${safe}"]/following-sibling::*[1]//*[self::input or self::textarea or self::select][1]`)
    .first();
}

/** Espera el toast de sonner con el texto indicado. */
/** (20 s: las server actions + `router.refresh()` pueden tardar con el dev server cargado.) */
export async function expectToast(page: Page, text: string | RegExp, timeout = 20_000): Promise<void> {
  await expect(page.locator("[data-sonner-toast]").filter({ hasText: text }).first()).toBeVisible({ timeout });
}

/** PNG 1×1 transparente válido (para subidas). */
export const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

/** Decodifica el texto de una URL `wa.me/...?text=`. */
export function whatsappText(href: string): string {
  const u = new URL(href);
  return decodeURIComponent(u.searchParams.get("text") ?? "");
}

/** Primer día hábil (no domingo) a partir de hoy + `offsetDays`. */
export function futureBookingDate(offsetDays = 5): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  while (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return d;
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

type Fixtures = {
  /** Cliente de la API admin (token cacheado). */
  adminApi: AdminApi;
};

export const test = base.extend<Fixtures>({
  adminApi: async ({ request }, use) => {
    const api = await createAdminApi(request);
    await use(api);
  },
});

/** Cliente de API fuera del ciclo de un test (p. ej. en `beforeAll`). */
export async function standaloneAdminApi(): Promise<{ api: AdminApi; dispose: () => Promise<void> }> {
  const ctx = await playwrightRequest.newContext();
  const api = await createAdminApi(ctx);
  return { api, dispose: () => ctx.dispose() };
}

export { expect };
