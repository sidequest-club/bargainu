import { useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Dog } from '../components/Dog'
import { Spark, Squiggle } from '../components/Doodles'
import { ArrowIcon, HeartIcon } from '../components/Icons'
import CenterUnderline from '../fancy/underline-center'
import { useCatalog } from '../lib/catalog'
import { useStore } from '../lib/store'

// Only follow in-app paths. "//host" would leave the site.
const inApp = (path: string | null) =>
  path && path.startsWith('/') && !path.startsWith('//') ? path : null

export function Login() {
  const { user, pending, favorites, signIn, signOut, addFavorite, showToast } = useStore()
  const { status, getDeal } = useCatalog()
  const [query] = useSearchParams()
  const navigate = useNavigate()
  const next = inApp(query.get('next'))
  const saveId = query.get('save')
  const failed = query.has('error')
  const catalogLoading = status === 'loading'
  const toSave = saveId ? getDeal(saveId) : undefined

  // Google sends the user back to this address. Finish what they came here to do, then move on.
  const returning = user !== null && (next !== null || saveId !== null)
  const finished = useRef(false)
  useEffect(() => {
    if (!returning || pending || catalogLoading || finished.current) return
    finished.current = true
    if (toSave) addFavorite(toSave.id)
    showToast(
      toSave ? `Signed in. Saved "${toSave.title}" to favorites` : `Signed in as ${user.name}`,
    )
    void navigate(next ?? '/favorites', { replace: true })
  }, [returning, pending, catalogLoading, toSave, user, next, addFavorite, showToast, navigate])

  // Where Google sends the user back to: this screen, with what they came here to do.
  const returnTo = () => {
    const back = new URLSearchParams({ next: next ?? '/favorites' })
    if (saveId) back.set('save', saveId)
    return `/login?${back.toString()}`
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
        {pending && !user ? null : user ? (
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
                  .then(() => showToast('Signed out. Your favorites are kept with your account.'))
                  .catch(() => showToast('Could not sign out. Try again.'))
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="form-card">
            <h1 className="title title--sm">Sign in</h1>
            <p className="form-card__lede">
              {toSave
                ? `Sign in to save "${toSave.title}".`
                : 'Sign in to keep a list of the deals you want to come back to.'}
            </p>
            {failed && (
              <p className="form-card__error" role="alert">
                Google sign-in did not finish. Try again.
              </p>
            )}

            <button
              type="button"
              className="btn btn--cta btn--lg btn--block"
              onClick={() => signIn(returnTo())}
            >
              Continue with Google
              <ArrowIcon />
            </button>
            <p className="form-card__hint">
              Google is the only way in, so there is no password to remember.
            </p>
          </div>
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
