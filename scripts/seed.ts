// Writes SQL that loads the sample deals, for `npm run db:seed:local` and `db:seed:remote`.
// End and found times are counted from the moment this runs, so run it again when the
// sample deals have all ended. Saved favorites survive a re-run.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { sampleDeals } from './sample-deals.ts'

const OUT = 'node_modules/.tmp/seed.sql'
const MS_PER_HOUR = 60 * 60 * 1000

const columns = [
  'id',
  'title',
  'brand',
  'category',
  'store',
  'channel',
  'prefecture',
  'city',
  'original_price',
  'sale_price',
  'ends_at',
  'found_at',
  'rating',
  'reviews',
  'image',
  'url',
  'blurb',
]

const literal = (value: string | number | null) => {
  if (value === null) return 'NULL'
  if (typeof value === 'number') return String(value)
  return `'${value.replaceAll("'", "''")}'`
}

const now = Date.now()
const values = sampleDeals.map((deal) =>
  [
    deal.id,
    deal.title,
    deal.brand,
    deal.category,
    deal.store,
    deal.channel,
    deal.prefecture,
    deal.city,
    deal.originalPrice,
    deal.salePrice,
    now + deal.endsInHours * MS_PER_HOUR,
    now - deal.postedHoursAgo * MS_PER_HOUR,
    deal.rating,
    deal.reviews,
    deal.image,
    deal.url,
    deal.blurb,
  ]
    .map(literal)
    .join(', '),
)

const updates = columns
  .filter((column) => column !== 'id')
  .map((column) => `${column} = excluded.${column}`)
  .join(', ')

const statement = `INSERT INTO deals (${columns.join(', ')}) VALUES\n${values
  .map((row) => `  (${row})`)
  .join(',\n')}\nON CONFLICT(id) DO UPDATE SET ${updates};\n`

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, statement)
console.log(`Wrote ${sampleDeals.length} deals to ${OUT}`)
