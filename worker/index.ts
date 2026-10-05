import { sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { auth } from './auth'
import { db } from './db'

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

// The React app imports this type to get typed API calls (src/lib/api.ts).
export type AppType = typeof app

export default app
