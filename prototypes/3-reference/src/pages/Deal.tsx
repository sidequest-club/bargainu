import { useReducedMotion } from 'motion/react'
import { deals, formatYen, getDeal, imageUrl } from '@shared/deals'
import { DealCard, useFavoriteAction } from '../components/DealCard'
import { ArrowOutIcon, ClockIcon, HeartIcon, PinIcon, StarIcon, TagIcon } from '../components/Icons'
import { EmptyState } from '../components/Shell'
import { Sticker } from '../components/Sticker'
import NumberTicker from '../fancy/basic-number-ticker'
import CenterUnderline from '../fancy/underline-center'
import { channelLabel, duration, foundAgo, isUrgent, place } from '../lib/format'
import { Link } from '../lib/router'
import { useStore } from '../lib/store'
import { tokenNumber, useSettled } from '../lib/tokens'

const RELATED_COUNT = 4

export function DealPage({ id }: { id: string }) {
  const deal = getDeal(id)
  const { isFavorite, showToast } = useStore()
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
  const where = place(deal)
  const saving = deal.originalPrice - deal.salePrice
  const sameCategory = deals.filter((d) => d.category === deal.category && d.id !== deal.id)
  const filler = deals
    .filter((d) => d.category !== deal.category && d.store === deal.store)
    .sort((a, b) => b.discountPct - a.discountPct)
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
            <img src={imageUrl(deal)} alt={`${deal.title} by ${deal.brand}`} width={900} height={900} />
          </div>
          <Sticker
            key={deal.id}
            pct={deal.discountPct}
            size="lg"
            className="detail__sticker"
            number={
              reduced || settled ? undefined : (
                <NumberTicker from={0} target={deal.discountPct} transition={{ duration: tokenNumber('--count-duration'), type: 'tween', ease: 'easeOut' }} />
              )
            }
          />
        </div>

        <div className="detail__info">
          <p className="detail__meta">
            <span className="tag tag--store">{deal.store}</span>
            <span className={`tag tag--${deal.channel}`}>{channelLabel(deal)}</span>
            <span className="detail__rating">
              <StarIcon />
              {deal.rating.toFixed(1)}
              <span className="detail__reviews">({deal.reviews.toLocaleString('en-US')} reviews)</span>
            </span>
          </p>
          <h1 className="detail__title">{deal.title}</h1>
          <p className="detail__brand">
            by {deal.brand} in {deal.category}
          </p>

          <div className="pricebox">
            <p className="pricebox__sale">
              <span className="sr-only">Sale price </span>
              <span className="price price--xl">{formatYen(deal.salePrice)}</span>
              <span className="pricebox__tax">tax incl.</span>
            </p>
            <p className="pricebox__was">
              Was <s className="was">{formatYen(deal.originalPrice)}</s>
              <span className="pricebox__save">
                You save {formatYen(saving)} ({deal.discountPct}%)
              </span>
            </p>
          </div>

          <dl className="facts">
            <div className={`facts__item${isUrgent(deal) ? ' is-urgent' : ''}`}>
              <dt>
                <ClockIcon />
                Time left
              </dt>
              <dd>
                {duration(deal.endsInHours)}
                {isUrgent(deal) && <span className="facts__flag">Ends today</span>}
              </dd>
            </div>
            <div className="facts__item">
              <dt>
                <TagIcon />
                Store
              </dt>
              <dd>{deal.store}</dd>
            </div>
            {where && (
              <div className="facts__item facts__item--wide">
                <dt>
                  <PinIcon />
                  Location
                </dt>
                <dd>
                  {deal.store}, {where}
                  <span className="facts__note">In-store only. Check stock before you go.</span>
                </dd>
              </div>
            )}
          </dl>

          <div className="detail__actions">
            <a
              href={`#/deal/${deal.id}`}
              className="btn btn--cta btn--lg"
              onClick={(event) => {
                event.preventDefault()
                showToast(`This prototype stops here. The real link opens ${deal.store}.`)
              }}
            >
              Go to store
              <ArrowOutIcon />
            </a>
            <button type="button" className={`btn btn--paper btn--lg${saved ? ' is-saved' : ''}`} aria-pressed={saved} onClick={() => act(deal)}>
              <HeartIcon />
              {saved ? 'Saved' : 'Save to favorites'}
            </button>
          </div>

          <p className="detail__blurb">{deal.blurb}</p>
          <p className="detail__found">{foundAgo(deal)}. Price checked against the store's list price.</p>
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
