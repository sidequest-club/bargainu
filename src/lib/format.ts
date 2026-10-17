import type { Deal, Promotion } from './catalog'

const HOURS_PER_DAY = 24
const URGENT_HOURS = 24

export const isUrgent = (deal: Deal) =>
  deal.endsInHours !== null && deal.endsInHours <= URGENT_HOURS

/** Soonest end first; deals with no end go last. */
export const byEnding = (a: Deal, b: Deal) =>
  (a.endsInHours ?? Infinity) - (b.endsInHours ?? Infinity)

/** "6h", "1d 6h", "4d". */
export function duration(hours: number): string {
  if (hours < HOURS_PER_DAY) return `${hours}h`
  const days = Math.floor(hours / HOURS_PER_DAY)
  const rest = hours % HOURS_PER_DAY
  return rest === 0 ? `${days}d` : `${days}d ${rest}h`
}

export const timeLeft = (deal: Deal) =>
  deal.endsInHours === null ? 'No end date' : `Ends in ${duration(deal.endsInHours)}`

export const foundAgo = (deal: Deal) =>
  deal.postedHoursAgo <= 1 ? 'Found in the last hour' : `Found ${duration(deal.postedHoursAgo)} ago`

// Rakuten prices are Japanese prices, so their times are shown in Japan time wherever the visitor is.
const jst = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Tokyo',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** "15 Oct, 10:17 JST". */
export const jstTime = (ms: number) => `${jst.format(ms)} JST`

/** When the price was fetched. Rakuten asks for it next to every price (decision 6). */
export const priceAsOf = (deal: Deal) => `Price as of ${jstTime(deal.fetchedAt)}`

/** "Sale" or "5× points". */
export const promotionLabel = (promotion: Promotion) =>
  promotion.kind === 'sale' ? 'Sale' : `${promotion.pointRate}× points`

/**
 * Keeps the order of `deals` but lets each shop in at most `perShop` times, so a short list is not
 * one shop's near-identical listings. A shop often lists the same item in several colours.
 */
export function fewPerShop(deals: Deal[], perShop: number): Deal[] {
  const seen = new Map<string, number>()
  return deals.filter((deal) => {
    const count = seen.get(deal.shopCode) ?? 0
    seen.set(deal.shopCode, count + 1)
    return count < perShop
  })
}
