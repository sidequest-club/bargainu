import { useEffect, useState } from 'react'
import type { Deal } from '@shared/deals'

const HOUR_MS = 3_600_000
const URGENT_HOURS = 24

/** Deal times are relative to page load, so the clock starts here. */
const loadedAt = Date.now()

export const endsAt = (deal: Deal) => loadedAt + deal.endsInHours * HOUR_MS

export const isUrgent = (deal: Deal) => deal.endsInHours <= URGENT_HOURS

/** UI locale. One place to change when the Japanese copy lands. */
export const LOCALE = 'en'

const NBSP = '\u00A0'
const unit = (value: number, name: 'hour' | 'day') =>
  new Intl.NumberFormat(LOCALE, { style: 'unit', unit: name, unitDisplay: 'short' }).format(value).replace(' ', NBSP)
const relative = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto', style: 'short' })

export const formatCount = (n: number) => new Intl.NumberFormat(LOCALE).format(n)

export const timeLeftShort = (hours: number) => {
  if (hours < 1) return `Under ${unit(1, 'hour')} left`
  if (hours < URGENT_HOURS) return `${unit(Math.floor(hours), 'hour')} left`
  const days = Math.floor(hours / 24)
  const rest = Math.floor(hours % 24)
  return rest ? `${unit(days, 'day')} ${unit(rest, 'hour')} left` : `${unit(days, 'day')} left`
}

export const foundAgo = (hours: number) => {
  if (hours < 1) return 'Found just now'
  if (hours < 24) return `Found ${relative.format(-Math.floor(hours), 'hour')}`
  return `Found ${relative.format(-Math.floor(hours / 24), 'day')}`
}

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  ended: boolean
}

export const useCountdown = (deal: Deal): Countdown => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const total = Math.max(0, Math.floor((endsAt(deal) - now) / 1000))
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    ended: total === 0,
  }
}
