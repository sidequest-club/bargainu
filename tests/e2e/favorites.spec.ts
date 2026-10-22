import { expect, test } from '@playwright/test'

// One of the sample deals (scripts/sample-deals.ts).
const DEAL = { id: 'cloudstep-pastel-runner', title: 'Cloudstep Pastel Runner' }

test('a signed-in user saves a deal and finds it under Favorites', async ({ page }) => {
  // The local database keeps what an earlier run saved.
  await page.request.delete(`/api/favorites/${DEAL.id}`)

  await page.goto(`/deal/${DEAL.id}`)
  await expect(page.getByRole('heading', { level: 1, name: DEAL.title })).toBeVisible()

  await page.getByRole('button', { name: 'Save to favorites' }).click()
  await expect(page.getByRole('button', { name: 'Saved', pressed: true })).toBeVisible()
  await expect(page.getByText(`Saved "${DEAL.title}" to favorites`)).toBeVisible()

  // A fresh page load, so the list comes from the API and not from what the page remembers.
  await page.goto('/favorites')
  await expect(page.getByRole('heading', { level: 1, name: 'Favorites' })).toBeVisible()
  await expect(page.getByRole('link', { name: DEAL.title })).toBeVisible()
})

test('the favorites count leaves out a saved deal that has ended', async ({ page }) => {
  const live = [DEAL, { id: 'court-classic-low-white', title: 'Court Classic Low White' }]
  // An ended deal stays saved but is no longer in /api/deals.
  const dealIds = [live[0].id, 'a-deal-that-has-ended', live[1].id]
  await page.route('/api/favorites', (route) =>
    route.request().method() === 'GET' ? route.fulfill({ json: { dealIds } }) : route.fallback(),
  )

  await page.goto('/favorites')
  await expect(page.getByText('2 saved deals, newest first.')).toBeVisible()
  for (const deal of live) await expect(page.getByRole('link', { name: deal.title })).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Main', exact: true }).locator('.count'),
  ).toHaveText('2')
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('navigation', { name: 'Main, phone' }).locator('.count')).toHaveText(
    '2',
  )

  await page.goto('/login')
  await expect(page.getByRole('link', { name: 'Your favorites (2)' })).toBeVisible()
})
