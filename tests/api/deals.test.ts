import { beforeEach, expect, test } from 'vitest'
import { insertDeal, request, resetDb } from './helpers.ts'

const HOUR = 60 * 60 * 1000

type DealsBody = { now: number; deals: { id: string; endsAt: number; foundAt: number }[] }

beforeEach(resetDb)

test('lists the deals that have not ended, newest find first', async () => {
  const now = Date.now()
  await insertDeal('found-earlier', { foundAt: new Date(now - 5 * HOUR) })
  await insertDeal('found-later', { foundAt: new Date(now - HOUR) })
  await insertDeal('ended', { endsAt: new Date(now - HOUR), foundAt: new Date(now) })

  const response = await request('/api/deals')
  const body = await response.json<DealsBody>()

  expect(response.status).toBe(200)
  expect(body.deals.map((deal) => deal.id)).toEqual(['found-later', 'found-earlier'])
})

test('sends times as milliseconds, with the time the list was made', async () => {
  const endsAt = new Date(Date.now() + 3 * HOUR)
  const foundAt = new Date(Date.now() - 2 * HOUR)
  await insertDeal('timed', { endsAt, foundAt })

  const before = Date.now()
  const body = await (await request('/api/deals')).json<DealsBody>()

  expect(body.deals[0]).toMatchObject({ endsAt: endsAt.getTime(), foundAt: foundAt.getTime() })
  expect(body.now).toBeGreaterThanOrEqual(before)
  expect(body.now).toBeLessThanOrEqual(Date.now())
})

test('answers with an empty list when there are no deals', async () => {
  const body = await (await request('/api/deals')).json<DealsBody>()
  expect(body.deals).toEqual([])
})
