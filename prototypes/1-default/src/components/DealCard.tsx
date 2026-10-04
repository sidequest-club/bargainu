import { Clock, MapPin } from 'lucide-react'
import { formatYen, imageUrl } from '@shared/deals'
import type { Deal } from '@shared/deals'
import { href } from '../lib/router'
import { foundAgo, isUrgent, timeLeftShort } from '../lib/time'
import { SaveButton } from './SaveButton'
import { Sticker } from './Sticker'

export const dealHref = (deal: Deal) => href(`/deal/${deal.id}`)

export const placeLabel = (deal: Deal) =>
  deal.channel === 'in-store' ? `${deal.store}, ${deal.city}` : `${deal.store}, online`

export function Price({ deal }: { deal: Deal }) {
  return (
    <span className="price">
      <span className="sr-only">Sale price </span>
      <span className="price__sale num">{formatYen(deal.salePrice)}</span>{' '}
      <span className="sr-only">Was </span>
      <s className="price__was num">{formatYen(deal.originalPrice)}</s>
    </span>
  )
}

export function TimeLeft({ deal }: { deal: Deal }) {
  return (
    <span className={`timeleft ${isUrgent(deal) ? 'timeleft--urgent' : ''}`}>
      <Clock className="icon-sm" aria-hidden="true" />
      {timeLeftShort(deal.endsInHours)}
    </span>
  )
}

interface DealCardProps {
  deal: Deal
  rank?: number
  eager?: boolean
}

export function DealCard({ deal, rank, eager = false }: DealCardProps) {
  return (
    <article className="deal">
      <a className="deal__link" href={dealHref(deal)}>
        <span className="deal__photo">
          <img
            src={imageUrl(deal)}
            alt=""
            width={900}
            height={900}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
          <Sticker pct={deal.discountPct} className="deal__sticker" />
          {rank ? (
            <span className="deal__rank num">
              <span className="sr-only">Rank </span>
              {rank}
            </span>
          ) : null}
        </span>
        <span className="deal__brand" translate="no">
          {deal.brand}
        </span>
        <h3 className="deal__title">{deal.title}</h3>
        <Price deal={deal} />
        <span className="deal__meta">
          <span className="deal__place">
            {deal.channel === 'in-store' ? <MapPin className="icon-sm" aria-hidden="true" /> : null}
            {placeLabel(deal)}
          </span>
          <TimeLeft deal={deal} />
        </span>
      </a>
      <SaveButton deal={deal} className="deal__save" />
    </article>
  )
}

/** Compact one-line version for dense lists such as "Just found". */
export function DealRow({ deal }: { deal: Deal }) {
  return (
    <a className="dealrow" href={dealHref(deal)}>
      <img className="dealrow__photo" src={imageUrl(deal)} alt="" width={900} height={900} loading="lazy" decoding="async" />
      <span className="dealrow__body">
        <span className="dealrow__found">{foundAgo(deal.postedHoursAgo)}</span>
        <span className="dealrow__title">{deal.title}</span>
        <Price deal={deal} />
        <span className="deal__place">{placeLabel(deal)}</span>
      </span>
      <Sticker pct={deal.discountPct} size="sm" className="dealrow__sticker" />
    </a>
  )
}
