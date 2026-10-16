import { createContext, useContext } from 'react'
import type { InferResponseType } from 'hono/client'
import { CATEGORIES, STORES } from '../../worker/db/taxonomy'
import type { Category, Store } from '../../worker/db/taxonomy'
import type { api } from './api'

export type { Category, Store }

type DealsResponse = InferResponseType<typeof api.deals.$get>
type ApiDeal = DealsResponse['deals'][number]
export type Promotion = ApiDeal['promotions'][number]

/** A deal as the screens use it: the API row plus the numbers worked out from it. */
export interface Deal extends Omit<ApiDeal, 'endsAt' | 'foundAt' | 'price'> {
  /** Yen, tax included. A deal whose price was cleared is not a live deal and is left out. */
  price: number
  /** Hours from page load until its soonest promotion ends, or null when none has an end. */
  endsInHours: number | null
  /** Hours before page load that the deal was found. */
  postedHoursAgo: number
  /** The highest point rate among its promotions, or null when it has no points. */
  pointRate: number | null
}

const MS_PER_HOUR = 60 * 60 * 1000

export function toDeals({ now, deals }: DealsResponse): Deal[] {
  // The API's endsAt is the latest end, and null if any promotion has none. A sale ending in two
  // hours next to open-ended points still raises the price in two hours, so count to the soonest.
  return deals.flatMap(({ endsAt: _latest, foundAt, price, ...deal }) => {
    // A run that misses a deal clears its price and promotions, so /api/deals should not send it.
    if (price === null) return []
    const rates = deal.promotions.flatMap((p) => (p.pointRate === null ? [] : [p.pointRate]))
    const ends = deal.promotions.flatMap((p) => (p.endsAt === null ? [] : [p.endsAt]))
    return {
      ...deal,
      price,
      endsInHours:
        ends.length > 0 ? Math.max(1, Math.ceil((Math.min(...ends) - now) / MS_PER_HOUR)) : null,
      postedHoursAgo: Math.max(0, Math.floor((now - foundAt) / MS_PER_HOUR)),
      pointRate: rates.length > 0 ? Math.max(...rates) : null,
    }
  })
}

export interface Shop {
  code: string
  name: string
  /** How many live deals the shop has. */
  count: number
}

/** The pile: every live deal and the lists the screens derive from it. */
export interface Catalog {
  deals: Deal[]
  /** Categories that have at least one deal, in their fixed order. */
  categories: Category[]
  /** Stores that have at least one deal, in their fixed order. */
  stores: Store[]
  /** Shops that sell at least one deal, by name. */
  shops: Shop[]
  getDeal: (id: string) => Deal | undefined
}

export function buildCatalog(deals: Deal[]): Catalog {
  const byId = new Map(deals.map((d) => [d.id, d]))
  const shops = new Map<string, Shop>()
  for (const d of deals) {
    const shop = shops.get(d.shopCode) ?? {
      code: d.shopCode,
      name: d.shopName,
      count: 0,
    }
    shops.set(d.shopCode, { ...shop, count: shop.count + 1 })
  }
  return {
    deals,
    categories: CATEGORIES.filter((category) => deals.some((d) => d.category === category)),
    stores: STORES.filter((store) => deals.some((d) => d.store === store)),
    shops: [...shops.values()].sort((a, b) => a.name.localeCompare(b.name, 'ja')),
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
