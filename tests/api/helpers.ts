import { env, SELF } from 'cloudflare:test'
import { betterAuth } from 'better-auth'
import { testUtils } from 'better-auth/plugins'
import { authOptions } from '../../worker/auth.ts'
import { createDb } from '../../worker/db/index.ts'
import { deals, favorites, session, user } from '../../worker/db/schema.ts'

export const db = createDb(env.DB)

const HOUR = 60 * 60 * 1000

/** Calls the Worker the way a browser would. `path` starts with /api. */
export const request = (path: string, init?: RequestInit) =>
  SELF.fetch(`${env.BETTER_AUTH_URL}${path}`, init)

/** Empties the tables the tests write to. The database outlives a single test. */
export async function resetDb() {
  await db.delete(favorites)
  await db.delete(deals)
  await db.delete(session)
  await db.delete(user)
}

/** Inserts a deal that ends in a day unless told otherwise, and returns its id. */
export async function insertDeal(id: string, overrides: Partial<typeof deals.$inferInsert> = {}) {
  await db.insert(deals).values({
    id,
    title: `Deal ${id}`,
    brand: 'Hayate',
    category: 'Shoes',
    store: 'Rakuten',
    channel: 'online',
    originalPrice: 10000,
    salePrice: 7000,
    endsAt: new Date(Date.now() + 24 * HOUR),
    foundAt: new Date(Date.now() - HOUR),
    rating: 4.5,
    reviews: 12,
    image: 'https://example.invalid/deal.jpg',
    url: 'https://example.invalid/deal',
    blurb: 'A test deal.',
    ...overrides,
  })
  return id
}

// Google sign-in cannot be scripted, so the session is written with Better Auth's testUtils
// plugin on top of the Worker's own auth options, as scripts/dev-session.ts does. The Worker
// under test has no such plugin; it only reads the cookie.
const testAuth = betterAuth({ ...authOptions(env, db), plugins: [testUtils()] })

/** Creates a user and a session for them. Pass `headers` to `request` to act as that user. */
export async function signIn(name: string) {
  const { test } = await testAuth.$context
  const saved = await test.saveUser(
    test.createUser({ name, email: `${name}@example.invalid`, emailVerified: true }),
  )
  const { cookies } = await test.login({ userId: saved.id })
  const cookie = cookies.map(({ name, value }) => `${name}=${value}`).join('; ')
  return { id: saved.id, headers: { cookie } }
}
