import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema.ts'

// A factory, so scripts/dev-session.ts can build one in Node, where `cloudflare:workers`
// cannot be imported. The Worker makes its one instance in worker/index.ts.
export const createDb = (d1: D1Database) => drizzle(d1, { schema })

export type Db = ReturnType<typeof createDb>
