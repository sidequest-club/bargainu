import { useState } from 'react'
import { ArrowSquareOutIcon, CaretRightIcon, ClockIcon, HeartIcon, MapPinIcon, StarIcon } from '@phosphor-icons/react'
import { deals, formatYen, getDeal, imageUrl } from '@shared/deals'
import { DealGrid, Seal } from '../components/Deal'
import { EmptyState } from '../components/Shell'
import { URGENT_HOURS, endsAt, foundAgo, timeLeftLong } from '../lib/format'
import { href } from '../lib/router'
import { useSave } from '../lib/useSave'

export function DealPage({ id }: { id: string }) {
  const deal = getDeal(id)
  if (!deal) {
    return (
      <div className="page">
        <EmptyState
          title="This deal has gone"
          actions={
            <a href={href('/browse')} className="button button--accent">
              Browse current deals
            </a>
          }
        >
          It may have ended, or the link is wrong. There are {deals.length} other deals live right now.
        </EmptyState>
      </div>
    )
  }
  // Keyed by id so the "store link" notice and the seal stamp reset when moving between related deals.
  return <DealView key={deal.id} id={deal.id} />
}

function DealView({ id }: { id: string }) {
  const deal = getDeal(id)!
  const { saved, stamped, toggle } = useSave(deal)
  const [storeNotice, setStoreNotice] = useState(false)
  const urgent = deal.endsInHours < URGENT_HOURS
  const inStore = deal.channel === 'in-store'

  const sameCategory = deals.filter((d) => d.category === deal.category && d.id !== deal.id)
  const sameBrand = deals.filter((d) => d.brand === deal.brand && d.category !== deal.category)
  const related = [...sameCategory, ...sameBrand].slice(0, 4)

  return (
    <div className="page detail">
      <nav className="crumbs" aria-label="Breadcrumb">
        <a href={href('/browse')}>Browse</a>
        <CaretRightIcon weight="bold" aria-hidden="true" />
        <a href={href('/browse', { cat: deal.category })}>{deal.category}</a>
      </nav>

      <article className="detail__main">
        <div className="detail__photo">
          <img src={imageUrl(deal)} alt={`${deal.brand} ${deal.title}`} width={900} height={900} fetchPriority="high" />
          <Seal pct={deal.discountPct} size="xl" stamped={stamped} />
        </div>

        <div className="detail__info">
          <p className="detail__brand">
            <a href={href('/browse', { brand: deal.brand })}>{deal.brand}</a>
          </p>
          <h1 className="detail__title">{deal.title}</h1>
          <p className="detail__rating">
            <StarIcon weight="fill" aria-hidden="true" />
            <span className="visually-hidden">Rated </span>
            {deal.rating.toFixed(1)}
            <span className="detail__reviews">{deal.reviews.toLocaleString('ja-JP')} reviews</span>
          </p>

          <div className="detail__price">
            <p className="price price--lg">
              <span className="visually-hidden">Sale price </span>
              <span className="price__sale">{formatYen(deal.salePrice)}</span>
              <span className="visually-hidden">, original price </span>
              <s className="price__was">{formatYen(deal.originalPrice)}</s>
            </p>
            <p className="detail__saving">
              {deal.discountPct}% off. You save {formatYen(deal.originalPrice - deal.salePrice)}, tax included.
            </p>
          </div>

          <dl className="facts">
            <div className="facts__item">
              <dt>Store</dt>
              <dd>
                {deal.store}
                <span className="facts__sub">{inStore ? 'In-store deal' : 'Online deal'}</span>
              </dd>
            </div>
            <div className={`facts__item${urgent ? ' is-urgent' : ''}`}>
              <dt>Time left</dt>
              <dd>
                <span className="facts__lead">
                  <ClockIcon weight={urgent ? 'fill' : 'regular'} aria-hidden="true" />
                  {timeLeftLong(deal.endsInHours)}
                </span>
                <span className="facts__sub">Until {endsAt(deal.endsInHours)}</span>
              </dd>
            </div>
            {inStore && (
              <div className="facts__item">
                <dt>Location</dt>
                <dd>
                  <span className="facts__lead">
                    <MapPinIcon weight="fill" aria-hidden="true" />
                    {deal.city}, {deal.prefecture}
                  </span>
                  <span className="facts__sub">
                    Only at {deal.store} stores in {deal.city}.{' '}
                    <a href={href('/browse', { ch: 'in-store', pref: deal.prefecture, city: deal.city })}>More deals here</a>
                  </span>
                </dd>
              </div>
            )}
          </dl>

          <div className="detail__actions">
            {/* A dead link by design: the prototype has no store URLs. */}
            <a
              href={href(`/deal/${deal.id}`)}
              className="button button--accent button--lg"
              onClick={(e) => {
                e.preventDefault()
                setStoreNotice(true)
              }}
            >
              Go to store
              <ArrowSquareOutIcon weight="bold" aria-hidden="true" />
            </a>
            <button type="button" className={`button button--outline button--lg save-wide${saved ? ' is-saved' : ''}`} aria-pressed={saved} onClick={toggle}>
              <HeartIcon weight={saved ? 'fill' : 'regular'} aria-hidden="true" />
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
          <p className="detail__notice" role="status" aria-live="polite">
            {storeNotice && `This would open ${deal.store}. Store links are switched off in the prototype.`}
          </p>

          <p className="detail__blurb">{deal.blurb}</p>
          <p className="detail__found">{foundAgo(deal.postedHoursAgo)}</p>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section" aria-labelledby="related-title">
          <div className="section__head">
            <h2 id="related-title" className="section__title">
              Related deals
            </h2>
            <a href={href('/browse', { cat: deal.category })} className="link-more">
              All {deal.category}
            </a>
          </div>
          <DealGrid deals={related} wide />
        </section>
      )}
    </div>
  )
}
