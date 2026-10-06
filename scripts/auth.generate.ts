// Config for the Better Auth CLI only (`npm run auth:generate`). The real config in
// worker/auth.ts imports `cloudflare:workers`, which Node cannot load, so the CLI reads this
// copy instead. Keep the options that affect the schema (plugins, providers) in step with it.
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

export const auth = betterAuth({
  baseURL: 'http://localhost:5173',
  database: drizzleAdapter({} as never, { provider: 'sqlite' }),
  socialProviders: { google: { clientId: 'cli', clientSecret: 'cli' } },
})
