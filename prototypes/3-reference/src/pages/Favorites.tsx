import { deals, formatYen } from '@shared/deals'
import { DealCard } from '../components/DealCard'
import { ArrowIcon } from '../components/Icons'
import { EmptyState } from '../components/Shell'
import { Link } from '../lib/router'
import { useStore } from '../lib/store'

export function Favorites() {
  const { user, favorites } = useStore()

  if (!user) {
    return (
      <div className="wrap page">
        <EmptyState mood="sniff" title="Sign in to see your favorites">
          <p>Your saved deals are kept with your account. Sign in and the dog will fetch them.</p>
          <Link to={`/login?next=${encodeURIComponent('/favorites')}`} className="btn btn--cta">
            Sign in
            <ArrowIcon />
          </Link>
        </EmptyState>
      </div>
    )
  }

  // Keep the order in which deals were saved, newest first.
  const saved = favorites.flatMap((id) => deals.filter((d) => d.id === id))
  const totalSaving = saved.reduce((sum, d) => sum + d.originalPrice - d.salePrice, 0)

  return (
    <div className="wrap page">
      <header className="page__head">
        <h1 className="title">Favorites</h1>
        <p className="page__lede">
          {saved.length === 0
            ? `Nothing saved yet, ${user.name.split(' ')[0]}.`
            : `${saved.length} saved ${saved.length === 1 ? 'deal' : 'deals'}. Buy them all and you keep ${formatYen(totalSaving)}.`}
        </p>
      </header>

      {saved.length === 0 ? (
        <EmptyState title="No favorites yet">
          <p>Tap the heart on any deal and it lands here, so you can find it again before it ends.</p>
          <Link to="/browse" className="btn btn--cta">
            Find something to save
            <ArrowIcon />
          </Link>
        </EmptyState>
      ) : (
        <ul className="grid grid--wide">
          {saved.map((deal) => (
            <li key={deal.id}>
              <DealCard deal={deal} headingLevel="h2" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
