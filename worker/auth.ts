import { betterAuth } from 'better-auth'
import type { BetterAuthOptions } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import type { Db } from './db/index.ts'
import * as schema from './db/schema.ts'

export type AuthEnv = Pick<
  Env,
  'BETTER_AUTH_URL' | 'BETTER_AUTH_SECRET' | 'GOOGLE_CLIENT_ID' | 'GOOGLE_CLIENT_SECRET'
>

// Google is the only way to sign in. Password sign-in stays off: its hashing is too
// CPU-heavy for the Workers free plan.
export const authOptions = (env: AuthEnv, db: Db) =>
  ({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'sqlite', schema }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
  }) satisfies BetterAuthOptions

// A factory for the same reason as createDb. scripts/dev-session.ts reuses authOptions so
// its sessions are signed and named exactly as the Worker expects.
export const createAuth = (env: AuthEnv, db: Db) => betterAuth(authOptions(env, db))
