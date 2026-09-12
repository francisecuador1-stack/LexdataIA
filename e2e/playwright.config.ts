import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for LEXDATA IA.
 *
 * Prerequisites:
 *   - `pnpm dev` running (web on :5173, api on :3000)
 *   - Test database seeded with `pnpm db:reset`
 *
 * Run: `npx playwright test` from the e2e/ directory
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // domain tests have ordering dependencies
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 60_000,

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'es-EC',
    timezoneId: 'America/Guayaquil',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    cwd: '..',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
