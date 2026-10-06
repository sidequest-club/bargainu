import { Link } from 'react-router'
import { formatYen } from '../lib/catalog'
import type { Deal } from '../lib/catalog'
import { channelLabel, isUrgent, place, timeLeft } from '../lib/format'
import { useFavoriteAction, useStore } from '../lib/store'
import { ClockIcon, HeartIcon, PinIcon } from './Icons'
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
  /** 1-based position in a ranked list. Shows a "No.1" tab. */
  rank?: number
  headingLevel?: 'h2' | 'h3'
}

export function DealCard({ deal, rank, headingLevel: Heading = 'h3' }: DealCardProps) {
  const where = place(deal)
  return (
    <article className="card">
      <div className="card__photo">
        <img src={deal.image} alt="" loading="lazy" width={900} height={900} />
        {rank !== undefined && <span className="card__rank">No.{rank}</span>}
      </div>
      <Sticker pct={deal.discountPct} size="md" className="card__sticker" />
      <FavButton deal={deal} className="card__fav" />
      <div className="card__body">
        <p className="card__meta">
          <span>{deal.store}</span>
          <span className={`tag tag--${deal.channel}`}>{channelLabel(deal)}</span>
        </p>
        <Heading className="card__title">
          <Link to={`/deal/${deal.id}`} className="card__link">
            {deal.title}
          </Link>
        </Heading>
        <p className="card__brand">{deal.brand}</p>
        <p className="card__prices">
          <span className="sr-only">Sale price </span>
          <span className="price">{formatYen(deal.salePrice)}</span>
          <span className="sr-only">, was </span>
          <s className="was">{formatYen(deal.originalPrice)}</s>
        </p>
        <ul className="card__foot">
          <li className={isUrgent(deal) ? 'is-urgent' : undefined}>
            <ClockIcon />
            {timeLeft(deal)}
          </li>
          {where && (
            <li>
              <PinIcon />
              {where}
            </li>
          )}
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
          <span className="price">{formatYen(deal.salePrice)}</span>
          <s className="was">{formatYen(deal.originalPrice)}</s>
          <span className="row__store">{deal.store}</span>
        </p>
      </div>
      <Sticker pct={deal.discountPct} size="sm" className="row__sticker" />
    </article>
  )
}
