import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración E2E. Playwright arranca el frontend (o reutiliza el `yarn dev` que ya esté
 * corriendo). No hay backend que levantar: la app es 100% cliente.
 * Variables: PLAYWRIGHT_BASE_URL para apuntar a otro host.
 */
/**
 * Con PLAYWRIGHT_BASE_URL apuntás a un servidor que ya está corriendo y no se levanta otro:
 * Next 16 se niega a arrancar un segundo dev server del mismo directorio, así que sin esto
 * la suite no corre si tenés `yarn dev` abierto.
 */
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
    testDir: './e2e',
    // Los specs e2e llevan sufijo `.e2e.ts` para que Vitest nunca los recoja
    // (su patrón es *.test / *.spec).
    testMatch: '**/*.e2e.ts',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    reporter: 'list',
    use: {
        baseURL: externalBaseUrl ?? 'http://localhost:3100',
        trace: 'on-first-retry',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: externalBaseUrl
        ? undefined
        : {
              // Puerto propio a propósito: en el 3000 suele haber otro proyecto del workspace
              // y `reuseExistingServer` correría toda la suite contra la app equivocada.
              command: 'yarn dev --port 3100',
              url: 'http://localhost:3100',
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
          },
});
