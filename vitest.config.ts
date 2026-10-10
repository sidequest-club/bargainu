import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin'
import { defineConfig } from 'vitest/config'

// API tests run inside the Workers runtime against worker/index.ts, with an empty local D1
// that tests/api/setup.ts migrates. Nothing here reaches .dev.vars or a deployed database.
export default defineConfig(async () => ({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations('drizzle'),
          BETTER_AUTH_URL: 'http://localhost:5173',
          BETTER_AUTH_SECRET: 'api-test-secret-not-used-anywhere-else',
          GOOGLE_CLIENT_ID: 'api-test',
          GOOGLE_CLIENT_SECRET: 'api-test',
        },
      },
    }),
  ],
  test: {
    include: ['tests/api/**/*.test.ts'],
    setupFiles: ['tests/api/setup.ts'],
  },
}))
