import { ArrowRight, MapPin } from 'lucide-react'
import { categories, deals, imageUrl, stores, topDiscounts } from '@shared/deals'
import { DealCard, DealRow, dealHref } from '../components/DealCard'
import { Sticker } from '../components/Sticker'
import { href } from '../lib/router'

const ENDING_SOON_COUNT = 4
const JUST_FOUND_COUNT = 6

// Each home section shows different deals, so the page surfaces as much of the list as it can.
const beyondTop = deals.filter((d) => !topDiscounts.includes(d))
const endingSoon = [...beyondTop].sort((a, b) => a.endsInHours - b.endsInHours).slice(0, ENDING_SOON_COUNT)
const justFound = beyondTop
  .filter((d) => !endingSoon.includes(d))
  .sort((a, b) => a.postedHoursAgo - b.postedHoursAgo)
  .slice(0, JUST_FOUND_COUNT)
const inStoreCount = deals.filter((d) => d.channel === 'in-store').length

const categoryTiles = categories.map((category) => {
  const inCategory = deals.filter((d) => d.category === category)
  const best = inCategory.reduce((a, b) => (b.discountPct > a.discountPct ? b : a))
  return { category, count: inCategory.length, best }
})

const pile = topDiscounts.slice(0, 3)
const pileSlots = ['front', 'back', 'side'] as const

function SectionHead({ id, title, note, to, linkLabel }: { id: string; title: string; note: string; to: string; linkLabel: string }) {
  return (
    <div className="section__head">
      <div>
        <h2 id={id} className="section__title">
          {title}
        </h2>
        <p className="section__note">{note}</p>
      </div>
      <a className="more" href={to}>
        {linkLabel}
        <ArrowRight className="icon-sm" aria-hidden="true" />
      </a>
    </div>
  )
}

export function Home() {
  return (
    <>
      <section className="hero on-brand" aria-labelledby="hero-title">
        <div className="wrap hero__inner">
          <div className="hero__copy">
            <h1 id="hero-title" className="hero__title">
              Good deals, sniffed out.
            </h1>
            <p className="hero__lede">
              {deals.length} live discounts from {stores.slice(0, -1).join(', ')} and {stores.at(-1)}, sorted so the
              biggest price drops come first.
            </p>
            <div className="hero__actions">
              <a className="btn btn--sticker" href={href('/browse')}>
                Browse all deals
              </a>
              <a className="btn btn--on-brand" href={href('/browse', { ch: 'in-store' })}>
                <MapPin className="icon-md" aria-hidden="true" />
                {inStoreCount} deals in stores
              </a>
            </div>
          </div>
          <ul className="pile" aria-label="Today's three biggest discounts">
            {pile.map((deal, i) => (
              <li key={deal.id} className={`pile__item pile__item--${pileSlots[i]}`}>
                <a className="pile__link" href={dealHref(deal)}>
                  <img src={imageUrl(deal)} alt={deal.title} width={900} height={900} fetchPriority={i === 0 ? 'high' : 'auto'} />
                  <Sticker pct={deal.discountPct} size={i === 0 ? 'lg' : 'md'} className="pile__sticker" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="top-title">
        <SectionHead
          id="top-title"
          title="Top Discounts"
          note="The 8 biggest percentage drops right now."
          to={href('/browse')}
          linkLabel="See all deals"
        />
        <ol className="grid grid--four">
          {topDiscounts.map((deal, i) => (
            <li key={deal.id}>
              <DealCard deal={deal} rank={i + 1} eager={i < 4} />
            </li>
          ))}
        </ol>
      </section>

      <section className="section section--band" aria-labelledby="cat-title">
        <div className="wrap">
          <div className="section__head">
            <div>
              <h2 id="cat-title" className="section__title">
                Shop by category
              </h2>
              <p className="section__note">Each one opens the deal list with that category selected.</p>
            </div>
          </div>
          <ul className="tiles">
            {categoryTiles.map(({ category, count, best }) => (
              <li key={category}>
                <a className="tile" href={href('/browse', { cat: category })}>
                  <img className="tile__photo" src={imageUrl(best)} alt="" width={900} height={900} loading="lazy" decoding="async" />
                  <span className="tile__name">{category}</span>
                  <span className="tile__count">
                    {count} deals, up to {best.discountPct}% off
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="ending-title">
        <SectionHead
          id="ending-title"
          title="Ending soon"
          note="Outside the top 8, these prices go back up first."
          to={href('/browse', { sort: 'ending' })}
          linkLabel="All deals by time left"
        />
        <ul className="grid grid--four">
          {endingSoon.map((deal) => (
            <li key={deal.id}>
              <DealCard deal={deal} />
            </li>
          ))}
        </ul>
      </section>

      <section className="section wrap" aria-labelledby="found-title">
        <SectionHead
          id="found-title"
          title="Just found"
          note="Recent additions you have not seen above."
          to={href('/browse', { sort: 'newest' })}
          linkLabel="All deals by newest"
        />
        <ul className="rows">
          {justFound.map((deal) => (
            <li key={deal.id}>
              <DealRow deal={deal} />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
