import { brands, categories, citiesByPrefecture, deals, prefectures, stores } from '@shared/deals'
import type { Category, Channel, Deal, Store } from '@shared/deals'

export type SortKey = 'discount' | 'price' | 'ending' | 'newest'

export interface Filters {
  q: string
  min: number
  brand: string
  cats: Category[]
  stores: Store[]
  channel: Channel | ''
  prefecture: string
  city: string
  sort: SortKey
}

export const MIN_STEP = 5
export const MIN_MAX = 60

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'discount', label: 'Biggest discount' },
  { value: 'price', label: 'Lowest price' },
  { value: 'ending', label: 'Ending soonest' },
  { value: 'newest', label: 'Newest first' },
]

export const emptyFilters: Filters = {
  q: '',
  min: 0,
  brand: '',
  cats: [],
  stores: [],
  channel: '',
  prefecture: '',
  city: '',
  sort: 'discount',
}

const list = (value: string | null) => (value ? value.split(',').filter(Boolean) : [])

/** Reads filters from the hash query, ignoring anything that is not a known value. */
export function parseFilters(query: URLSearchParams): Filters {
  const min = Number(query.get('min') ?? 0)
  const prefecture = prefectures.includes(query.get('pref') ?? '') ? (query.get('pref') as string) : ''
  const city = prefecture && citiesByPrefecture[prefecture].includes(query.get('city') ?? '') ? (query.get('city') as string) : ''
  const channel = query.get('ch')
  const sort = query.get('sort')
  return {
    q: query.get('q') ?? '',
    min: Number.isFinite(min) ? Math.min(MIN_MAX, Math.max(0, min)) : 0,
    brand: brands.includes(query.get('brand') ?? '') ? (query.get('brand') as string) : '',
    cats: list(query.get('cat')).filter((c): c is Category => (categories as string[]).includes(c)),
    stores: list(query.get('store')).filter((s): s is Store => (stores as string[]).includes(s)),
    channel: channel === 'online' || channel === 'in-store' ? channel : '',
    prefecture,
    city,
    sort: sortOptions.some((o) => o.value === sort) ? (sort as SortKey) : 'discount',
  }
}

export function filtersToQuery(f: Filters): Record<string, string | number | undefined> {
  return {
    q: f.q || undefined,
    min: f.min || undefined,
    brand: f.brand || undefined,
    cat: f.cats.join(',') || undefined,
    store: f.stores.join(',') || undefined,
    ch: f.channel || undefined,
    pref: f.prefecture || undefined,
    city: f.city || undefined,
    sort: f.sort === 'discount' ? undefined : f.sort,
  }
}

const sorters: Record<SortKey, (a: Deal, b: Deal) => number> = {
  discount: (a, b) => b.discountPct - a.discountPct || a.salePrice - b.salePrice,
  price: (a, b) => a.salePrice - b.salePrice,
  ending: (a, b) => a.endsInHours - b.endsInHours,
  newest: (a, b) => a.postedHoursAgo - b.postedHoursAgo,
}

export function applyFilters(f: Filters): Deal[] {
  const q = f.q.trim().toLowerCase()
  return deals
    .filter((d) => {
      if (d.discountPct < f.min) return false
      if (f.brand && d.brand !== f.brand) return false
      if (f.cats.length && !f.cats.includes(d.category)) return false
      if (f.stores.length && !f.stores.includes(d.store)) return false
      if (f.channel && d.channel !== f.channel) return false
      if (f.prefecture && d.prefecture !== f.prefecture) return false
      if (f.city && d.city !== f.city) return false
      if (q && !`${d.title} ${d.brand} ${d.category} ${d.store}`.toLowerCase().includes(q)) return false
      return true
    })
    .sort(sorters[f.sort])
}

export interface ActiveChip {
  key: string
  label: string
  clear: (f: Filters) => Filters
}

/** One removable chip per active filter, so the list always says what narrowed it. */
export function activeChips(f: Filters): ActiveChip[] {
  const chips: ActiveChip[] = []
  if (f.q) chips.push({ key: 'q', label: `"${f.q}"`, clear: (x) => ({ ...x, q: '' }) })
  if (f.min) chips.push({ key: 'min', label: `${f.min}% off or more`, clear: (x) => ({ ...x, min: 0 }) })
  for (const c of f.cats) chips.push({ key: `cat-${c}`, label: c, clear: (x) => ({ ...x, cats: x.cats.filter((v) => v !== c) }) })
  if (f.brand) chips.push({ key: 'brand', label: f.brand, clear: (x) => ({ ...x, brand: '' }) })
  for (const s of f.stores) chips.push({ key: `store-${s}`, label: s, clear: (x) => ({ ...x, stores: x.stores.filter((v) => v !== s) }) })
  if (f.channel) chips.push({ key: 'ch', label: f.channel === 'online' ? 'Online' : 'In-store', clear: (x) => ({ ...x, channel: '', prefecture: '', city: '' }) })
  if (f.prefecture) chips.push({ key: 'pref', label: f.prefecture, clear: (x) => ({ ...x, prefecture: '', city: '' }) })
  if (f.city) chips.push({ key: 'city', label: f.city, clear: (x) => ({ ...x, city: '' }) })
  return chips
}
