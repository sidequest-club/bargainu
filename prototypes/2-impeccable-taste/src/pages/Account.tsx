import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRightIcon, DogIcon, SignOutIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { deals, demoUser, formatYen, getDeal } from '@shared/deals'
import { DealGrid } from '../components/Deal'
import { EmptyState } from '../components/Shell'
import { href, navigate } from '../lib/router'
import type { Route } from '../lib/router'
import { addFavorite, signIn, signOut, useStore } from '../lib/store'

/** Only in-app paths are accepted as a return target. */
const safeNext = (next: string | null, fallback: string) => (next && next.startsWith('/') && !next.startsWith('//') ? next : fallback)

function completeSignIn(route: Route) {
  signIn()
  const save = route.query.get('save')
  if (save && getDeal(save)) addFavorite(save)
  navigate(`#${safeNext(route.query.get('next'), '/favorites')}`, { replace: true })
}

export function Login({ route }: { route: Route }) {
  const { user, favorites } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) {
    return (
      <div className="page account-page">
        <div className="account-card">
          <span className="account-card__avatar" aria-hidden="true">
            {user.name.charAt(0)}
          </span>
          <h1 className="account-card__name">{user.name}</h1>
          <p className="account-card__email">{user.email}</p>
          <p className="account-card__text">
            You are signed in with the demo account. {favorites.length === 0 ? 'No deals saved yet.' : `${favorites.length} ${favorites.length === 1 ? 'deal' : 'deals'} saved.`}
          </p>
          <div className="account-card__actions">
            <a href={href('/favorites')} className="button button--accent">
              View favorites
            </a>
            <button type="button" className="button button--outline" onClick={signOut}>
              <SignOutIcon weight="bold" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Enter an email address, or use the demo account below.')
      document.getElementById('login-email')?.focus()
      return
    }
    completeSignIn(route)
  }

  const saving = route.query.get('save') ? getDeal(route.query.get('save') as string) : undefined

  return (
    <div className="login">
      <div className="login__form-side">
        <div className="login__form-wrap">
          <h1 className="login__title">Sign in to Bargainu</h1>
          <p className="login__lede">
            {saving ? `Sign in to save "${saving.title}" to your favorites.` : 'Keep the deals you like in one place and come back before they end.'}
          </p>

          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="login-email" className="field__label">
                Email
              </label>
              <input
                id="login-email"
                className="input"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'login-email-error' : undefined}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
              />
              {error && (
                <p id="login-email-error" className="field__error" role="alert">
                  <WarningCircleIcon weight="fill" aria-hidden="true" />
                  {error}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="login-password" className="field__label">
                Password
              </label>
              <input
                id="login-password"
                className="input"
                type="password"
                name="password"
                autoComplete="current-password"
                aria-describedby="login-password-help"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p id="login-password-help" className="field__help">
                This prototype has no accounts. Any email and password signs you in as {demoUser.name}.
              </p>
            </div>
            <button type="submit" className="button button--accent button--lg button--block">
              Sign in
            </button>
          </form>

          <div className="login__or" role="separator">
            or
          </div>

          <button type="button" className="button button--outline button--lg button--block" onClick={() => completeSignIn(route)}>
            Continue as {demoUser.name}
            <ArrowRightIcon weight="bold" aria-hidden="true" />
          </button>
          <p className="login__demo-note">One click, no typing. Uses {demoUser.email}.</p>
        </div>
      </div>

      <div className="login__brand-side" aria-hidden="true">
        <span className="login__seal">
          <DogIcon weight="fill" />
        </span>
        <p className="login__brand-line">{deals.length} live deals from three stores.</p>
        <p className="login__brand-sub">Save the ones you want. We keep the clock on them.</p>
      </div>
    </div>
  )
}

export function Favorites() {
  const { user, favorites } = useStore()

  if (!user) {
    return (
      <div className="page">
        <h1 className="page__title">Favorites</h1>
        <EmptyState
          title="Sign in to see your favorites"
          actions={
            <>
              <a href={href('/login', { next: '/favorites' })} className="button button--accent">
                Sign in
              </a>
              <button
                type="button"
                className="button button--outline"
                onClick={() => {
                  signIn()
                }}
              >
                Continue as {demoUser.name}
              </button>
            </>
          }
        >
          Saved deals are kept with your account, so they are here when you come back.
        </EmptyState>
      </div>
    )
  }

  const saved = favorites.flatMap((id) => getDeal(id) ?? [])

  if (saved.length === 0) {
    return (
      <div className="page">
        <h1 className="page__title">Favorites</h1>
        <EmptyState
          title="Nothing saved yet"
          actions={
            <a href={href('/browse')} className="button button--accent">
              Browse deals
            </a>
          }
        >
          Tap the heart on any deal to keep it here. We show how long each one has left.
        </EmptyState>
      </div>
    )
  }

  const totalSaving = saved.reduce((sum, d) => sum + (d.originalPrice - d.salePrice), 0)
  const soonest = saved.reduce((a, b) => (b.endsInHours < a.endsInHours ? b : a))

  return (
    <div className="page">
      <div className="favorites__head">
        <h1 className="page__title">Favorites</h1>
        <p className="favorites__summary">
          {saved.length} saved {saved.length === 1 ? 'deal' : 'deals'}, {formatYen(totalSaving)} off in total. {soonest.title} ends first.
        </p>
      </div>
      <DealGrid deals={saved} headingLevel={2} wide />
    </div>
  )
}
