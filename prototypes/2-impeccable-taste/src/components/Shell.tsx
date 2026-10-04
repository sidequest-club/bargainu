import { useEffect } from 'react'
import type { ComponentProps, FormEvent, ReactNode } from 'react'
import { CaretDownIcon, CheckCircleIcon, DogIcon, HeartIcon, HouseIcon, MagnifyingGlassIcon, SquaresFourIcon, UserIcon } from '@phosphor-icons/react'
import { href, navigate } from '../lib/router'
import type { Route } from '../lib/router'
import { dismissNotice, useStore } from '../lib/store'

const NOTICE_MS = 2600

type Section = 'home' | 'browse' | 'favorites' | 'account'

function sectionOf(route: Route): Section | null {
  const first = route.segments[0]
  if (!first) return 'home'
  if (first === 'browse' || first === 'deal') return 'browse'
  if (first === 'favorites') return 'favorites'
  if (first === 'login') return 'account'
  return null
}

export function Logo() {
  return (
    <a href={href('/')} className="logo" aria-label="Bargainu home">
      <span className="logo__seal" aria-hidden="true">
        <DogIcon weight="fill" />
      </span>
      <span className="logo__word">Bargainu</span>
      <span className="logo__kana" lang="ja" aria-hidden="true">
        バーゲイヌ
      </span>
    </a>
  )
}

export function SearchForm({ initial, className = '', onSearch }: { initial: string; className?: string; onSearch?: (q: string) => void }) {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = String(new FormData(e.currentTarget).get('q') ?? '').trim()
    if (onSearch) return onSearch(q)
    navigate(href('/browse', { q }))
  }
  return (
    <form className={`search ${className}`} role="search" onSubmit={onSubmit}>
      <MagnifyingGlassIcon aria-hidden="true" />
      {/* key resets the field when the query changes elsewhere (chips, clear all) */}
      <input key={initial} type="search" name="q" defaultValue={initial} placeholder="Search deals, brands, stores" aria-label="Search deals" autoComplete="off" />
    </form>
  )
}

export function Shell({ route, children }: { route: Route; children: ReactNode }) {
  const { user, favorites, notice } = useStore()
  const section = sectionOf(route)
  const current = (s: Section) => (section === s ? ('page' as const) : undefined)
  const savedCount = user ? favorites.length : 0
  const q = route.segments[0] === 'browse' ? (route.query.get('q') ?? '') : ''

  // Toasts clear themselves; the text stays long enough to read and to be announced.
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => dismissNotice(notice.id), NOTICE_MS)
    return () => window.clearTimeout(timer)
  }, [notice])

  return (
    <div className="shell">
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>
        Skip to content
      </a>

      <header className="header">
        <div className="header__inner">
          <Logo />
          <nav className="header__nav" aria-label="Main">
            <a href={href('/')} aria-current={current('home')}>
              Home
            </a>
            <a href={href('/browse')} aria-current={current('browse')}>
              Browse
            </a>
            <a href={href('/favorites')} aria-current={current('favorites')}>
              Favorites
              {savedCount > 0 && <span className="count">{savedCount}</span>}
            </a>
          </nav>
          <SearchForm initial={q} className="header__search" />
          {user ? (
            <a href={href('/login')} className="account" aria-current={current('account')}>
              <span className="account__avatar" aria-hidden="true">
                {user.name.charAt(0)}
              </span>
              <span className="account__name">{user.name}</span>
            </a>
          ) : (
            <a href={href('/login')} className="button button--on-shell button--sm" aria-current={current('account')}>
              Sign in
            </a>
          )}
        </div>
      </header>

      <main id="main" className="main" tabIndex={-1}>
        {children}
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <p className="footer__brand">
            <span className="footer__name">Bargainu</span> finds live discounts at Yodobashi, Rakuten and Amazon.
          </p>
          <p className="footer__note">Prototype with sample data. Prices are in yen and include tax.</p>
        </div>
      </footer>

      <div className="toast-region" role="status" aria-live="polite">
        {notice && (
          <p key={notice.id} className="toast">
            <CheckCircleIcon weight="fill" aria-hidden="true" />
            {notice.text}
          </p>
        )}
      </div>

      <nav className="tabbar" aria-label="Main">
        <a href={href('/')} aria-current={current('home')}>
          <HouseIcon weight={section === 'home' ? 'fill' : 'regular'} aria-hidden="true" />
          Home
        </a>
        <a href={href('/browse')} aria-current={current('browse')}>
          <SquaresFourIcon weight={section === 'browse' ? 'fill' : 'regular'} aria-hidden="true" />
          Browse
        </a>
        <a href={href('/favorites')} aria-current={current('favorites')}>
          <HeartIcon weight={section === 'favorites' ? 'fill' : 'regular'} aria-hidden="true" />
          Favorites
          {savedCount > 0 && <span className="count">{savedCount}</span>}
        </a>
        <a href={href('/login')} aria-current={current('account')}>
          <UserIcon weight={section === 'account' ? 'fill' : 'regular'} aria-hidden="true" />
          {user ? 'Account' : 'Sign in'}
        </a>
      </nav>
    </div>
  )
}

export function EmptyState({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty__mark" aria-hidden="true">
        <DogIcon weight="fill" />
      </span>
      <h2 className="empty__title">{title}</h2>
      <p className="empty__text">{children}</p>
      {actions && <div className="empty__actions">{actions}</div>}
    </div>
  )
}

/** Native select with the project's own caret, so it matches the other controls in both themes. */
export function SelectBox({ className = '', children, ...props }: ComponentProps<'select'>) {
  return (
    <span className={`select-box ${className.includes('select--sm') ? 'select-box--sm' : ''}`}>
      <select className={className} {...props}>
        {children}
      </select>
      <CaretDownIcon weight="bold" aria-hidden="true" />
    </span>
  )
}
