import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Heart, House, LayoutGrid, UserRound } from 'lucide-react'
import { deals, stores } from '@shared/deals'
import { href } from '../lib/router'
import type { Route } from '../lib/router'
import { useStore } from '../lib/store'
import { DogMark, Logo } from './Logo'

const section = (route: Route) => {
  const first = route.segments[0] ?? ''
  if (first === 'deal') return 'browse'
  return first || 'home'
}

function Header({ route }: { route: Route }) {
  const { user, favorites } = useStore()
  const current = section(route)
  const links = [
    { key: 'home', label: 'Home', to: '/' },
    { key: 'browse', label: 'Browse', to: '/browse' },
    { key: 'favorites', label: 'Favorites', to: '/favorites' },
  ]

  return (
    <header className="header">
      <div className="header__inner wrap">
        <a className="header__logo" href={href('/')} aria-label="Bargainu home">
          <Logo />
        </a>
        <nav className="header__nav" aria-label="Main">
          {links.map((l) => (
            <a key={l.key} className="header__link" href={href(l.to)} aria-current={current === l.key ? 'page' : undefined}>
              {l.label}
              {l.key === 'favorites' && user && favorites.length > 0 ? (
                <span className="badge num">
                  {favorites.length}
                  <span className="sr-only"> saved</span>
                </span>
              ) : null}
            </a>
          ))}
        </nav>
        <a className="header__account" href={href('/login')} aria-current={current === 'login' ? 'page' : undefined}>
          <UserRound className="icon-md" aria-hidden="true" />
          <span className="header__account-name">{user ? user.name : 'Sign in'}</span>
        </a>
      </div>
    </header>
  )
}

function TabBar({ route }: { route: Route }) {
  const { user, favorites } = useStore()
  const current = section(route)
  const tabs = [
    { key: 'home', label: 'Home', to: '/', Icon: House },
    { key: 'browse', label: 'Browse', to: '/browse', Icon: LayoutGrid },
    { key: 'favorites', label: 'Favorites', to: '/favorites', Icon: Heart },
    { key: 'login', label: user ? 'Account' : 'Sign in', to: '/login', Icon: UserRound },
  ]

  return (
    <nav className="tabbar" aria-label="Main, mobile">
      {tabs.map(({ key, label, to, Icon }) => (
        <a key={key} className="tabbar__tab" href={href(to)} aria-current={current === key ? 'page' : undefined}>
          <span className="tabbar__icon">
            <Icon className="icon-lg" aria-hidden="true" />
            {key === 'favorites' && user && favorites.length > 0 ? (
              <span className="badge badge--dot num">
                {favorites.length}
                <span className="sr-only"> saved</span>
              </span>
            ) : null}
          </span>
          {label}
        </a>
      ))}
    </nav>
  )
}

function Footer() {
  return (
    <footer className="footer on-brand">
      <div className="wrap footer__inner">
        <div className="footer__brand">
          <DogMark className="footer__mark" />
          <p>
            <span translate="no">Bargainu</span> is bargain plus inu, the Japanese word for dog. It collects live
            discounts from {stores.slice(0, -1).join(', ')} and {stores.at(-1)} in one place.
          </p>
        </div>
        <ul className="footer__links">
          <li>
            <a href={href('/browse')}>All {deals.length} deals</a>
          </li>
          <li>
            <a href={href('/browse', { ch: 'in-store' })}>In-store deals</a>
          </li>
          <li>
            <a href={href('/browse', { sort: 'ending' })}>Ending soon</a>
          </li>
          <li>
            <a href={href('/favorites')}>Favorites</a>
          </li>
        </ul>
        <p className="footer__note">Prototype with invented brands and prices. Prices include tax.</p>
      </div>
    </footer>
  )
}

function Toast() {
  const { toast, dismissToast } = useStore()
  // Keep the last message mounted so the exit transition has something to fade.
  const [last, setLast] = useState(toast)
  if (toast && toast !== last) setLast(toast)
  const shown = toast ?? last

  return (
    <div className="toast" role="status" aria-live="polite" data-open={toast ? 'true' : 'false'}>
      <span>{shown?.message}</span>
      {toast?.undo ? (
        <button
          type="button"
          className="toast__action"
          onClick={() => {
            toast.undo?.()
            dismissToast()
          }}
        >
          Undo
        </button>
      ) : null}
    </div>
  )
}

export function Shell({ route, children }: { route: Route; children: ReactNode }) {
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  // New page: start at the top and hand focus to the main region so keyboard and
  // screen-reader users land on the new content. Query-only changes (filters) keep position.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [route.path])

  return (
    <div className="shell">
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus() }}>
        Skip to content
      </a>
      <Header route={route} />
      <main id="main" className="main" ref={mainRef} tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <TabBar route={route} />
      <Toast />
    </div>
  )
}
