import { Link } from 'react-router'
import { formatYen } from '../lib/catalog'
import type { Deal } from '../lib/catalog'
import { isUrgent, priceAsOf, promotionLabel, timeLeft } from '../lib/format'
import { useFavoriteAction, useStore } from '../lib/store'
import { ClockIcon, HeartIcon, YenIcon } from './Icons'
import { Sticker } from './Sticker'

export function FavButton({ deal, className }: { deal: Deal; className?: string }) {
  const { isFavorite } = useStore()
  const act = useFavoriteAction()
  const saved = isFavorite(deal.id)
  return (
    <button
      type="button"
      className={['fav', saved && 'is-saved', className].filter(Boolean).join(' ')}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${deal.title} from favorites` : `Save ${deal.title} to favorites`}
      onClick={() => act(deal)}
    >
      <HeartIcon />
    </button>
  )
}

interface DealCardProps {
  deal: Deal
  headingLevel?: 'h2' | 'h3'
}

export function DealCard({ deal, headingLevel: Heading = 'h3' }: DealCardProps) {
  return (
    <article className="card">
      <div className="card__photo">
        <img src={deal.image} alt="" loading="lazy" width={900} height={900} />
      </div>
      <Sticker rate={deal.pointRate} size="md" className="card__sticker" />
      <FavButton deal={deal} className="card__fav" />
      <div className="card__body">
        <p className="card__meta">
          <span>{deal.store}</span>
          {deal.promotions.map((promotion) => (
            <span key={promotion.kind} className="tag">
              {promotionLabel(promotion)}
            </span>
          ))}
        </p>
        <Heading className="card__title">
          <Link to={`/deal/${deal.id}`} className="card__link">
            {deal.title}
          </Link>
        </Heading>
        <p className="card__shop">{deal.shopName}</p>
        <p className="card__prices">
          <span className="price">{formatYen(deal.price)}</span>
        </p>
        <ul className="card__foot">
          <li className={isUrgent(deal) ? 'is-urgent' : undefined}>
            <ClockIcon />
            {timeLeft(deal)}
          </li>
          <li>
            <YenIcon />
            <a href="#price-notice" className="card__asof">
              {priceAsOf(deal)}
            </a>
          </li>
        </ul>
      </div>
    </article>
  )
}

/** Compact one-line version for lists on Home. */
export function DealRow({ deal, note }: { deal: Deal; note: string }) {
  return (
    <article className="row">
      <img className="row__photo" src={deal.image} alt="" loading="lazy" width={900} height={900} />
      <div className="row__body">
        <p className="row__note">{note}</p>
        <h3 className="row__title">
          <Link to={`/deal/${deal.id}`} className="card__link">
            {deal.title}
          </Link>
        </h3>
        <p className="row__prices">
          <span className="price">{formatYen(deal.price)}</span>
          <a href="#price-notice" className="row__asof">
            {priceAsOf(deal)}
          </a>
        </p>
      </div>
      <Sticker rate={deal.pointRate} size="sm" className="row__sticker" />
    </article>
  )
}
