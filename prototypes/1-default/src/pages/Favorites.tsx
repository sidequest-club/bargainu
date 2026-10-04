import { deals, demoUser, formatYen } from '@shared/deals'
import { DealCard } from '../components/DealCard'
import { EmptyState } from '../components/EmptyState'
import { href, navigate } from '../lib/router'
import { useStore } from '../lib/store'

export function Favorites() {
  const { user, favorites, signIn, notify } = useStore()

  if (!user) {
    return (
      <div className="wrap">
        <EmptyState
          headingLevel="h1"
          title="Sign in to see your favorites"
          actions={
            <>
              <a className="btn btn--primary" href={href('/login', { next: '/favorites' })}>
                Sign in
              </a>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => {
                  signIn()
                  notify(`Signed in as ${demoUser.name}`)
                  navigate('/favorites')
                }}
              >
                Continue as {demoUser.name} (demo)
              </button>
            </>
          }
        >
          Favorites belong to your account. Sign in and your saved deals show up here.
        </EmptyState>
      </div>
    )
  }

  const saved = favorites.flatMap((id) => deals.filter((d) => d.id === id))
  const totalSaving = saved.reduce((sum, d) => sum + d.originalPrice - d.salePrice, 0)

  return (
    <div className="wrap favorites">
      <header className="pagehead">
        <h1 className="pagehead__title">Favorites</h1>
        <p className="pagehead__note num" role="status" aria-live="polite">
          {saved.length === 0
            ? `Nothing saved yet, ${user.name.split(' ')[0]}.`
            : `${saved.length} saved ${saved.length === 1 ? 'deal' : 'deals'}, ${formatYen(totalSaving)} off in total.`}
        </p>
      </header>

      {saved.length === 0 ? (
        <EmptyState
          title="No saved deals yet"
          actions={
            <a className="btn btn--primary" href={href('/browse')}>
              Browse deals
            </a>
          }
        >
          Tap the heart on any deal and it lands here.
        </EmptyState>
      ) : (
        <>
          <h2 className="sr-only">Saved deals</h2>
          <ul className="grid grid--auto-wide">
          {saved.map((deal) => (
            <li key={deal.id}>
              <DealCard deal={deal} />
            </li>
          ))}
          </ul>
        </>
      )}
    </div>
  )
}
