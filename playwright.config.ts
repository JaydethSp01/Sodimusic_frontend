import { defineConfig, devices } from "@playwright/test";

/**
 * Suite e2e de Sodimusic (frontend Next.js 14).
 *
 * Requisitos: backend en :4000 con BD de seed y frontend en :3000
 * (o `PLAYWRIGHT_START_SERVERS=1` para que Playwright los levante desde
 * `../Sodimusic_backend` y este directorio).
 *
 * Proyectos:
 * - `setup`: inicia sesión admin una vez y guarda `e2e/.auth/admin.json`.
 * - `chromium`: escritorio, todos los specs (públicos, admin, a11y, visual).
 * - `mobile`: Pixel 7, solo specs públicos + a11y responsive/visual.
 *
 * `baseURL` por defecto es http://localhost:3000 (no 127.0.0.1): NEXTAUTH_URL y
 * el CORS del backend están configurados para `localhost`.
 */
const startServers = process.env.PLAYWRIGHT_START_SERVERS === "1";
const isCI = !!process.env.CI;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const backendHealth = process.env.PLAYWRIGHT_BACKEND_HEALTH_URL ?? "http://localhost:4000/health";

export const ADMIN_STORAGE_STATE = "e2e/.auth/admin.json";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  workers: isCI ? 2 : 3,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled", caret: "hide" },
  },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}",
  use: {
    baseURL,
    locale: "es-CO",
    timezoneId: "America/Bogota",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: [/e2e\/public\/.*\.spec\.ts/, /e2e\/a11y\/(responsive|visual)\.spec\.ts/],
    },
  ],
  webServer: startServers
    ? [
        {
          command: "npm run dev",
          url: backendHealth,
          reuseExistingServer: !isCI,
          timeout: 120_000,
          cwd: "../Sodimusic_backend",
        },
        {
          command: "npm run dev",
          url: baseURL,
          reuseExistingServer: !isCI,
          timeout: 120_000,
          cwd: ".",
        },
      ]
    : undefined,
});
