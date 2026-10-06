import { createContext, useContext } from 'react'
import type { InferResponseType } from 'hono/client'
import { CATEGORIES, STORES } from '../../worker/db/taxonomy'
import type { Category, Store } from '../../worker/db/taxonomy'
import type { api } from './api'

export type { Category, Store }

type DealsResponse = InferResponseType<typeof api.deals.$get>

/** A deal as the screens use it: the API row plus the numbers worked out from it. */
export interface Deal extends Omit<DealsResponse['deals'][number], 'endsAt' | 'foundAt'> {
  discountPct: number
  /** Hours from page load until the deal ends. */
  endsInHours: number
  /** Hours before page load that the deal was found. */
  postedHoursAgo: number
}

const MS_PER_HOUR = 60 * 60 * 1000
const TOP_COUNT = 8

export function toDeals({ now, deals }: DealsResponse): Deal[] {
  return deals.map(({ endsAt, foundAt, ...deal }) => ({
    ...deal,
    discountPct: Math.round((1 - deal.salePrice / deal.originalPrice) * 100),
    endsInHours: Math.max(1, Math.ceil((endsAt - now) / MS_PER_HOUR)),
    postedHoursAgo: Math.max(0, Math.floor((now - foundAt) / MS_PER_HOUR)),
  }))
}

/** The pile: every live deal and the lists the screens derive from it. */
export interface Catalog {
  deals: Deal[]
  /** Categories that have at least one deal, in their fixed order. */
  categories: Category[]
  stores: readonly Store[]
  brands: string[]
  prefectures: string[]
  citiesByPrefecture: Record<string, string[]>
  /** The "Top Discounts" list: biggest percentage off first. */
  topDiscounts: Deal[]
  getDeal: (id: string) => Deal | undefined
}

export function buildCatalog(deals: Deal[]): Catalog {
  const prefectures = [
    ...new Set(deals.flatMap((d) => (d.prefecture ? [d.prefecture] : []))),
  ].sort()
  const byId = new Map(deals.map((d) => [d.id, d]))
  return {
    deals,
    categories: CATEGORIES.filter((category) => deals.some((d) => d.category === category)),
    stores: STORES,
    brands: [...new Set(deals.map((d) => d.brand))].sort(),
    prefectures,
    citiesByPrefecture: Object.fromEntries(
      prefectures.map((p) => [
        p,
        [...new Set(deals.flatMap((d) => (d.prefecture === p && d.city ? [d.city] : [])))].sort(),
      ]),
    ),
    topDiscounts: deals.toSorted((a, b) => b.discountPct - a.discountPct).slice(0, TOP_COUNT),
    getDeal: (id) => byId.get(id),
  }
}

export interface CatalogState extends Catalog {
  status: 'loading' | 'error' | 'ready'
  reload: () => void
}

export const CatalogContext = createContext<CatalogState | null>(null)

export function useCatalog(): CatalogState {
  const catalog = useContext(CatalogContext)
  if (!catalog) throw new Error('useCatalog must be used inside CatalogProvider')
  return catalog
}

export const formatYen = (n: number) => `¥${n.toLocaleString('ja-JP')}`
