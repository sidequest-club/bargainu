import { expect, test } from 'vitest'
import { toDeals } from '../../src/lib/catalog.ts'
import { byEnding } from '../../src/lib/format.ts'

const HOUR = 60 * 60 * 1000
const NOW = Date.UTC(2026, 9, 15, 1, 17)

type Promotion = { kind: 'sale' | 'points'; endsAt: number | null; pointRate: number | null }

// The shape GET /api/deals sends: endsAt is the latest end, or null if any promotion has none.
const apiDeal = (id: string, promotions: Promotion[]) => {
  const ends = promotions.map((p) => p.endsAt ?? Infinity)
  const latest = Math.max(...ends)
  return {
    id,
    shopCode: 'shop',
    category: 'Shoes' as const,
    title: id,
    blurb: '',
    image: '',
    url: 'https://item.rakuten.co.jp/shop/item/',
    price: 1000,
    rating: 4,
    reviews: 10,
    shopName: 'Shop',
    store: 'Rakuten' as const,
    promotions,
    endsAt: latest === Infinity ? null : latest,
    fetchedAt: NOW - HOUR,
    foundAt: NOW - 3 * HOUR,
  }
}

const deals = toDeals({
  now: NOW,
  deals: [
    apiDeal('points-only', [{ kind: 'points', endsAt: null, pointRate: 5 }]),
    apiDeal('sale-only', [{ kind: 'sale', endsAt: NOW + 30 * HOUR, pointRate: null }]),
    apiDeal('sale-and-open-points', [
      { kind: 'sale', endsAt: NOW + 2 * HOUR, pointRate: null },
      { kind: 'points', endsAt: null, pointRate: 10 },
    ]),
  ],
})
const byId = Object.fromEntries(deals.map((deal) => [deal.id, deal]))

test('a deal counts down to its soonest promotion end', () => {
  expect(byId['sale-only'].endsInHours).toBe(30)
  // The sale still ends in two hours, though the points next to it have no end.
  expect(byId['sale-and-open-points'].endsInHours).toBe(2)
  expect(byId['points-only'].endsInHours).toBeNull()
})

test('a deal carries its highest point rate, or none', () => {
  expect(byId['sale-and-open-points'].pointRate).toBe(10)
  expect(byId['points-only'].pointRate).toBe(5)
  expect(byId['sale-only'].pointRate).toBeNull()
})

test('ending soonest puts deals with no end last', () => {
  expect(deals.toSorted(byEnding).map((deal) => deal.id)).toEqual([
    'sale-and-open-points',
    'sale-only',
    'points-only',
  ])
})
