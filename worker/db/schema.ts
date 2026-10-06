import { sql } from 'drizzle-orm'
import { index, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { user } from './auth-schema.ts'
import { CATEGORIES, CHANNELS, STORES } from './taxonomy.ts'

// Tables Better Auth needs. Regenerate with `npm run auth:generate` after changing worker/auth.ts.
export * from './auth-schema.ts'

// App tables. The columns follow what the screens show, which is the prototype's dataset.
// Expect them to change when the collector's data model is agreed.
export const deals = sqliteTable(
  'deals',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    brand: text('brand').notNull(),
    category: text('category', { enum: CATEGORIES }).notNull(),
    store: text('store', { enum: STORES }).notNull(),
    channel: text('channel', { enum: CHANNELS }).notNull(),
    // Only set for in-store deals.
    prefecture: text('prefecture'),
    city: text('city'),
    // Prices in JPY, tax included.
    originalPrice: integer('original_price').notNull(),
    salePrice: integer('sale_price').notNull(),
    endsAt: integer('ends_at', { mode: 'timestamp_ms' }).notNull(),
    foundAt: integer('found_at', { mode: 'timestamp_ms' }).notNull(),
    rating: real('rating').notNull(),
    reviews: integer('reviews').notNull(),
    image: text('image').notNull(),
    // The deal's page at the store.
    url: text('url').notNull(),
    blurb: text('blurb').notNull(),
  },
  (table) => [index('deals_ends_at_idx').on(table.endsAt)],
)

export const favorites = sqliteTable(
  'favorites',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    dealId: text('deal_id')
      .notNull()
      .references(() => deals.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.dealId] })],
)
