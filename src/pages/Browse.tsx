import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router'
import { DealCard } from '../components/DealCard'
import { CloseIcon, FilterIcon, SearchIcon } from '../components/Icons'
import { EmptyState } from '../components/Shell'
import NumberTicker from '../fancy/basic-number-ticker'
import { useCatalog } from '../lib/catalog'
import type { Deal, Shop } from '../lib/catalog'
import { byEnding } from '../lib/format'
import { tokenNumber, useSettled } from '../lib/tokens'

const sorts = {
  ending: { label: 'Ending soonest', compare: byEnding },
  price: { label: 'Lowest price', compare: (a: Deal, b: Deal) => a.price - b.price },
  newest: {
    label: 'Just found',
    compare: (a: Deal, b: Deal) => a.postedHoursAgo - b.postedHoursAgo,
  },
  // Unreviewed items have a rating of 0 from Rakuten; among equal ratings, more reviews first.
  rating: {
    label: 'Top rated',
    compare: (a: Deal, b: Deal) => b.rating - a.rating || b.reviews - a.reviews,
  },
} as const
type SortKey = keyof typeof sorts
const DEFAULT_SORT: SortKey = 'ending'

interface Filters {
  q: string
  category: string[]
  /** Shop codes. */
  shop: string[]
  store: string[]
  sort: SortKey
}

const list = (value: string | null) => (value ? value.split(',').filter(Boolean) : [])

function parse(query: URLSearchParams): Filters {
  const sort = query.get('sort') ?? ''
  return {
    q: query.get('q') ?? '',
    category: list(query.get('category')),
    shop: list(query.get('shop')),
    store: list(query.get('store')),
    sort: sort in sorts ? (sort as SortKey) : DEFAULT_SORT,
  }
}

function toPath(f: Filters): string {
  const query = new URLSearchParams()
  if (f.q) query.set('q', f.q)
  if (f.category.length) query.set('category', f.category.join(','))
  if (f.shop.length) query.set('shop', f.shop.join(','))
  if (f.store.length) query.set('store', f.store.join(','))
  if (f.sort !== DEFAULT_SORT) query.set('sort', f.sort)
  const text = query.toString()
  return text ? `/browse?${text}` : '/browse'
}

function apply(f: Filters, deals: Deal[]): Deal[] {
  const needle = f.q.trim().toLowerCase()
  return deals
    .filter((d) => f.category.length === 0 || f.category.includes(d.category))
    .filter((d) => f.shop.length === 0 || f.shop.includes(d.shopCode))
    .filter((d) => f.store.length === 0 || f.store.includes(d.store))
    .filter(
      (d) => !needle || `${d.title} ${d.shopName} ${d.category}`.toLowerCase().includes(needle),
    )
    .sort(sorts[f.sort].compare)
}

const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter((v) => v !== value) : [...values, value]

interface ActiveChip {
  key: string
  label: string
  remove: Partial<Filters>
}

function activeChips(f: Filters, shops: Shop[]): ActiveChip[] {
  const shopName = (code: string) => shops.find((s) => s.code === code)?.label ?? code
  return [
    ...(f.q ? [{ key: 'q', label: `"${f.q}"`, remove: { q: '' } }] : []),
    ...f.category.map((c) => ({
      key: `c-${c}`,
      label: c,
      remove: { category: f.category.filter((v) => v !== c) },
    })),
    ...f.shop.map((code) => ({
      key: `p-${code}`,
      label: shopName(code),
      remove: { shop: f.shop.filter((v) => v !== code) },
    })),
    ...f.store.map((s) => ({
      key: `s-${s}`,
      label: s,
      remove: { store: f.store.filter((v) => v !== s) },
    })),
  ]
}

function CheckChips({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string
  options: readonly string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <fieldset className="field">
      <legend className="field__label">{legend}</legend>
      <div className="chips">
        {options.map((option) => (
          <label key={option} className="chip">
            <input
              type="checkbox"
              className="sr-only"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function Browse() {
  const [query] = useSearchParams()
  const navigate = useNavigate()
  const { categories, deals, shops, stores } = useCatalog()
  const filters = useMemo(() => parse(query), [query])
  const results = useMemo(() => apply(filters, deals), [filters, deals])
  const chips = activeChips(filters, shops)
  const [sheetOpen, setSheetOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const openRef = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()
  const settled = useSettled(results.length)

  // The count ticks from the previous total to the new one.
  const [count, setCount] = useState({ from: results.length, to: results.length })
  if (count.to !== results.length) setCount({ from: count.to, to: results.length })

  const go = (next: Filters) => void navigate(toPath(next), { replace: true })
  const set = (patch: Partial<Filters>) => go({ ...filters, ...patch })
  const clear = () => go({ ...parse(new URLSearchParams()), sort: filters.sort })

  const closeSheet = () => {
    setSheetOpen(false)
    openRef.current?.focus()
  }

  useEffect(() => {
    if (!sheetOpen) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setSheetOpen(false)
      openRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('is-locked')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('is-locked')
    }
  }, [sheetOpen])

  return (
    <div className="wrap page">
      <header className="page__head">
        <h1 className="title">All deals</h1>
        <p className="page__lede">Every live deal the dog found at Rakuten, in one list.</p>
      </header>

      <div className="browse">
        {sheetOpen && <div className="scrim" onClick={closeSheet} aria-hidden="true" />}
        <aside className={`filters${sheetOpen ? ' is-open' : ''}`} aria-label="Filters">
          <div className="filters__head">
            <h2 className="filters__title">Filters</h2>
            <button
              type="button"
              className="icon-btn filters__close"
              onClick={closeSheet}
              ref={closeRef}
              aria-label="Close filters"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="filters__body">
            <div className="field">
              <label className="field__label" htmlFor="f-q">
                Search
              </label>
              <div className="input-icon">
                <SearchIcon />
                <input
                  id="f-q"
                  type="search"
                  className="input"
                  placeholder="Title, shop or category"
                  value={filters.q}
                  onChange={(e) => set({ q: e.target.value })}
                />
              </div>
            </div>

            <CheckChips
              legend="Category"
              options={categories}
              selected={filters.category}
              onToggle={(v) => set({ category: toggle(filters.category, v) })}
            />

            <CheckChips
              legend="Store"
              options={stores}
              selected={filters.store}
              onToggle={(v) => set({ store: toggle(filters.store, v) })}
            />

            <fieldset className="field">
              <legend className="field__label">
                Shop
                {filters.shop.length > 0 && (
                  <span className="field__value">{filters.shop.length} picked</span>
                )}
              </legend>
              <div className="checklist">
                {shops.map((shop) => (
                  <label key={shop.code} className="check">
                    <input
                      type="checkbox"
                      checked={filters.shop.includes(shop.code)}
                      onChange={() => set({ shop: toggle(filters.shop, shop.code) })}
                    />
                    <span>{shop.label}</span>
                    <span className="check__count">{shop.count}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="filters__foot">
            <button
              type="button"
              className="btn btn--paper"
              onClick={clear}
              disabled={chips.length === 0}
            >
              Clear all
            </button>
            <button type="button" className="btn btn--cta filters__done" onClick={closeSheet}>
              Show {results.length} deals
            </button>
          </div>
        </aside>

        <section className="results" aria-label="Results">
          <div className="results__bar">
            <p className="sr-only" aria-live="polite">
              {results.length} of {deals.length} deals shown
            </p>
            <p className="results__count" aria-hidden="true">
              <span className="results__num">
                {reduced || settled ? (
                  results.length
                ) : (
                  <NumberTicker
                    key={results.length}
                    from={count.from}
                    target={results.length}
                    transition={{
                      duration: tokenNumber('--count-duration') / 2,
                      type: 'tween',
                      ease: 'easeOut',
                    }}
                  />
                )}
              </span>{' '}
              {results.length === 1 ? 'deal' : 'deals'}
              <span className="results__of"> of {deals.length}</span>
            </p>
            <button
              type="button"
              className="btn btn--paper btn--sm results__filter"
              onClick={() => setSheetOpen(true)}
              ref={openRef}
            >
              <FilterIcon />
              Filters
              {chips.length > 0 && <span className="count">{chips.length}</span>}
            </button>
            <label className="sort">
              <span className="sort__label">Sort</span>
              <select
                className="select select--sm"
                value={filters.sort}
                onChange={(e) => set({ sort: e.target.value as SortKey })}
              >
                {(Object.keys(sorts) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {sorts[key].label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <ul className="active" aria-label="Active filters">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    className="active__chip"
                    onClick={() => set(chip.remove)}
                    aria-label={`Remove filter: ${chip.label}`}
                  >
                    {chip.label}
                    <CloseIcon />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className="text-btn" onClick={clear}>
                  Clear all
                </button>
              </li>
            </ul>
          )}

          {results.length === 0 ? (
            <EmptyState title="Nothing in this pile">
              <p>
                The dog went through every flyer and came back with nothing for these filters.
                Loosen one, or start over.
              </p>
              <button type="button" className="btn btn--cta" onClick={clear}>
                Clear all filters
              </button>
            </EmptyState>
          ) : (
            <ul className="grid">
              {results.map((deal) => (
                <li key={deal.id}>
                  <DealCard deal={deal} headingLevel="h2" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
