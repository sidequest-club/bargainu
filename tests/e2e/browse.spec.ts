import { expect, test } from '@playwright/test'

test('the shop list keeps its order while shops are picked, and loads picked shops first', async ({
  page,
}) => {
  await page.goto('/browse')
  const shopGroup = page.getByRole('group', { name: /^Shop/ })
  const rows = shopGroup.locator('label')
  const boxes = shopGroup.getByRole('checkbox')
  await expect(boxes.first()).toBeVisible()
  const order = await rows.allTextContents()
  const last = order.length - 1
  const lastShop = order[last]

  // The URL updates after the click, so check() would read the old state.
  await boxes.nth(last).click()
  await expect(boxes.nth(last)).toBeChecked()
  await expect(rows).toHaveText(order)

  await boxes.nth(1).click()
  await expect(boxes.nth(1)).toBeChecked()
  await boxes.nth(last).click()
  await expect(boxes.nth(last)).not.toBeChecked()
  await expect(rows).toHaveText(order)

  await page.getByRole('button', { name: `Remove filter: ${order[1].replace(/\d+$/, '')}` }).click()
  await expect(boxes.nth(1)).not.toBeChecked()
  await expect(rows).toHaveText(order)

  await boxes.nth(last).click()
  await expect(boxes.nth(last)).toBeChecked()
  await page.getByRole('button', { name: 'Clear all' }).first().click()
  await expect(boxes.nth(last)).not.toBeChecked()
  await expect(rows).toHaveText(order)

  await boxes.nth(last).click()
  await expect(boxes.nth(last)).toBeChecked()
  await page.reload()
  await expect(rows.first()).toHaveText(lastShop)
  await expect(boxes.first()).toBeChecked()
})
