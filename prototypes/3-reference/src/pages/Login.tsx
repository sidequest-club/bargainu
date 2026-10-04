import type { FormEvent } from 'react'
import { demoUser, getDeal } from '@shared/deals'
import { Dog } from '../components/Dog'
import { Spark, Squiggle } from '../components/Doodles'
import { ArrowIcon, HeartIcon } from '../components/Icons'
import CenterUnderline from '../fancy/underline-center'
import { Link, navigate } from '../lib/router'
import { useStore } from '../lib/store'

export function Login({ query }: { query: URLSearchParams }) {
  const { user, favorites, signIn, signOut, addFavorite, showToast } = useStore()
  const next = query.get('next')
  const pending = getDeal(query.get('save') ?? '')

  const finish = () => {
    signIn()
    if (pending) addFavorite(pending.id)
    showToast(pending ? `Signed in. Saved "${pending.title}" to favorites` : `Signed in as ${demoUser.name}`)
    // Only follow in-app paths.
    navigate(next?.startsWith('/') ? next : '/favorites')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    finish()
  }

  return (
    <div className="login">
      <div className="login__art">
        <Dog size="xl" mood={user ? 'happy' : 'sniff'} className="login__dog" />
        <p className="login__line">
          {user ? 'Good dog. Good deals.' : 'The dog remembers what you liked.'}
          <Squiggle className="login__squiggle" />
        </p>
        <Spark className="login__spark" />
      </div>

      <div className="login__panel">
        {user ? (
          <div className="form-card">
            <h1 className="title title--sm">You're signed in</h1>
            <p className="account">
              <span className="avatar avatar--lg" aria-hidden="true">
                {user.name.charAt(0)}
              </span>
              <span>
                <strong>{user.name}</strong>
                <br />
                {user.email}
              </span>
            </p>
            <Link to="/favorites" className="btn btn--cta btn--block">
              <HeartIcon />
              Your favorites ({favorites.length})
            </Link>
            <button
              type="button"
              className="btn btn--paper btn--block"
              onClick={() => {
                signOut()
                showToast('Signed out. Your favorites stay on this device.')
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <form className="form-card" onSubmit={onSubmit} noValidate>
            <h1 className="title title--sm">Sign in</h1>
            <p className="form-card__lede">
              {pending ? `Sign in to save "${pending.title}".` : 'Sign in to keep a list of the deals you want to come back to.'}
            </p>

            <button type="button" className="btn btn--cta btn--lg btn--block" onClick={finish}>
              Continue as {demoUser.name}
              <ArrowIcon />
            </button>
            <p className="form-card__hint">One click, no password. This is the demo account.</p>

            <p className="divider">
              <span>or use email</span>
            </p>

            <div className="field">
              <label className="field__label" htmlFor="l-email">
                Email
              </label>
              <input id="l-email" name="email" type="email" className="input" autoComplete="email" placeholder={demoUser.email} spellCheck={false} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="l-password">
                Password
              </label>
              <input id="l-password" name="password" type="password" className="input" autoComplete="current-password" />
            </div>
            <button type="submit" className="btn btn--ink btn--lg btn--block">
              Sign in
            </button>
            <p className="form-card__hint">Prototype: there is no server, so any email and password sign you in as {demoUser.name}.</p>
          </form>
        )}
        <p className="login__back">
          <Link to="/browse" className="text-link">
            <CenterUnderline>Keep browsing without an account</CenterUnderline>
          </Link>
        </p>
      </div>
    </div>
  )
}
