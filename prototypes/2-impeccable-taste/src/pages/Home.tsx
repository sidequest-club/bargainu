import { ArrowRightIcon, MapPinIcon } from '@phosphor-icons/react'
import { categories, deals, formatYen, imageUrl, prefectures, topDiscounts } from '@shared/deals'
import { DealGrid, DealRow, Seal, TimeLeft } from '../components/Deal'
import { SearchForm } from '../components/Shell'
import { href } from '../lib/router'

const featured = topDiscounts[0]
const endingSoon = [...deals].sort((a, b) => a.endsInHours - b.endsInHours).slice(0, 5)
// Skip deals already listed under "Ending soon" so the two lists do not repeat each other.
const justFound = [...deals]
  .filter((d) => !endingSoon.includes(d))
  .sort((a, b) => a.postedHoursAgo - b.postedHoursAgo)
  .slice(0, 5)

const categoryCards = categories.map((name) => {
  const inCategory = deals.filter((d) => d.category === name)
  const best = inCategory.reduce((a, b) => (b.discountPct > a.discountPct ? b : a))
  return { name, count: inCategory.length, best }
})

const prefectureCounts = prefectures.map((name) => ({ name, count: deals.filter((d) => d.prefecture === name).length }))

export function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__inner">
          <div className="hero__copy">
            <h1 id="hero-title" className="hero__title">
              Today&rsquo;s sales from three stores, in one list.
            </h1>
            <p className="hero__text">
              Bargainu checks Yodobashi, Rakuten and Amazon for live discounts, online and in store, so you don&rsquo;t have to.
            </p>
            <div className="hero__actions">
              <a href={href('/browse')} className="button button--accent">
                Browse all {deals.length} deals
                <ArrowRightIcon weight="bold" aria-hidden="true" />
              </a>
              <a href={href('/browse', { ch: 'in-store' })} className="button button--on-shell">
                In-store deals
              </a>
            </div>
          </div>

          <a href={href(`/deal/${featured.id}`)} className="feature">
            <span className="feature__photo">
              <img src={imageUrl(featured)} alt="" width={900} height={900} fetchPriority="high" />
              <Seal pct={featured.discountPct} size="xl" />
            </span>
            <span className="feature__body">
              <span className="feature__title">
                {featured.brand} {featured.title}
              </span>
              <span className="feature__price">
                <span className="feature__sale">{formatYen(featured.salePrice)}</span>
                <s>{formatYen(featured.originalPrice)}</s>
              </span>
              <span className="feature__note">
                The biggest discount right now, at {featured.store}. <TimeLeft hours={featured.endsInHours} />
              </span>
            </span>
          </a>
        </div>
      </section>

      <div className="page">
        <SearchForm initial="" className="home__search" />
        <section className="section" aria-labelledby="top-title">
          <div className="section__head">
            <h2 id="top-title" className="section__title">
              Top Discounts
            </h2>
            <a href={href('/browse')} className="link-more">
              See all deals
              <ArrowRightIcon weight="bold" aria-hidden="true" />
            </a>
          </div>
          <div className="rail">
            <DealGrid deals={topDiscounts} wide />
          </div>
        </section>

        <section className="section" aria-labelledby="cat-title">
          <div className="section__head">
            <h2 id="cat-title" className="section__title">
              Shop by category
            </h2>
          </div>
          <ul className="categories">
            {categoryCards.map((c) => (
              <li key={c.name}>
                <a href={href('/browse', { cat: c.name })} className="category">
                  <img src={imageUrl(c.best)} alt="" width={900} height={900} loading="lazy" decoding="async" />
                  <span className="category__name">{c.name}</span>
                  <span className="category__meta">
                    {c.count} deals, up to {c.best.discountPct}% off
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="section twin">
          <section aria-labelledby="ending-title">
            <div className="section__head">
              <h2 id="ending-title" className="section__title">
                Ending soon
              </h2>
              <a href={href('/browse', { sort: 'ending' })} className="link-more">
                More
                <ArrowRightIcon weight="bold" aria-hidden="true" />
              </a>
            </div>
            <ul className="rows">
              {endingSoon.map((d) => (
                <DealRow key={d.id} deal={d} lead="ending" />
              ))}
            </ul>
          </section>
          <section aria-labelledby="found-title">
            <div className="section__head">
              <h2 id="found-title" className="section__title">
                Just found
              </h2>
              <a href={href('/browse', { sort: 'newest' })} className="link-more">
                More
                <ArrowRightIcon weight="bold" aria-hidden="true" />
              </a>
            </div>
            <ul className="rows">
              {justFound.map((d) => (
                <DealRow key={d.id} deal={d} lead="found" />
              ))}
            </ul>
          </section>
        </div>

        <section className="section instore" aria-labelledby="instore-title">
          <div className="instore__copy">
            <h2 id="instore-title" className="section__title">
              Deals you can walk into
            </h2>
            <p className="instore__text">
              Some discounts only exist on the shop floor. Pick a prefecture to see what is on at the stores near you.
            </p>
          </div>
          <ul className="instore__list">
            {prefectureCounts.map((p) => (
              <li key={p.name}>
                <a href={href('/browse', { ch: 'in-store', pref: p.name })} className="chip chip--link">
                  <MapPinIcon weight="fill" aria-hidden="true" />
                  {p.name}
                  <span className="chip__count">{p.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
