import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router'
import { DealCard } from '../components/DealCard'
import { CloseIcon, FilterIcon, SearchIcon } from '../components/Icons'
import { EmptyState } from '../components/Shell'
import NumberTicker from '../fancy/basic-number-ticker'
import { useCatalog } from '../lib/catalog'
import type { Catalog, Deal } from '../lib/catalog'
import { tokenNumber, useSettled } from '../lib/tokens'

const MAX_MIN_DISCOUNT = 60
const DISCOUNT_STEP = 5

const sorts = {
  discount: {
    label: 'Biggest discount',
    compare: (a: Deal, b: Deal) => b.discountPct - a.discountPct,
  },
  price: { label: 'Lowest price', compare: (a: Deal, b: Deal) => a.salePrice - b.salePrice },
  ending: { label: 'Ending soonest', compare: (a: Deal, b: Deal) => a.endsInHours - b.endsInHours },
  newest: {
    label: 'Just found',
    compare: (a: Deal, b: Deal) => a.postedHoursAgo - b.postedHoursAgo,
  },
  rating: { label: 'Top rated', compare: (a: Deal, b: Deal) => b.rating - a.rating },
} as const
type SortKey = keyof typeof sorts
const DEFAULT_SORT: SortKey = 'discount'

type Channel = '' | 'online' | 'in-store'

interface Filters {
  q: string
  min: number
  category: string[]
  brand: string[]
  store: string[]
  channel: Channel
  prefecture: string
  city: string
  sort: SortKey
}

const list = (value: string | null) => (value ? value.split(',').filter(Boolean) : [])

function parse(query: URLSearchParams, { prefectures, citiesByPrefecture }: Catalog): Filters {
  const sort = query.get('sort') ?? ''
  const channel = query.get('channel') ?? ''
  const prefecture = query.get('prefecture') ?? ''
  const city = query.get('city') ?? ''
  return {
    q: query.get('q') ?? '',
    min: Math.min(MAX_MIN_DISCOUNT, Math.max(0, Number(query.get('min')) || 0)),
    category: list(query.get('category')),
    brand: list(query.get('brand')),
    store: list(query.get('store')),
    channel: channel === 'online' || channel === 'in-store' ? channel : '',
    prefecture: prefectures.includes(prefecture) ? prefecture : '',
    city: citiesByPrefecture[prefecture]?.includes(city) ? city : '',
    sort: sort in sorts ? (sort as SortKey) : DEFAULT_SORT,
  }
}

function toPath(f: Filters): string {
  const query = new URLSearchParams()
  if (f.q) query.set('q', f.q)
  if (f.min > 0) query.set('min', String(f.min))
  if (f.category.length) query.set('category', f.category.join(','))
  if (f.brand.length) query.set('brand', f.brand.join(','))
  if (f.store.length) query.set('store', f.store.join(','))
  if (f.channel) query.set('channel', f.channel)
  if (f.prefecture) query.set('prefecture', f.prefecture)
  if (f.city) query.set('city', f.city)
  if (f.sort !== DEFAULT_SORT) query.set('sort', f.sort)
  const text = query.toString()
  return text ? `/browse?${text}` : '/browse'
}

function apply(f: Filters, deals: Deal[]): Deal[] {
  const needle = f.q.trim().toLowerCase()
  return deals
    .filter((d) => d.discountPct >= f.min)
    .filter((d) => f.category.length === 0 || f.category.includes(d.category))
    .filter((d) => f.brand.length === 0 || f.brand.includes(d.brand))
    .filter((d) => f.store.length === 0 || f.store.includes(d.store))
    .filter((d) => !f.channel || d.channel === f.channel)
    .filter((d) => !f.prefecture || d.prefecture === f.prefecture)
    .filter((d) => !f.city || d.city === f.city)
    .filter((d) => !needle || `${d.title} ${d.brand} ${d.category}`.toLowerCase().includes(needle))
    .sort(sorts[f.sort].compare)
}

const toggle = (values: string[], value: string) =>
  values.includes(value) ? values.filter((v) => v !== value) : [...values, value]

interface ActiveChip {
  key: string
  label: string
  remove: Partial<Filters>
}

function activeChips(f: Filters): ActiveChip[] {
  return [
    ...(f.q ? [{ key: 'q', label: `"${f.q}"`, remove: { q: '' } }] : []),
    ...(f.min > 0 ? [{ key: 'min', label: `${f.min}% off or more`, remove: { min: 0 } }] : []),
    ...(f.channel
      ? [
          {
            key: 'channel',
            label: f.channel === 'online' ? 'Online only' : 'In-store only',
            remove: { channel: '' as Channel },
          },
        ]
      : []),
    ...f.category.map((c) => ({
      key: `c-${c}`,
      label: c,
      remove: { category: f.category.filter((v) => v !== c) },
    })),
    ...f.brand.map((b) => ({
      key: `b-${b}`,
      label: b,
      remove: { brand: f.brand.filter((v) => v !== b) },
    })),
    ...f.store.map((s) => ({
      key: `s-${s}`,
      label: s,
      remove: { store: f.store.filter((v) => v !== s) },
    })),
    ...(f.prefecture
      ? [{ key: 'prefecture', label: f.prefecture, remove: { prefecture: '', city: '' } }]
      : []),
    ...(f.city ? [{ key: 'city', label: f.city, remove: { city: '' } }] : []),
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
  const catalog = useCatalog()
  const { brands, categories, citiesByPrefecture, deals, prefectures, stores } = catalog
  const filters = useMemo(() => parse(query, catalog), [query, catalog])
  const results = useMemo(() => apply(filters, deals), [filters, deals])
  const chips = activeChips(filters)
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
  const clear = () => go({ ...parse(new URLSearchParams(), catalog), sort: filters.sort })

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

  const locationOff = filters.channel === 'online'
  const cities = filters.prefecture ? citiesByPrefecture[filters.prefecture] : []

  return (
    <div className="wrap page">
      <header className="page__head">
        <h1 className="title">All deals</h1>
        <p className="page__lede">
          Every live sale the dog found at Yodobashi, Rakuten and Amazon, in one list.
        </p>
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
                  placeholder="Title, brand or category"
                  value={filters.q}
                  onChange={(e) => set({ q: e.target.value })}
                />
              </div>
            </div>

            <fieldset className="field">
              <legend className="field__label">Where to buy</legend>
              <div className="segmented">
                {(
                  [
                    ['', 'All'],
                    ['online', 'Online'],
                    ['in-store', 'In-store'],
                  ] as const
                ).map(([value, label]) => (
                  <label key={label} className="segmented__option">
                    <input
                      type="radio"
                      name="channel"
                      className="sr-only"
                      checked={filters.channel === value}
                      onChange={() =>
                        set(
                          value === 'online'
                            ? { channel: value, prefecture: '', city: '' }
                            : { channel: value },
                        )
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="field">
              <label className="field__label" htmlFor="f-min">
                Minimum discount
                <output className="field__value" htmlFor="f-min">
                  {filters.min === 0 ? 'Any' : `${filters.min}% or more`}
                </output>
              </label>
              <input
                id="f-min"
                type="range"
                className="range"
                min={0}
                max={MAX_MIN_DISCOUNT}
                step={DISCOUNT_STEP}
                value={filters.min}
                onChange={(e) => set({ min: Number(e.target.value) })}
              />
              <div className="range__scale" aria-hidden="true">
                <span>0%</span>
                <span>{MAX_MIN_DISCOUNT / 2}%</span>
                <span>{MAX_MIN_DISCOUNT}%</span>
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
                Brand
                {filters.brand.length > 0 && (
                  <span className="field__value">{filters.brand.length} picked</span>
                )}
              </legend>
              <div className="checklist">
                {brands.map((brand) => (
                  <label key={brand} className="check">
                    <input
                      type="checkbox"
                      checked={filters.brand.includes(brand)}
                      onChange={() => set({ brand: toggle(filters.brand, brand) })}
                    />
                    <span>{brand}</span>
                    <span className="check__count">
                      {deals.filter((d) => d.brand === brand).length}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="field" disabled={locationOff}>
              <legend className="field__label">Location</legend>
              <p className="field__hint" id="f-loc-hint">
                {locationOff
                  ? 'Online deals have no location. Switch to All or In-store to use this.'
                  : 'Picking a place shows in-store deals only.'}
              </p>
              <label className="field__sub" htmlFor="f-pref">
                Prefecture
              </label>
              <select
                id="f-pref"
                className="select"
                value={filters.prefecture}
                aria-describedby="f-loc-hint"
                onChange={(e) => set({ prefecture: e.target.value, city: '' })}
              >
                <option value="">All prefectures</option>
                {prefectures.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <label className="field__sub" htmlFor="f-city">
                City
              </label>
              <select
                id="f-city"
                className="select"
                value={filters.city}
                disabled={!filters.prefecture}
                onChange={(e) => set({ city: e.target.value })}
              >
                <option value="">
                  {filters.prefecture ? `All of ${filters.prefecture}` : 'Pick a prefecture first'}
                </option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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
