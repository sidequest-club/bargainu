import { beforeEach, expect, test } from 'vitest'
import { insertDeal, request, resetDb } from './helpers.ts'

const HOUR = 60 * 60 * 1000

type DealsBody = {
  now: number
  deals: {
    id: string
    shopName: string
    store: string
    endsAt: number | null
    fetchedAt: number
    foundAt: number
    promotions: { kind: string; endsAt: number | null; pointRate: number | null }[]
  }[]
}

const listDeals = async () => (await request('/api/deals')).json<DealsBody>()

beforeEach(resetDb)

test('lists the deals with a promotion that has not ended, newest find first', async () => {
  const now = Date.now()
  await insertDeal('found-earlier', { foundAt: new Date(now - 5 * HOUR) })
  await insertDeal('found-later', { foundAt: new Date(now - HOUR) })
  await insertDeal('ended', { foundAt: new Date(now) }, [
    { kind: 'sale', endsAt: new Date(now - HOUR) },
  ])

  const response = await request('/api/deals')
  const body = await response.json<DealsBody>()

  expect(response.status).toBe(200)
  expect(body.deals.map((deal) => deal.id)).toEqual(['found-later', 'found-earlier'])
})

test('sends times as milliseconds, with the time the list was made', async () => {
  const endsAt = new Date(Date.now() + 3 * HOUR)
  const fetchedAt = new Date(Date.now() - HOUR)
  const foundAt = new Date(Date.now() - 2 * HOUR)
  await insertDeal('timed', { fetchedAt, foundAt }, [{ kind: 'sale', endsAt }])

  const before = Date.now()
  const body = await listDeals()

  expect(body.deals[0]).toMatchObject({
    endsAt: endsAt.getTime(),
    fetchedAt: fetchedAt.getTime(),
    foundAt: foundAt.getTime(),
    shopName: 'Hayate',
    store: 'Rakuten',
  })
  expect(body.now).toBeGreaterThanOrEqual(before)
  expect(body.now).toBeLessThanOrEqual(Date.now())
})

test('a deal ends with its longest active promotion, and ended ones are left out', async () => {
  const now = Date.now()
  await insertDeal('two-reasons', {}, [
    { kind: 'sale', endsAt: new Date(now + 2 * HOUR) },
    { kind: 'points', endsAt: new Date(now + 5 * HOUR), pointRate: 5 },
  ])
  await insertDeal('sale-over', {}, [
    { kind: 'sale', endsAt: new Date(now - HOUR) },
    { kind: 'points', endsAt: new Date(now + HOUR), pointRate: 2 },
  ])

  const body = await listDeals()
  const byId = Object.fromEntries(body.deals.map((deal) => [deal.id, deal]))

  expect(byId['two-reasons'].endsAt).toBe(now + 5 * HOUR)
  expect(byId['two-reasons'].promotions).toHaveLength(2)
  expect(byId['sale-over'].promotions).toEqual([
    { kind: 'points', endsAt: now + HOUR, pointRate: 2 },
  ])
})

test('points with no end date give the deal no end', async () => {
  await insertDeal('open-ended', {}, [
    { kind: 'sale', endsAt: new Date(Date.now() + HOUR) },
    { kind: 'points', endsAt: null, pointRate: 3 },
  ])

  const body = await listDeals()

  expect(body.deals[0].endsAt).toBeNull()
})

test('the database refuses a category or promotion outside our lists', async () => {
  await expect(insertDeal('bad-category', { category: 'Toys' as never })).rejects.toThrow()
  await expect(insertDeal('sale-no-end', {}, [{ kind: 'sale', endsAt: null }])).rejects.toThrow()
  await expect(
    insertDeal('normal-points', {}, [{ kind: 'points', endsAt: null, pointRate: 1 }]),
  ).rejects.toThrow()
})

test('answers with an empty list when there are no deals', async () => {
  const body = await listDeals()
  expect(body.deals).toEqual([])
})
