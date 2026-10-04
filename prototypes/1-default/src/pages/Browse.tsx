import { useRef } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { brands, categories, citiesByPrefecture, prefectures, stores } from '@shared/deals'
import { DealCard } from '../components/DealCard'
import { EmptyState } from '../components/EmptyState'
import { DISCOUNT_MAX, DISCOUNT_STEP, applyFilters, countActive, readFilters, sortOptions, writeFilters } from '../lib/filters'
import type { Filters, SortKey } from '../lib/filters'
import { navigate } from '../lib/router'
import type { Route } from '../lib/router'

type Update = (patch: Partial<Filters>) => void

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]

const channelOptions = [
  { value: '', label: 'All' },
  { value: 'online', label: 'Online' },
  { value: 'in-store', label: 'In-store' },
] as const

interface CheckGroupProps {
  legend: string
  name: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  scroll?: boolean
}

function CheckGroup({ legend, name, options, selected, onToggle, scroll = false }: CheckGroupProps) {
  return (
    <fieldset className="filter">
      <legend className="filter__legend">
        {legend}
        {selected.length > 0 ? <span className="filter__count num"> ({selected.length})</span> : null}
      </legend>
      <div className={`chips ${scroll ? 'chips--scroll' : ''}`}>
        {options.map((option) => (
          <label key={option} className="chip">
            <input
              type="checkbox"
              className="sr-only"
              name={name}
              value={option}
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            <span className="chip__face">{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function FilterForm({ filters, update, idPrefix }: { filters: Filters; update: Update; idPrefix: string }) {
  const locationOff = filters.channel === 'online'
  const cities = filters.prefecture ? (citiesByPrefecture[filters.prefecture] ?? []) : []
  const minId = `${idPrefix}-min`
  const prefId = `${idPrefix}-pref`
  const cityId = `${idPrefix}-city`
  const hintId = `${idPrefix}-loc-hint`

  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()}>
      <div className="filter">
        <label className="filter__legend" htmlFor={minId}>
          Minimum discount
        </label>
        <div className="range">
          <input
            id={minId}
            name="min"
            type="range"
            min={0}
            max={DISCOUNT_MAX}
            step={DISCOUNT_STEP}
            value={filters.min}
            onChange={(e) => update({ min: Number(e.target.value) })}
            aria-valuetext={filters.min ? `${filters.min}% or more` : 'Any discount'}
          />
          <output className="range__value num" htmlFor={minId}>
            {filters.min ? `${filters.min}% or more` : 'Any discount'}
          </output>
        </div>
      </div>

      <fieldset className="filter">
        <legend className="filter__legend">Where to buy</legend>
        <div className="segmented">
          {channelOptions.map((option) => (
            <label key={option.value} className="segmented__option">
              <input
                type="radio"
                className="sr-only"
                name={`${idPrefix}-channel`}
                value={option.value}
                checked={filters.channel === option.value}
                onChange={() =>
                  update(option.value === 'online' ? { channel: 'online', prefecture: '', city: '' } : { channel: option.value })
                }
              />
              <span className="segmented__face">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter" disabled={locationOff} aria-describedby={hintId}>
        <legend className="filter__legend">Store location</legend>
        <div className="field">
          <label className="field__label" htmlFor={prefId}>
            Prefecture
          </label>
          <select
            id={prefId}
            name="prefecture"
            className="select"
            value={filters.prefecture}
            onChange={(e) => update({ prefecture: e.target.value, city: '' })}
          >
            <option value="">All prefectures</option>
            {prefectures.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor={cityId}>
            City
          </label>
          <select
            id={cityId}
            name="city"
            className="select"
            value={filters.city}
            disabled={!filters.prefecture}
            onChange={(e) => update({ city: e.target.value })}
          >
            <option value="">{filters.prefecture ? `All of ${filters.prefecture}` : 'Choose a prefecture first'}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <p id={hintId} className="filter__hint">
          {locationOff
            ? 'Location only applies to in-store deals. Switch to All or In-store to use it.'
            : 'Choosing a location shows in-store deals only.'}
        </p>
      </fieldset>

      <CheckGroup
        legend="Category"
        name="category"
        options={categories}
        selected={filters.categories}
        onToggle={(v) => update({ categories: toggle(filters.categories, v) })}
      />
      <CheckGroup
        legend="Store"
        name="store"
        options={stores}
        selected={filters.stores}
        onToggle={(v) => update({ stores: toggle(filters.stores, v) })}
      />
      <CheckGroup
        legend="Brand"
        name="brand"
        options={brands}
        selected={filters.brands}
        onToggle={(v) => update({ brands: toggle(filters.brands, v) })}
      />
    </form>
  )
}

interface ActiveChip {
  key: string
  label: string
  patch: Partial<Filters>
}

const activeChips = (f: Filters): ActiveChip[] => [
  ...(f.q.trim() ? [{ key: 'q', label: `“${f.q.trim()}”`, patch: { q: '' } }] : []),
  ...(f.min > 0 ? [{ key: 'min', label: `${f.min}% or more`, patch: { min: 0 } }] : []),
  ...(f.channel ? [{ key: 'ch', label: f.channel === 'online' ? 'Online' : 'In-store', patch: { channel: '' as const } }] : []),
  ...(f.prefecture ? [{ key: 'pref', label: f.prefecture, patch: { prefecture: '', city: '' } }] : []),
  ...(f.city ? [{ key: 'city', label: f.city, patch: { city: '' } }] : []),
  ...f.categories.map((c) => ({ key: `cat-${c}`, label: c, patch: { categories: f.categories.filter((v) => v !== c) } })),
  ...f.stores.map((s) => ({ key: `store-${s}`, label: s, patch: { stores: f.stores.filter((v) => v !== s) } })),
  ...f.brands.map((b) => ({ key: `brand-${b}`, label: b, patch: { brands: f.brands.filter((v) => v !== b) } })),
]

export function Browse({ route }: { route: Route }) {
  const filters = readFilters(route.query)
  const results = applyFilters(filters)
  const active = countActive(filters)
  const chips = activeChips(filters)
  const sheet = useRef<HTMLDialogElement>(null)

  const update: Update = (patch) => navigate('/browse', writeFilters({ ...filters, ...patch }), true)
  const clear = () => navigate('/browse', writeFilters({ ...readFilters(new URLSearchParams()), sort: filters.sort }), true)
  const countLabel = `${results.length} ${results.length === 1 ? 'deal' : 'deals'}`

  return (
    <div className="wrap browse">
      <header className="pagehead">
        <h1 className="pagehead__title">Browse deals</h1>
        <p className="pagehead__note">Every live deal from all {stores.length} stores. Narrow it down with the filters.</p>
      </header>

      <div className="browse__layout">
        <aside className="browse__side" aria-label="Filters">
          <div className="browse__side-head">
            <h2 className="browse__side-title">Filters</h2>
            {active > 0 ? (
              <button type="button" className="textbtn" onClick={clear}>
                Clear all
              </button>
            ) : null}
          </div>
          <FilterForm filters={filters} update={update} idPrefix="side" />
        </aside>

        <div className="browse__main">
          <div className="toolbar">
            <div className="search">
              <label className="sr-only" htmlFor="browse-q">
                Search deals
              </label>
              <Search className="search__icon icon-md" aria-hidden="true" />
              <input
                id="browse-q"
                name="q"
                type="search"
                className="input search__input"
                placeholder="Search by product or brand…"
                autoComplete="off"
                spellCheck={false}
                value={filters.q}
                onChange={(e) => update({ q: e.target.value })}
              />
            </div>
            <button type="button" className="btn btn--outline toolbar__filters" onClick={() => sheet.current?.showModal()}>
              <SlidersHorizontal className="icon-md" aria-hidden="true" />
              Filters
              {active > 0 ? <span className="badge num">{active}</span> : null}
            </button>
            <div className="toolbar__sort">
              <label className="field__label" htmlFor="browse-sort">
                Sort by
              </label>
              <select
                id="browse-sort"
                name="sort"
                className="select"
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as SortKey })}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="sr-only">Results</h2>
          <div className="resultbar">
            <p className="resultbar__count num" role="status" aria-live="polite">
              {countLabel}
            </p>
            {chips.length > 0 ? (
              <ul className="applied" aria-label="Applied filters">
                {chips.map((chip) => (
                  <li key={chip.key}>
                    <button type="button" className="applied__chip" onClick={() => update(chip.patch)}>
                      <span className="sr-only">Remove filter </span>
                      {chip.label}
                      <X className="icon-sm" aria-hidden="true" />
                    </button>
                  </li>
                ))}
                <li>
                  <button type="button" className="textbtn" onClick={clear}>
                    Clear all
                  </button>
                </li>
              </ul>
            ) : null}
          </div>

          {results.length > 0 ? (
            <ul className="grid grid--auto">
              {results.map((deal, i) => (
                <li key={deal.id}>
                  <DealCard deal={deal} eager={i < 4} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No deals match these filters"
              actions={
                <button type="button" className="btn btn--primary" onClick={clear}>
                  Clear all filters
                </button>
              }
            >
              The nose found nothing here. Lower the minimum discount or remove a filter to see more.
            </EmptyState>
          )}
        </div>
      </div>

      <dialog
        ref={sheet}
        className="sheet"
        aria-labelledby="sheet-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close()
        }}
      >
        <div className="sheet__panel">
          <div className="sheet__head">
            <h2 id="sheet-title" className="sheet__title">
              Filters
            </h2>
            <button type="button" className="iconbtn" aria-label="Close filters" onClick={() => sheet.current?.close()}>
              <X className="icon-md" aria-hidden="true" />
            </button>
          </div>
          <div className="sheet__body">
            <FilterForm filters={filters} update={update} idPrefix="sheet" />
          </div>
          <div className="sheet__foot">
            <button type="button" className="btn btn--outline" onClick={clear} disabled={active === 0}>
              Clear all
            </button>
            <button type="button" className="btn btn--primary sheet__apply" onClick={() => sheet.current?.close()}>
              Show {countLabel}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
