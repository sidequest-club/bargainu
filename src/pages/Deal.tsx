import { useReducedMotion } from 'motion/react'
import { Link, useParams } from 'react-router'
import { DealCard } from '../components/DealCard'
import { ArrowOutIcon, ClockIcon, HeartIcon, StarIcon, TagIcon } from '../components/Icons'
import { EmptyState } from '../components/Shell'
import { Sticker } from '../components/Sticker'
import NumberTicker from '../fancy/basic-number-ticker'
import CenterUnderline from '../fancy/underline-center'
import { formatYen, useCatalog } from '../lib/catalog'
import {
  byEnding,
  duration,
  foundAgo,
  isUrgent,
  jstTime,
  priceAsOf,
  promotionLabel,
} from '../lib/format'
import type { Promotion } from '../lib/catalog'
import { PRICE_NOTICE } from '../lib/rakuten'
import { useFavoriteAction, useStore } from '../lib/store'
import { tokenNumber, useSettled } from '../lib/tokens'

const RELATED_COUNT = 4

export function DealPage() {
  const { id = '' } = useParams()
  const { deals, getDeal } = useCatalog()
  const deal = getDeal(id)
  const { isFavorite } = useStore()
  const act = useFavoriteAction()
  const reduced = useReducedMotion()
  const settled = useSettled(id)

  if (!deal) {
    return (
      <div className="wrap page">
        <EmptyState title="That deal has left the pile">
          <p>It may have ended, or the link is wrong. There are plenty more.</p>
          <Link to="/browse" className="btn btn--cta">
            Browse all deals
          </Link>
        </EmptyState>
      </div>
    )
  }

  const saved = isFavorite(deal.id)
  const sameCategory = deals.filter((d) => d.category === deal.category && d.id !== deal.id)
  // v1 has one store, so "same store" would be every deal; the same shop is the closer match.
  const filler = deals
    .filter((d) => d.category !== deal.category && d.shopCode === deal.shopCode)
    .sort(byEnding)
  const related = [...sameCategory, ...filler].slice(0, RELATED_COUNT)

  return (
    <div className="wrap page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/browse">
              <CenterUnderline>All deals</CenterUnderline>
            </Link>
          </li>
          <li>
            <Link to={`/browse?category=${encodeURIComponent(deal.category)}`}>
              <CenterUnderline>{deal.category}</CenterUnderline>
            </Link>
          </li>
          <li aria-current="page">{deal.title}</li>
        </ol>
      </nav>

      <article className="detail">
        <div className="detail__media">
          <div className="detail__photo">
            <img src={deal.image} alt={deal.title} width={900} height={900} />
          </div>
          <Sticker
            key={deal.id}
            rate={deal.pointRate}
            size="lg"
            className="detail__sticker"
            number={
              reduced || settled || deal.pointRate === null ? undefined : (
                <NumberTicker
                  from={0}
                  target={deal.pointRate}
                  transition={{
                    duration: tokenNumber('--count-duration'),
                    type: 'tween',
                    ease: 'easeOut',
                  }}
                />
              )
            }
          />
        </div>

        <div className="detail__info">
          <p className="detail__meta">
            <span className="tag tag--store">{deal.store}</span>
            {deal.promotions.map((promotion) => (
              <span key={promotion.kind} className="tag">
                {promotionLabel(promotion)}
              </span>
            ))}
            {/* Rakuten sends a rating of 0 for an item nobody has reviewed. */}
            {deal.reviews > 0 && (
              <span className="detail__rating">
                <StarIcon />
                {deal.rating.toFixed(1)}
                <span className="detail__reviews">
                  ({deal.reviews.toLocaleString('en-US')} reviews)
                </span>
              </span>
            )}
          </p>
          <h1 className="detail__title">{deal.title}</h1>
          <p className="detail__shop">
            Sold by {deal.shopName} in {deal.category}
          </p>

          <div className="pricebox">
            <p className="pricebox__sale">
              <span className="price price--xl">{formatYen(deal.price)}</span>
              <span className="pricebox__tax">tax incl.</span>
            </p>
            <p className="pricebox__asof">{priceAsOf(deal)}</p>
            {deal.store === 'Rakuten' && (
              <p className="pricebox__notice" lang="ja">
                {PRICE_NOTICE}
              </p>
            )}
          </div>

          <dl className="facts">
            <div className={`facts__item${isUrgent(deal) ? ' is-urgent' : ''}`}>
              <dt>
                <ClockIcon />
                Time left
              </dt>
              <dd>
                {deal.endsInHours === null ? 'No end date' : duration(deal.endsInHours)}
                {isUrgent(deal) && <span className="facts__flag">Ends today</span>}
              </dd>
            </div>
            <div className="facts__item">
              <dt>
                <TagIcon />
                Shop
              </dt>
              <dd>
                {deal.shopName}
                <span className="facts__note">On {deal.store}</span>
              </dd>
            </div>
            {deal.promotions.map((promotion) => (
              <div key={promotion.kind} className="facts__item">
                <dt>
                  <StarIcon />
                  {promotion.kind === 'sale' ? 'Sale' : 'Points'}
                </dt>
                <dd>
                  {promotionLabel(promotion)}
                  <span className="facts__note">{until(promotion)}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="detail__actions">
            <a href={deal.url} className="btn btn--cta btn--lg" target="_blank" rel="noreferrer">
              Go to {deal.store}
              <span className="sr-only"> (opens in a new tab)</span>
              <ArrowOutIcon />
            </a>
            <button
              type="button"
              className={`btn btn--paper btn--lg${saved ? ' is-saved' : ''}`}
              aria-pressed={saved}
              onClick={() => act(deal)}
            >
              <HeartIcon />
              {saved ? 'Saved' : 'Save to favorites'}
            </button>
          </div>

          <p className="detail__blurb">{deal.blurb}</p>
          <p className="detail__found">
            {foundAgo(deal)}. {deal.store} gives no original price, so the dog shows why it is a
            deal instead of a discount.
          </p>
        </div>
      </article>

      <section className="related" aria-labelledby="related-title">
        <header className="related__head">
          <h2 id="related-title" className="title title--sm">
            More from the same pile
          </h2>
          <Link to={`/browse?category=${encodeURIComponent(deal.category)}`} className="text-link">
            <CenterUnderline>All {deal.category.toLowerCase()} deals</CenterUnderline>
          </Link>
        </header>
        <ul className="grid grid--related">
          {related.map((d) => (
            <li key={d.id}>
              <DealCard deal={d} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

const until = (promotion: Promotion) =>
  promotion.endsAt === null ? 'No end date' : `Until ${jstTime(promotion.endsAt)}`
