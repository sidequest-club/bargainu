import type { FormEvent } from 'react'
import { demoUser, getDeal } from '@shared/deals'
import { DogMark } from '../components/Logo'
import { href, navigate } from '../lib/router'
import type { Route } from '../lib/router'
import { useStore } from '../lib/store'

export function Login({ route }: { route: Route }) {
  const { user, signIn, signOut, favorites, isFavorite, toggleFavorite, notify } = useStore()
  const next = route.query.get('next')
  const pending = getDeal(route.query.get('save') ?? '')

  const finish = () => {
    signIn()
    if (pending && !isFavorite(pending.id)) toggleFavorite(pending.id)
    notify(pending ? 'Signed in and saved to favorites' : `Signed in as ${demoUser.name}`)
    navigate(next?.startsWith('/') ? next : '/favorites')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    finish()
  }

  if (user) {
    return (
      <div className="wrap auth">
        <div className="auth__card">
          <DogMark className="auth__mark" />
          <h1 className="auth__title">Your account</h1>
          <dl className="account">
            <div>
              <dt>Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Saved deals</dt>
              <dd className="num">{favorites.length}</dd>
            </div>
          </dl>
          <div className="auth__stack">
            <a className="btn btn--primary btn--block" href={href('/favorites')}>
              Open favorites
            </a>
            <button
              type="button"
              className="btn btn--outline btn--block"
              onClick={() => {
                signOut()
                notify('Signed out')
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap auth">
      <div className="auth__card">
        <DogMark className="auth__mark" />
        <h1 className="auth__title">Sign in to Bargainu</h1>
        <p className="auth__lede">
          {pending ? `Sign in to save ${pending.title}.` : 'Sign in to save deals and find them again on any visit.'}
        </p>

        <button type="button" className="btn btn--sticker btn--block btn--lg" onClick={finish}>
          Continue as {demoUser.name} (demo)
        </button>

        <p className="auth__or">
          <span>or use email</span>
        </p>

        <form className="auth__form" onSubmit={onSubmit}>
          <div className="field">
            <label className="field__label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="input"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              placeholder={`${demoUser.email}…`}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="login-password">
              Password
            </label>
            <input id="login-password" name="password" type="password" className="input" autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn--primary btn--block btn--lg">
            Sign in
          </button>
        </form>

        <p className="auth__note">
          This is a prototype with no real accounts. Any email and password signs you in as {demoUser.name}, and
          nothing you type is sent anywhere.
        </p>
      </div>
    </div>
  )
}
