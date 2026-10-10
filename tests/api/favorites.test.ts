import { beforeEach, describe, expect, test } from 'vitest'
import { favorites } from '../../worker/db/schema.ts'
import { db, insertDeal, request, resetDb, signIn } from './helpers.ts'

const savedBy = async (userId: string) => {
  const rows = await db.select().from(favorites)
  return rows.filter((row) => row.userId === userId).map((row) => row.dealId)
}

beforeEach(resetDb)

describe('signed out', () => {
  test.each([
    ['GET', '/api/favorites'],
    ['PUT', '/api/favorites/deal-1'],
    ['DELETE', '/api/favorites/deal-1'],
  ])('%s %s is refused', async (method, path) => {
    await insertDeal('deal-1')

    const response = await request(path, { method })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Sign in first' })
    expect(await db.select().from(favorites)).toEqual([])
  })

  test('a cookie that is not a session is refused', async () => {
    const response = await request('/api/favorites', {
      headers: { cookie: 'better-auth.session_token=made-up' },
    })
    expect(response.status).toBe(401)
  })
})

describe('signed in', () => {
  test('GET /api/me names the user', async () => {
    const mika = await signIn('mika')

    const body = await (await request('/api/me', mika)).json<{ user: { email: string } }>()

    expect(body.user.email).toBe('mika@example.invalid')
  })

  test('PUT saves a deal and GET lists it', async () => {
    const mika = await signIn('mika')
    await insertDeal('deal-1')

    const put = await request('/api/favorites/deal-1', { method: 'PUT', ...mika })
    const list = await request('/api/favorites', mika)

    expect(put.status).toBe(200)
    expect(await list.json()).toEqual({ dealIds: ['deal-1'] })
  })

  test('PUT twice keeps one favourite', async () => {
    const mika = await signIn('mika')
    await insertDeal('deal-1')

    await request('/api/favorites/deal-1', { method: 'PUT', ...mika })
    const again = await request('/api/favorites/deal-1', { method: 'PUT', ...mika })

    expect(again.status).toBe(200)
    expect(await savedBy(mika.id)).toEqual(['deal-1'])
  })

  test('PUT for a deal that does not exist is a 404', async () => {
    const mika = await signIn('mika')

    const response = await request('/api/favorites/no-such-deal', { method: 'PUT', ...mika })

    expect(response.status).toBe(404)
    expect(await savedBy(mika.id)).toEqual([])
  })

  test('GET lists the newest favourite first', async () => {
    const mika = await signIn('mika')
    for (const id of ['saved-first', 'saved-last', 'saved-second']) await insertDeal(id)
    await db.insert(favorites).values([
      { userId: mika.id, dealId: 'saved-first', createdAt: new Date(1000) },
      { userId: mika.id, dealId: 'saved-last', createdAt: new Date(3000) },
      { userId: mika.id, dealId: 'saved-second', createdAt: new Date(2000) },
    ])

    const list = await request('/api/favorites', mika)

    expect(await list.json()).toEqual({ dealIds: ['saved-last', 'saved-second', 'saved-first'] })
  })

  test('DELETE removes the favourite', async () => {
    const mika = await signIn('mika')
    await insertDeal('deal-1')
    await request('/api/favorites/deal-1', { method: 'PUT', ...mika })

    const response = await request('/api/favorites/deal-1', { method: 'DELETE', ...mika })

    expect(response.status).toBe(200)
    expect(await savedBy(mika.id)).toEqual([])
  })

  test('DELETE for a deal that was never saved still answers ok', async () => {
    const mika = await signIn('mika')

    const response = await request('/api/favorites/deal-1', { method: 'DELETE', ...mika })

    expect(response.status).toBe(200)
  })

  test("one user cannot see or remove another's favourites", async () => {
    const mika = await signIn('mika')
    const ren = await signIn('ren')
    await insertDeal('deal-1')
    await request('/api/favorites/deal-1', { method: 'PUT', ...mika })

    const list = await request('/api/favorites', ren)
    await request('/api/favorites/deal-1', { method: 'DELETE', ...ren })

    expect(await list.json()).toEqual({ dealIds: [] })
    expect(await savedBy(mika.id)).toEqual(['deal-1'])
  })
})
