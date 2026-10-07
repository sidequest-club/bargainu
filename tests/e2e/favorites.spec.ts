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
