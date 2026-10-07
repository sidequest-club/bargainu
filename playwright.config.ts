import { defineConfig, devices } from '@playwright/test'

// End-to-end tests drive the local app (`npm run dev`) in a browser, signed in as the
// dev:session test user. They use the local database only; see tests/e2e/global-setup.ts.
const ORIGIN = 'http://localhost:5173'

export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: ORIGIN,
    // Written by `npm run dev:session`, which global-setup runs.
    storageState: '.dev-session/storage-state.json',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: ORIGIN,
    reuseExistingServer: !process.env.CI,
  },
})
