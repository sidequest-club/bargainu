import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import CenterUnderline from '../fancy/underline-center'
import { useCatalog } from '../lib/catalog'
import type { Catalog } from '../lib/catalog'
import { isUrgent } from '../lib/format'
import { PRICE_NOTICE } from '../lib/rakuten'
import { useStore } from '../lib/store'
import { Dog } from './Dog'
import {
  BoneIcon,
  GridIcon,
  HeartIcon,
  HomeIcon,
  PawIcon,
  StarIcon,
  TagIcon,
  UserIcon,
  YenIcon,
} from './Icons'
import { Marquee } from './Marquee'

interface Fact {
  text: string
  icon: ReactNode
  tone: string
}

const yenFact: Fact = { text: 'Prices in yen, tax included', icon: <YenIcon />, tone: 'green' }

// The counts only mean something once there are deals; until then the strip keeps the fixed facts.
function tickerFacts({ deals, stores, shops, categories }: Catalog): Fact[] {
  if (deals.length === 0) return [yenFact]
  const endingToday = deals.filter(isUrgent).length
  const rates = deals.flatMap((d) => (d.pointRate === null ? [] : [d.pointRate]))
  const topRate = rates.length > 0 ? Math.max(...rates) : null
  return [
    { text: `${deals.length} deals sniffed out today`, icon: <PawIcon />, tone: 'yellow' },
    {
      text: `${shops.length} shops on ${stores.join(', ')}`,
      icon: <TagIcon />,
      tone: 'green',
    },
    { text: `${categories.length} categories in the pile`, icon: <BoneIcon />, tone: 'blue' },
    ...(topRate === null
      ? []
      : [{ text: `Up to ${topRate}× points`, icon: <YenIcon />, tone: 'pink' }]),
    { text: `${endingToday} deals end within 24 hours`, icon: <StarIcon />, tone: 'yellow' },
    yenFact,
  ]
}

export function Ticker() {
  const facts = tickerFacts(useCatalog())
  return (
    <section className="ticker" aria-label="Today in numbers">
      <Marquee speedToken="--marquee-ticker" repeat={3}>
        <ul className="ticker__list">
          {facts.map((fact) => (
            <li key={fact.text} className="ticker__item">
              <span className={`ticker__dot ticker__dot--${fact.tone}`}>{fact.icon}</span>
              {fact.text}
            </li>
          ))}
        </ul>
      </Marquee>
    </section>
  )
}

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Bargainu home">
      <Dog size="xs" />
      <span className="logo__word">Bargainu</span>
    </Link>
  )
}

const isActive = (path: string, target: string) =>
  target === '/' ? path === '/' : path.startsWith(target)

export function Nav() {
  const { pathname: path } = useLocation()
  const { user, pending, favorites } = useStore()
  const links = [
    { to: '/', label: 'Home' },
    { to: '/browse', label: 'Browse' },
    { to: '/favorites', label: 'Favorites' },
  ]
  return (
    <header className="nav-wrap">
      <nav className="nav" aria-label="Main">
        <Logo />
        <ul className="nav__links">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="nav__link"
                aria-current={isActive(path, link.to) ? 'page' : undefined}
              >
                {link.label}
                {link.to === '/favorites' && user && favorites.length > 0 && (
                  <span className="count">{favorites.length}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        {user ? (
          <Link to="/login" className="nav__user" aria-label={`Account: ${user.name}`}>
            <span className="avatar" aria-hidden="true">
              {user.name.charAt(0)}
            </span>
            <span className="nav__user-name">{user.name}</span>
          </Link>
        ) : (
          // Nothing is shown until the session is known, so "Sign in" never flashes at a signed-in user.
          !pending && (
            <Link to="/login" className="btn btn--sm btn--ink">
              Sign in
            </Link>
          )
        )}
      </nav>
    </header>
  )
}

export function TabBar() {
  const { pathname: path } = useLocation()
  const { user, favorites } = useStore()
  const tabs = [
    { to: '/', label: 'Home', icon: <HomeIcon /> },
    { to: '/browse', label: 'Browse', icon: <GridIcon /> },
    {
      to: '/favorites',
      label: 'Favorites',
      icon: <HeartIcon />,
      count: user ? favorites.length : 0,
    },
    { to: '/login', label: user ? 'Account' : 'Sign in', icon: <UserIcon /> },
  ]
  return (
    <nav className="tabbar" aria-label="Main, phone">
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className="tabbar__tab"
          aria-current={isActive(path, tab.to) ? 'page' : undefined}
        >
          <span className="tabbar__icon">
            {tab.icon}
            {tab.count ? <span className="count count--pip">{tab.count}</span> : null}
          </span>
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}

/** Scales its text so one line runs from edge to edge of the container. */
function FitText({ children, className }: { children: string; className?: string }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const box = outer.current
    const text = inner.current
    if (!box || !text) return
    const fit = () => {
      text.style.fontSize = ''
      const base = Number.parseFloat(getComputedStyle(text).fontSize)
      const width = text.getBoundingClientRect().width
      if (width === 0) return
      text.style.fontSize = `${(base * box.clientWidth) / width}px`
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    void document.fonts.ready.then(fit)
    return () => observer.disconnect()
  }, [children])

  return (
    <div ref={outer} className={className} aria-hidden="true">
      <span ref={inner}>{children}</span>
    </div>
  )
}

export function Footer() {
  const { user } = useStore()
  return (
    <footer className="footer">
      <div className="footer__top">
        <p className="footer__line">
          Go on, have a sniff.
          <Dog size="sm" mood="sniff" className="footer__dog" />
        </p>
        <ul className="footer__links">
          <li>
            <Link to="/browse">
              <CenterUnderline>All deals</CenterUnderline>
            </Link>
          </li>
          <li>
            <Link to="/favorites">
              <CenterUnderline>Favorites</CenterUnderline>
            </Link>
          </li>
          <li>
            <Link to="/login">
              <CenterUnderline>{user ? 'Account' : 'Sign in'}</CenterUnderline>
            </Link>
          </li>
        </ul>
      </div>
      <FitText className="footer__wordmark">Bargainu</FitText>
      <p className="footer__small">
        <span>バーゲイヌ = bargain + 犬.</span>
        <span>Store names are plain labels, not endorsements.</span>
      </p>
      <div className="footer__legal">
        <p>
          Bargainu is made and run by Sidequest Club (Yuta, Norty and Mizuki), who are responsible
          for it. It is not run by Rakuten, and Rakuten is not our partner.
        </p>
        <p lang="ja" id="price-notice">
          {PRICE_NOTICE}
        </p>
        <p>
          {/* Rakuten's credit, kept exactly as Rakuten gives it (decision 6). */}
          <a href="https://developers.rakuten.com/" target="_blank">
            Supported by Rakuten Developers
          </a>
        </p>
      </div>
    </footer>
  )
}

export function Toast() {
  const { toast } = useStore()
  return (
    <output className="toast-region" aria-live="polite">
      {toast && <p className="toast">{toast}</p>}
    </output>
  )
}

export function EmptyState({
  mood = 'sleepy',
  title,
  children,
}: {
  mood?: 'happy' | 'sniff' | 'sleepy'
  title: string
  children: ReactNode
}) {
  return (
    <div className="empty">
      <Dog size="lg" mood={mood} className="empty__dog" />
      <h2 className="empty__title">{title}</h2>
      {children}
    </div>
  )
}
