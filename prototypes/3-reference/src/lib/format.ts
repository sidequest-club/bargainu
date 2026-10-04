import type { Deal } from '@shared/deals'

const HOURS_PER_DAY = 24
const URGENT_HOURS = 24

export const isUrgent = (deal: Deal) => deal.endsInHours <= URGENT_HOURS

/** "6h", "1d 6h", "4d". */
export function duration(hours: number): string {
  if (hours < HOURS_PER_DAY) return `${hours}h`
  const days = Math.floor(hours / HOURS_PER_DAY)
  const rest = hours % HOURS_PER_DAY
  return rest === 0 ? `${days}d` : `${days}d ${rest}h`
}

export const timeLeft = (deal: Deal) => `Ends in ${duration(deal.endsInHours)}`

export const foundAgo = (deal: Deal) =>
  deal.postedHoursAgo <= 1 ? 'Found in the last hour' : `Found ${duration(deal.postedHoursAgo)} ago`

/** "Shinjuku, Tokyo". A city named after its prefecture (Osaka, Kyoto) is shown once. */
export function place(deal: Deal): string | null {
  if (!deal.city || !deal.prefecture) return null
  return deal.city === deal.prefecture ? deal.city : `${deal.city}, ${deal.prefecture}`
}

export const channelLabel = (deal: Deal) => (deal.channel === 'online' ? 'Online' : 'In-store')
