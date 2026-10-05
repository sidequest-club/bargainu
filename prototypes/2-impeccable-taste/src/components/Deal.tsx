import { ClockIcon, HeartIcon, MapPinIcon } from '@phosphor-icons/react'
import { formatYen, imageUrl } from '@shared/deals'
import type { Deal } from '@shared/deals'
import { URGENT_HOURS, foundAgo, placeLabel, sealTier, timeLeft } from '../lib/format'
import { href } from '../lib/router'
import { useSave } from '../lib/useSave'

/** The first row of a grid is likely above the fold, so it loads without waiting for scroll. */
const EAGER_TILES = 4

type SealSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** The discount as a round paper seal. Its diameter steps up with the discount. */
export function Seal({ pct, size, stamped = false }: { pct: number; size?: SealSize; stamped?: boolean }) {
  const tier = size ?? sealTier(pct)
  return (
    <span className={`seal seal--${tier}${stamped ? ' is-stamped' : ''}`}>
      <span className="visually-hidden">{pct}% off</span>
      <span className="seal__pct" aria-hidden="true">
        {pct}
        <span className="seal__sign">%</span>
      </span>
      {tier !== 'xs' && (
        <span className="seal__off" aria-hidden="true">
          OFF
        </span>
      )}
    </span>
  )
}

export function SaveIconButton({ saved, onToggle, title }: { saved: boolean; onToggle: () => void; title: string }) {
  return (
    <button
      type="button"
      className={`save-button${saved ? ' is-saved' : ''}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from favorites` : `Save ${title} to favorites`}
      onClick={onToggle}
    >
      <HeartIcon weight={saved ? 'fill' : 'regular'} aria-hidden="true" />
    </button>
  )
}

export function Price({ deal, size = 'md' }: { deal: Deal; size?: 'md' | 'lg' }) {
  return (
    <p className={`price price--${size}`}>
      <span className="visually-hidden">Sale price </span>
      <span className="price__sale">{formatYen(deal.salePrice)}</span>
      <span className="visually-hidden">, was </span>
      <s className="price__was">{formatYen(deal.originalPrice)}</s>
    </p>
  )
}

export function TimeLeft({ hours }: { hours: number }) {
  return (
    <span className={`time-left${hours < URGENT_HOURS ? ' is-urgent' : ''}`}>
      <ClockIcon weight={hours < URGENT_HOURS ? 'fill' : 'regular'} aria-hidden="true" />
      {timeLeft(hours)}
    </span>
  )
}

/** Time left, plus the place for in-store deals. Store names stay plain text. */
export function Meta({ deal }: { deal: Deal }) {
  const place = placeLabel(deal)
  return (
    <p className="meta">
      <TimeLeft hours={deal.endsInHours} />
      {place && (
        <span className="meta__place">
          <MapPinIcon weight="fill" aria-hidden="true" />
          {place}
        </span>
      )}
    </p>
  )
}

/** Cardless product tile: a photo well, the seal straddling its edge, text set on the ground. */
export function DealTile({ deal, headingLevel = 3, eager = false }: { deal: Deal; headingLevel?: 2 | 3; eager?: boolean }) {
  const { saved, stamped, toggle } = useSave(deal)
  const Heading = `h${headingLevel}` as const
  return (
    <article className="tile">
      <div className="tile__photo">
        <img src={imageUrl(deal)} alt="" width={900} height={900} loading={eager ? 'eager' : 'lazy'} decoding="async" />
        <Seal pct={deal.discountPct} stamped={stamped} />
      </div>
      <div className="tile__body">
        <p className="tile__store">{deal.store}</p>
        <Heading className="tile__title">
          <a href={href(`/deal/${deal.id}`)} className="tile__link">
            <span className="tile__brand">{deal.brand}</span> {deal.title}
          </a>
        </Heading>
        <Price deal={deal} />
        <Meta deal={deal} />
      </div>
      <SaveIconButton saved={saved} onToggle={toggle} title={deal.title} />
    </article>
  )
}

/** Compact row for short lists where time matters more than the photo. */
export function DealRow({ deal, lead }: { deal: Deal; lead: 'ending' | 'found' }) {
  return (
    <li className="row">
      <div className="row__thumb">
        <img src={imageUrl(deal)} alt="" width={900} height={900} loading="lazy" decoding="async" />
        <Seal pct={deal.discountPct} size="xs" />
      </div>
      <div className="row__body">
        <a href={href(`/deal/${deal.id}`)} className="row__link">
          {deal.title}
        </a>
        <p className="row__meta">
          {deal.store}
          <span className="row__lead">{lead === 'ending' ? timeLeft(deal.endsInHours) : foundAgo(deal.postedHoursAgo).replace('Found ', '')}</span>
        </p>
      </div>
      <div className="row__figures">
        <span className="row__price">{formatYen(deal.salePrice)}</span>
        <s className="row__was">{formatYen(deal.originalPrice)}</s>
      </div>
    </li>
  )
}

export function DealGrid({ deals, wide = false, headingLevel }: { deals: Deal[]; wide?: boolean; headingLevel?: 2 | 3 }) {
  return (
    <ul className={`grid${wide ? ' grid--wide' : ''}`}>
      {deals.map((d, i) => (
        <li key={d.id}>
          <DealTile deal={d} headingLevel={headingLevel} eager={i < EAGER_TILES} />
        </li>
      ))}
    </ul>
  )
}
