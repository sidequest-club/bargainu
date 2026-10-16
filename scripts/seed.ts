// Writes SQL that loads the sample deals, for `npm run db:seed:local` and `db:seed:remote`.
// End and found times are counted from the moment this runs, so run it again when the
// sample deals have all ended. Saved favorites survive a re-run.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { sampleDeals, slug } from './sample-deals.ts'

const OUT = 'node_modules/.tmp/seed.sql'
const MS_PER_HOUR = 60 * 60 * 1000

type Value = string | number | null

const literal = (value: Value) => {
  if (value === null) return 'NULL'
  if (typeof value === 'number') return String(value)
  return `'${value.replaceAll("'", "''")}'`
}

/** One upsert for the table; every column outside the key is overwritten. */
const upsert = (table: string, key: string[], rows: Record<string, Value>[]) => {
  const columns = Object.keys(rows[0])
  const updates = columns
    .filter((column) => !key.includes(column))
    .map((column) => `${column} = excluded.${column}`)
    .join(', ')
  const values = rows.map(
    (row) => `  (${columns.map((column) => literal(row[column])).join(', ')})`,
  )
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n${values.join(',\n')}\nON CONFLICT(${key.join(', ')}) DO UPDATE SET ${updates};\n`
}

// The samples have invented brands, not shops, so each brand stands in for a shop.
const shopCode = (deal: (typeof sampleDeals)[number]) =>
  `${deal.store.toLowerCase()}-${slug(deal.brand)}`

const now = Date.now()
const shops = new Map(
  sampleDeals.map((deal) => [
    shopCode(deal),
    { code: shopCode(deal), store: deal.store, name: deal.brand },
  ]),
)
const deals = sampleDeals.map((deal) => ({
  id: deal.id,
  shop_code: shopCode(deal),
  category: deal.category,
  title: deal.title,
  blurb: deal.blurb,
  image: deal.image,
  url: deal.url,
  price: deal.salePrice,
  fetched_at: now,
  found_at: now - deal.postedHoursAgo * MS_PER_HOUR,
  rating: deal.rating,
  reviews: deal.reviews,
}))
// A mix of the reasons a real deal has (decision 7): mostly sales, some with boosted points on
// top, and some with points alone that have no end date.
const POINT_RATES = [2, 3, 5, 10, 20]
const promotions = sampleDeals.flatMap((deal, i): Record<string, Value>[] => {
  const endsAt = now + deal.endsInHours * MS_PER_HOUR
  const pointRate = POINT_RATES[i % POINT_RATES.length]
  const sale = { deal_id: deal.id, kind: 'sale', ends_at: endsAt, point_rate: null }
  if (i % 5 === 4)
    return [{ deal_id: deal.id, kind: 'points', ends_at: null, point_rate: pointRate }]
  if (i % 3 === 0)
    return [sale, { deal_id: deal.id, kind: 'points', ends_at: endsAt, point_rate: pointRate }]
  return [sale]
})

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(
  OUT,
  [
    upsert('shops', ['code'], [...shops.values()]),
    upsert('deals', ['id'], deals),
    upsert('promotions', ['deal_id', 'kind'], promotions),
  ].join('\n'),
)
console.log(`Wrote ${sampleDeals.length} deals from ${shops.size} shops to ${OUT}`)
