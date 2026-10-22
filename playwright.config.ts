import { defineConfig, devices } from '@playwright/test';
const port = process.env.PORT ?? '3100';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1,
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: `npm run start -- --port ${port}`, url: baseURL, reuseExistingServer: !process.env.CI, timeout: 60000 }
});
