import type { Deal } from '@shared/deals'

export const URGENT_HOURS = 24

/** "9h left", "2d 4h left". Compact so it survives translation and narrow tiles. */
export function timeLeft(hours: number): string {
  if (hours < URGENT_HOURS) return `${hours}h left`
  const days = Math.floor(hours / 24)
  const rest = hours % 24
  return rest === 0 ? `${days}d left` : `${days}d ${rest}h left`
}

/** Long form for the detail page: "Ends in 1 day 4 hours". */
export function timeLeftLong(hours: number): string {
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`
  if (hours < URGENT_HOURS) return `Ends in ${plural(hours, 'hour')}`
  const days = Math.floor(hours / 24)
  const rest = hours % 24
  return rest === 0 ? `Ends in ${plural(days, 'day')}` : `Ends in ${plural(days, 'day')} ${plural(rest, 'hour')}`
}

export function foundAgo(hours: number): string {
  if (hours < 1) return 'Found just now'
  if (hours < 24) return `Found ${hours}h ago`
  return `Found ${Math.floor(hours / 24)}d ago`
}

const endFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function endsAt(hours: number): string {
  return endFormat.format(new Date(Date.now() + hours * 3_600_000))
}

export function placeLabel(deal: Deal): string | null {
  if (deal.channel !== 'in-store') return null
  return `${deal.city}, ${deal.prefecture}`
}

/** Seal diameter steps up with the discount. */
export function sealTier(pct: number): 'sm' | 'md' | 'lg' {
  if (pct >= 50) return 'lg'
  if (pct >= 30) return 'md'
  return 'sm'
}
