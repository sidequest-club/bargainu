import { useEffect, useId, useRef } from 'react'
import { SlidersHorizontalIcon, XIcon } from '@phosphor-icons/react'
import { brands, categories, citiesByPrefecture, deals, prefectures, stores } from '@shared/deals'
import type { Category, Channel, Store } from '@shared/deals'
import { DealGrid } from '../components/Deal'
import { EmptyState, SearchForm, SelectBox } from '../components/Shell'
import { MIN_MAX, MIN_STEP, activeChips, applyFilters, emptyFilters, filtersToQuery, parseFilters, sortOptions } from '../lib/filters'
import type { Filters, SortKey } from '../lib/filters'
import { href, navigate } from '../lib/router'
import type { Route } from '../lib/router'

const channelOptions: { value: Channel | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'online', label: 'Online' },
  { value: 'in-store', label: 'In-store' },
]

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

function FilterPanel({ filters, update }: { filters: Filters; update: (next: Filters) => void }) {
  const id = useId()
  const locationOff = filters.channel === 'online'
  const cities = filters.prefecture ? citiesByPrefecture[filters.prefecture] : []

  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()}>
      <div className="field">
        <label htmlFor={`${id}-min`} className="field__label">
          Minimum discount
          <output htmlFor={`${id}-min`} className="field__value">
            {filters.min === 0 ? 'Any' : `${filters.min}% or more`}
          </output>
        </label>
        <input
          id={`${id}-min`}
          type="range"
          className="range"
          min={0}
          max={MIN_MAX}
          step={MIN_STEP}
          value={filters.min}
          onChange={(e) => update({ ...filters, min: Number(e.target.value) })}
        />
        <div className="range__scale" aria-hidden="true">
          <span>0%</span>
          <span>30%</span>
          <span>60%</span>
        </div>
      </div>

      <fieldset className="field">
        <legend className="field__label">Where to buy</legend>
        <div className="segmented">
          {channelOptions.map((o) => (
            <label key={o.label} className="segmented__item">
              <input
                type="radio"
                name={`${id}-channel`}
                checked={filters.channel === o.value}
                onChange={() => update({ ...filters, channel: o.value, ...(o.value === 'online' ? { prefecture: '', city: '' } : {}) })}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor={`${id}-pref`} className="field__label">
          Prefecture
        </label>
        <SelectBox
          id={`${id}-pref`}
          className="select"
          value={filters.prefecture}
          disabled={locationOff}
          aria-describedby={`${id}-loc-help`}
          onChange={(e) => update({ ...filters, prefecture: e.target.value, city: '' })}
        >
          <option value="">All prefectures</option>
          {prefectures.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </SelectBox>
        <label htmlFor={`${id}-city`} className="field__label field__label--sub">
          City
        </label>
        <SelectBox
          id={`${id}-city`}
          className="select"
          value={filters.city}
          disabled={locationOff || !filters.prefecture}
          aria-describedby={`${id}-loc-help`}
          onChange={(e) => update({ ...filters, city: e.target.value })}
        >
          <option value="">{filters.prefecture ? 'All cities' : 'Choose a prefecture first'}</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectBox>
        <p id={`${id}-loc-help`} className="field__help">
          {locationOff ? 'Online deals have no location. Switch to All or In-store to filter by place.' : 'Location applies to in-store deals only.'}
        </p>
      </div>

      <fieldset className="field">
        <legend className="field__label">Category</legend>
        <div className="chips">
          {categories.map((c: Category) => (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={filters.cats.includes(c)}
              onClick={() => update({ ...filters, cats: toggle(filters.cats, c) })}
            >
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor={`${id}-brand`} className="field__label">
          Brand
        </label>
        <SelectBox id={`${id}-brand`} className="select" value={filters.brand} onChange={(e) => update({ ...filters, brand: e.target.value })}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </SelectBox>
      </div>

      <fieldset className="field">
        <legend className="field__label">Store</legend>
        <div className="checks">
          {stores.map((s: Store) => (
            <label key={s} className="check">
              <input type="checkbox" checked={filters.stores.includes(s)} onChange={() => update({ ...filters, stores: toggle(filters.stores, s) })} />
              <span>{s}</span>
              <span className="check__count">{deals.filter((d) => d.store === s).length}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </form>
  )
}

export function Browse({ route }: { route: Route }) {
  const filters = parseFilters(route.query)
  const results = applyFilters(filters)
  const chips = activeChips(filters)
  const sheet = useRef<HTMLDialogElement>(null)
  const sortId = useId()

  // Filter changes replace the history entry so Back leaves Browse instead of undoing one filter at a time.
  const update = (next: Filters) => navigate(href('/browse', filtersToQuery(next)), { replace: true })
  const clearAll = () => update({ ...emptyFilters, sort: filters.sort })

  // The sheet is a phone affordance. Close it if the viewport grows past the breakpoint.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 900px)')
    const close = () => wide.matches && sheet.current?.close()
    wide.addEventListener('change', close)
    return () => wide.removeEventListener('change', close)
  }, [])

  const count = `${results.length} ${results.length === 1 ? 'deal' : 'deals'}`

  return (
    <div className="page browse">
      <aside className="browse__side" aria-label="Filters">
        <div className="browse__side-head">
          <h2 className="browse__side-title">Filters</h2>
          {chips.length > 0 && (
            <button type="button" className="text-button" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
        <FilterPanel filters={filters} update={update} />
      </aside>

      <section className="browse__results" aria-labelledby="browse-title">
        <SearchForm initial={filters.q} className="browse__search" onSearch={(q) => update({ ...filters, q })} />

        <div className="browse__head">
          <h1 id="browse-title" className="browse__title">
            Browse deals
          </h1>
          <p className="browse__count" role="status" aria-live="polite">
            {count}
            {chips.length > 0 && <span className="browse__of"> of {deals.length}</span>}
          </p>
        </div>

        <div className="browse__bar">
          <button type="button" className="button button--outline button--sm browse__open" onClick={() => sheet.current?.showModal()}>
            <SlidersHorizontalIcon weight="bold" aria-hidden="true" />
            Filters
            {chips.length > 0 && <span className="count count--ink">{chips.length}</span>}
          </button>
          <div className="sort">
            <label htmlFor={sortId} className="sort__label">
              Sort
            </label>
            <SelectBox id={sortId} className="select select--sm" value={filters.sort} onChange={(e) => update({ ...filters, sort: e.target.value as SortKey })}>
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectBox>
          </div>
        </div>

        {chips.length > 0 && (
          <ul className="active" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.key}>
                <button type="button" className="chip chip--active" onClick={() => update(c.clear(filters))}>
                  {c.label}
                  <XIcon weight="bold" aria-hidden="true" />
                  <span className="visually-hidden">Remove filter</span>
                </button>
              </li>
            ))}
            <li>
              <button type="button" className="text-button" onClick={clearAll}>
                Clear all
              </button>
            </li>
          </ul>
        )}

        {results.length > 0 ? (
          <DealGrid deals={results} headingLevel={2} />
        ) : (
          <EmptyState
            title="No deals match these filters"
            actions={
              <button type="button" className="button button--accent" onClick={clearAll}>
                Clear all filters
              </button>
            }
          >
            Nothing on sale fits all {chips.length} filters at once. Remove one above, or lower the minimum discount.
          </EmptyState>
        )}
      </section>

      <dialog ref={sheet} className="sheet" aria-label="Filters" onClick={(e) => e.target === e.currentTarget && sheet.current?.close()}>
        <div className="sheet__panel">
          <div className="sheet__head">
            <h2 className="sheet__title">Filters</h2>
            <button type="button" className="icon-button" aria-label="Close filters" onClick={() => sheet.current?.close()}>
              <XIcon weight="bold" aria-hidden="true" />
            </button>
          </div>
          <div className="sheet__body">
            <FilterPanel filters={filters} update={update} />
          </div>
          <div className="sheet__foot">
            <button type="button" className="button button--outline" onClick={clearAll} disabled={chips.length === 0}>
              Clear all
            </button>
            <button type="button" className="button button--accent" onClick={() => sheet.current?.close()}>
              Show {count}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
