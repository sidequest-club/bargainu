import { sql } from 'drizzle-orm'
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { check, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { user } from './auth-schema.ts'
import { CATEGORIES, STORES } from './taxonomy.ts'

// Tables Better Auth needs. Regenerate with `npm run auth:generate` after changing worker/auth.ts.
export * from './auth-schema.ts'

export const PROMOTION_KINDS = ['sale', 'points'] as const

// The collector writes straight to D1, so the database itself refuses values outside our lists.
// DDL cannot take bound parameters, hence the inlined literals.
const oneOf = (column: AnySQLiteColumn, values: readonly string[]) =>
  sql`${column} in (${sql.raw(values.map((value) => `'${value}'`).join(', '))})`

// The model in docs/architecture/data-model.md. Change that file with this one.
export const shops = sqliteTable(
  'shops',
  {
    code: text('code').primaryKey(),
    store: text('store', { enum: STORES }).notNull(),
    name: text('name').notNull(),
  },
  (table) => [check('shops_store', oneOf(table.store, STORES))],
)

export const deals = sqliteTable(
  'deals',
  {
    id: text('id').primaryKey(),
    shopCode: text('shop_code')
      .notNull()
      .references(() => shops.code),
    category: text('category', { enum: CATEGORIES }).notNull(),
    title: text('title').notNull(),
    blurb: text('blurb').notNull(),
    image: text('image').notNull(),
    // The deal's page at the store.
    url: text('url').notNull(),
    // JPY, tax included.
    price: integer('price'),
    fetchedAt: integer('fetched_at', { mode: 'timestamp_ms' }).notNull(),
    foundAt: integer('found_at', { mode: 'timestamp_ms' }).notNull(),
    rating: real('rating').notNull(),
    reviews: integer('reviews').notNull(),
  },
  (table) => [check('deals_category', oneOf(table.category, CATEGORIES))],
)

// Why an item is a deal: one row per reason.
export const promotions = sqliteTable(
  'promotions',
  {
    dealId: text('deal_id')
      .notNull()
      .references(() => deals.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: PROMOTION_KINDS }).notNull(),
    // Null only for points with no end date.
    endsAt: integer('ends_at', { mode: 'timestamp_ms' }),
    pointRate: integer('point_rate'),
  },
  (table) => [
    primaryKey({ columns: [table.dealId, table.kind] }),
    check('promotions_kind', oneOf(table.kind, PROMOTION_KINDS)),
    check('promotions_sale_ends', sql`${table.kind} <> 'sale' or ${table.endsAt} is not null`),
    check('promotions_points_rate', sql`${table.kind} <> 'points' or ${table.pointRate} > 1`),
  ],
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
