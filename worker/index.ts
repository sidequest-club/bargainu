import { env } from 'cloudflare:workers'
import { and, desc, eq, gt, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { createAuth } from './auth.ts'
import { createDb } from './db/index.ts'
import { deals, favorites } from './db/schema.ts'

const db = createDb(env.DB)
const auth = createAuth(env, db)

const app = new Hono()
  .basePath('/api')
  .on(['GET', 'POST'], '/auth/*', (c) => auth.handler(c.req.raw))
  .get('/health', async (c) => {
    await db.run(sql`select 1`)
    return c.json({ ok: true, database: 'ok' })
  })
  .get('/me', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    return c.json({ user: session?.user ?? null })
  })
  // Every deal that has not ended, newest find first. The app filters and sorts the list itself.
  .get('/deals', async (c) => {
    const now = new Date()
    const rows = await db
      .select()
      .from(deals)
      .where(gt(deals.endsAt, now))
      .orderBy(desc(deals.foundAt), deals.id)
    return c.json({
      now: now.getTime(),
      deals: rows.map((row) => ({
        ...row,
        endsAt: row.endsAt.getTime(),
        foundAt: row.foundAt.getTime(),
      })),
    })
  })
  // Ids of the signed-in user's saved deals, newest first.
  .get('/favorites', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Sign in first' }, 401)
    const rows = await db
      .select({ dealId: favorites.dealId })
      .from(favorites)
      .where(eq(favorites.userId, session.user.id))
      .orderBy(desc(favorites.createdAt))
    return c.json({ dealIds: rows.map((row) => row.dealId) })
  })
  .put('/favorites/:dealId', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Sign in first' }, 401)
    const dealId = c.req.param('dealId')
    const [deal] = await db.select({ id: deals.id }).from(deals).where(eq(deals.id, dealId))
    if (!deal) return c.json({ error: 'No such deal' }, 404)
    await db.insert(favorites).values({ userId: session.user.id, dealId }).onConflictDoNothing()
    return c.json({ ok: true })
  })
  .delete('/favorites/:dealId', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Sign in first' }, 401)
    await db
      .delete(favorites)
      .where(
        and(eq(favorites.userId, session.user.id), eq(favorites.dealId, c.req.param('dealId'))),
      )
    return c.json({ ok: true })
  })

// The React app imports this type to get typed API calls (src/lib/api.ts).
export type AppType = typeof app

export default app
