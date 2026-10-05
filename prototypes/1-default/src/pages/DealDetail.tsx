import { ChevronRight, Clock, ExternalLink, MapPin, Star, Store as StoreIcon } from 'lucide-react'
import { deals, formatYen, getDeal, imageUrl } from '@shared/deals'
import type { Deal } from '@shared/deals'
import { DealCard } from '../components/DealCard'
import { EmptyState } from '../components/EmptyState'
import { SaveButton } from '../components/SaveButton'
import { Sticker } from '../components/Sticker'
import { href } from '../lib/router'
import { useStore } from '../lib/store'
import { formatCount, foundAgo, isUrgent, useCountdown } from '../lib/time'

const RELATED_COUNT = 4

const relatedTo = (deal: Deal) => {
  const others = deals.filter((d) => d.id !== deal.id)
  const sameCategory = others.filter((d) => d.category === deal.category)
  const sameBrand = others.filter((d) => d.brand === deal.brand && d.category !== deal.category)
  return [...sameCategory, ...sameBrand].slice(0, RELATED_COUNT)
}

const two = (n: number) => String(n).padStart(2, '0')

function Countdown({ deal }: { deal: Deal }) {
  const c = useCountdown(deal)
  const parts = [
    ...(c.days > 0 ? [{ value: String(c.days), unit: c.days === 1 ? 'day' : 'days' }] : []),
    { value: two(c.hours), unit: 'h' },
    { value: two(c.minutes), unit: 'min' },
    { value: two(c.seconds), unit: 's' },
  ]

  return (
    <div className={`countdown ${isUrgent(deal) ? 'countdown--urgent' : ''}`}>
      <Clock className="icon-md" aria-hidden="true" />
      <div>
        <p className="countdown__label">{c.ended ? 'This deal has ended' : isUrgent(deal) ? 'Ends today' : 'Time left'}</p>
        {/* The ticking clock is decorative for assistive tech; the summary below is read instead. */}
        <p className="countdown__clock num" aria-hidden="true">
          {parts.map((p) => (
            <span key={p.unit} className="countdown__part">
              {p.value}
              <span className="countdown__unit">{p.unit}</span>
            </span>
          ))}
        </p>
        <p className="sr-only">
          {c.days > 0 ? `${c.days} days and ` : ''}
          {c.hours} hours left
        </p>
      </div>
    </div>
  )
}

export function DealDetail({ id }: { id: string }) {
  const deal = getDeal(id)
  const { notify } = useStore()

  if (!deal) {
    return (
      <div className="wrap">
        <EmptyState
          headingLevel="h1"
          title="This deal is gone"
          actions={
            <a className="btn btn--primary" href={href('/browse')}>
              Browse all deals
            </a>
          }
        >
          It may have ended, or the link is wrong. There are {deals.length} other deals on the list.
        </EmptyState>
      </div>
    )
  }

  const related = relatedTo(deal)
  const saving = deal.originalPrice - deal.salePrice
  const inStore = deal.channel === 'in-store'

  return (
    <div className="wrap detail">
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href={href('/browse')}>Browse</a>
            <ChevronRight className="icon-sm" aria-hidden="true" />
          </li>
          <li>
            <a href={href('/browse', { cat: deal.category })}>{deal.category}</a>
            <ChevronRight className="icon-sm" aria-hidden="true" />
          </li>
          <li aria-current="page">{deal.title}</li>
        </ol>
      </nav>

      <div className="detail__layout">
        <div className="detail__media">
          <div className="detail__photo">
            <img src={imageUrl(deal)} alt={deal.title} width={900} height={900} fetchPriority="high" />
            <Sticker pct={deal.discountPct} size="lg" className="detail__sticker" />
          </div>
        </div>

        <div className="detail__info">
          <p className="detail__brand">
            <a href={href('/browse', { brand: deal.brand })} translate="no">
              {deal.brand}
            </a>
          </p>
          <h1 className="detail__title">{deal.title}</h1>
          <p className="detail__rating">
            <Star className="icon-sm detail__star" aria-hidden="true" />
            <span className="num">
              <span className="sr-only">Rated </span>
              {deal.rating.toFixed(1)}
              <span className="sr-only"> out of 5</span>
            </span>
            <span className="detail__reviews num">{formatCount(deal.reviews)} reviews</span>
            <span className="detail__reviews">{foundAgo(deal.postedHoursAgo)}</span>
          </p>

          <div className="pricebox">
            <p className="pricebox__sale num">
              <span className="sr-only">Sale price </span>
              {formatYen(deal.salePrice)}
            </p>
            <p className="pricebox__was">
              <span className="sr-only">Original price </span>
              <s className="num">{formatYen(deal.originalPrice)}</s>
              <span className="pricebox__saving num">
                {deal.discountPct}% off, you save {formatYen(saving)}
              </span>
            </p>
            <p className="pricebox__tax">Tax included</p>
          </div>

          <Countdown deal={deal} />

          <dl className="facts">
            <div className="facts__row">
              <dt>
                <StoreIcon className="icon-md" aria-hidden="true" />
                Sold by
              </dt>
              <dd>
                {deal.store}
                <span className="facts__sub">{inStore ? 'In-store only' : 'Online'}</span>
              </dd>
            </div>
            {inStore ? (
              <div className="facts__row">
                <dt>
                  <MapPin className="icon-md" aria-hidden="true" />
                  Location
                </dt>
                <dd>
                  {deal.store} {deal.city}, {deal.prefecture}
                  <span className="facts__sub">
                    This price is only available at this branch.{' '}
                    <a className="inline-link" href={href('/browse', { pref: deal.prefecture ?? '', city: deal.city ?? '' })}>
                      More deals in {deal.city}
                    </a>
                  </span>
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="detail__actions">
            <a
              className="btn btn--sticker btn--lg detail__go"
              href={href(`/deal/${deal.id}`)}
              onClick={(e) => {
                e.preventDefault()
                notify(`${deal.store} links are switched off in this prototype`)
              }}
            >
              Go to {deal.store}
              <ExternalLink className="icon-md" aria-hidden="true" />
            </a>
            <SaveButton deal={deal} variant="full" className="btn--lg" />
          </div>

          <div className="detail__about">
            <h2 className="detail__subhead">About this deal</h2>
            <p>{deal.blurb}</p>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="section section--flush" aria-labelledby="related-title">
          <div className="section__head">
            <div>
              <h2 id="related-title" className="section__title">
                Related deals
              </h2>
              <p className="section__note">More in {deal.category} and from {deal.brand}.</p>
            </div>
          </div>
          <ul className="grid grid--four">
            {related.map((d) => (
              <li key={d.id}>
                <DealCard deal={d} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
