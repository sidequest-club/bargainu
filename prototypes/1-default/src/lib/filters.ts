import { deals } from '@shared/deals'
import type { Channel, Deal } from '@shared/deals'

export type SortKey = 'discount' | 'price' | 'ending' | 'newest'

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'discount', label: 'Biggest discount' },
  { value: 'price', label: 'Lowest price' },
  { value: 'ending', label: 'Ending soonest' },
  { value: 'newest', label: 'Newest first' },
]

export interface Filters {
  q: string
  min: number
  categories: string[]
  brands: string[]
  stores: string[]
  channel: Channel | ''
  prefecture: string
  city: string
  sort: SortKey
}

export const DISCOUNT_STEP = 5
export const DISCOUNT_MAX = Math.floor(Math.max(...deals.map((d) => d.discountPct)) / DISCOUNT_STEP) * DISCOUNT_STEP

const list = (value: string | null) => (value ? value.split(',').filter(Boolean) : [])

export const readFilters = (query: URLSearchParams): Filters => {
  const channel = query.get('ch')
  const sort = query.get('sort')
  const min = Number(query.get('min'))
  return {
    q: query.get('q') ?? '',
    min: Number.isFinite(min) ? Math.min(Math.max(min, 0), DISCOUNT_MAX) : 0,
    categories: list(query.get('cat')),
    brands: list(query.get('brand')),
    stores: list(query.get('store')),
    channel: channel === 'online' || channel === 'in-store' ? channel : '',
    prefecture: query.get('pref') ?? '',
    city: query.get('city') ?? '',
    sort: sortOptions.some((o) => o.value === sort) ? (sort as SortKey) : 'discount',
  }
}

export const writeFilters = (f: Filters): Record<string, string> => {
  const out: Record<string, string> = {}
  if (f.q.trim()) out.q = f.q
  if (f.min > 0) out.min = String(f.min)
  if (f.categories.length) out.cat = f.categories.join(',')
  if (f.brands.length) out.brand = f.brands.join(',')
  if (f.stores.length) out.store = f.stores.join(',')
  if (f.channel) out.ch = f.channel
  if (f.prefecture) out.pref = f.prefecture
  if (f.city) out.city = f.city
  if (f.sort !== 'discount') out.sort = f.sort
  return out
}

const sorters: Record<SortKey, (a: Deal, b: Deal) => number> = {
  discount: (a, b) => b.discountPct - a.discountPct,
  price: (a, b) => a.salePrice - b.salePrice,
  ending: (a, b) => a.endsInHours - b.endsInHours,
  newest: (a, b) => a.postedHoursAgo - b.postedHoursAgo,
}

export const applyFilters = (f: Filters): Deal[] => {
  const q = f.q.trim().toLowerCase()
  return deals
    .filter((d) => {
      if (d.discountPct < f.min) return false
      if (f.categories.length && !f.categories.includes(d.category)) return false
      if (f.brands.length && !f.brands.includes(d.brand)) return false
      if (f.stores.length && !f.stores.includes(d.store)) return false
      if (f.channel && d.channel !== f.channel) return false
      if (f.prefecture && d.prefecture !== f.prefecture) return false
      if (f.city && d.city !== f.city) return false
      if (q && !`${d.title} ${d.brand} ${d.category}`.toLowerCase().includes(q)) return false
      return true
    })
    .sort(sorters[f.sort])
}

/** Number of filters that narrow the list (sort is not one). */
export const countActive = (f: Filters) =>
  (f.q.trim() ? 1 : 0) +
  (f.min > 0 ? 1 : 0) +
  f.categories.length +
  f.brands.length +
  f.stores.length +
  (f.channel ? 1 : 0) +
  (f.prefecture ? 1 : 0) +
  (f.city ? 1 : 0)
