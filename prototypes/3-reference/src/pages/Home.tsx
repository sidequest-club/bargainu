import { useReducedMotion } from 'motion/react'
import { categories, deals, formatYen, imageUrl, prefectures, topDiscounts } from '@shared/deals'
import type { Category, Deal } from '@shared/deals'
import { DealCard, DealRow } from '../components/DealCard'
import { Dog } from '../components/Dog'
import { CurlyArrow, Spark, Squiggle } from '../components/Doodles'
import { ArrowIcon, BoneIcon, PawIcon, PinIcon, StarIcon } from '../components/Icons'
import { Marquee } from '../components/Marquee'
import { Sticker } from '../components/Sticker'
import TextRotate from '../fancy/text-rotate'
import CenterUnderline from '../fancy/underline-center'
import VerticalCutReveal from '../fancy/vertical-cut-reveal'
import { foundAgo, timeLeft } from '../lib/format'
import { Link } from '../lib/router'
import { spring, tokenNumber, useAfter, useSettled } from '../lib/tokens'

const LIST_LENGTH = 4
const BAND_COUNT = 3
const HERO_LINE = 'Big cuts on'

// "More deals" on Home skips anything already shown higher up the page, so each list adds new finds.
const notIn = (shown: Deal[]) => (deal: Deal) => !shown.includes(deal)
const endingSoon = deals
  .filter(notIn(topDiscounts))
  .sort((a, b) => a.endsInHours - b.endsInHours)
  .slice(0, LIST_LENGTH)
const justFound = deals
  .filter(notIn([...topDiscounts, ...endingSoon]))
  .sort((a, b) => a.postedHoursAgo - b.postedHoursAgo)
  .slice(0, LIST_LENGTH)

const byCategory = categories.map((category) => {
  const list = deals.filter((d) => d.category === category)
  const best = list.reduce((a, b) => (b.discountPct > a.discountPct ? b : a))
  return { category, count: list.length, best }
})

const bandTones = ['pink', 'green', 'blue'] as const
const bandIcons = [<StarIcon key="s" />, <PawIcon key="p" />, <BoneIcon key="b" />]
const bands = Array.from({ length: BAND_COUNT }, (_, band) => categories.filter((_, i) => i % BAND_COUNT === band))

const inStoreByPrefecture = prefectures.map((prefecture) => ({
  prefecture,
  count: deals.filter((d) => d.prefecture === prefecture).length,
}))

const browseCategory = (category: Category) => `/browse?category=${encodeURIComponent(category)}`

function CollageCard({ deal, slot }: { deal: Deal; slot: 'a' | 'b' | 'c' }) {
  return (
    <Link to={`/deal/${deal.id}`} className={`collage__card collage__card--${slot}`}>
      <span className="collage__tape" aria-hidden="true" />
      <img src={imageUrl(deal)} alt="" width={900} height={900} />
      <span className="collage__caption">
        <span className="collage__name">{deal.title}</span>
        <span className="price">{formatYen(deal.salePrice)}</span>
      </span>
      <Sticker pct={deal.discountPct} size="md" className="collage__sticker" />
    </Link>
  )
}

export function Home() {
  const reduced = useReducedMotion()
  const revealed = useSettled()
  const rotating = useAfter('--rotate-hold')
  const words = categories.map((c) => c.toUpperCase())

  return (
    <>
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__copy">
            <p className="eyebrow">
              <PawIcon />
              Today's flyer pile: {deals.length} live deals
            </p>
            <h1 className="hero__title">
              {reduced || revealed ? (
                <span className="hero__line">{HERO_LINE}</span>
              ) : (
                <VerticalCutReveal
                  splitBy="words"
                  staggerDuration={tokenNumber('--reveal-stagger')}
                  transition={spring()}
                  containerClassName="hero__line"
                >
                  {HERO_LINE}
                </VerticalCutReveal>
              )}
              <span className="hero__word-row">
                <TextRotate
                  as="span"
                  texts={words}
                  auto={rotating && !reduced}
                  rotationInterval={tokenNumber('--rotate-interval')}
                  staggerDuration={tokenNumber('--stagger')}
                  transition={spring()}
                  mainClassName="hero__word"
                  splitLevelClassName="hero__word-clip"
                />
                <Spark className="hero__spark" />
              </span>
              <span className="hero__serif">
                sniffed out for you.
                <Squiggle className="hero__squiggle" />
              </span>
            </h1>
            <p className="hero__lede">
              Bargainu collects the live sales at Yodobashi, Rakuten and Amazon and lays them out in one pile. The dog has
              already been through it.
            </p>
            <div className="hero__actions">
              <Link to="/browse" className="btn btn--cta btn--lg">
                Browse all {deals.length} deals
                <ArrowIcon />
              </Link>
              <button type="button" className="text-link" onClick={scrollToTopDiscounts}>
                <CenterUnderline>See the top discounts</CenterUnderline>
              </button>
            </div>
          </div>

          <div className="collage">
            <CollageCard deal={topDiscounts[0]} slot="a" />
            <CollageCard deal={topDiscounts[1]} slot="b" />
            <CollageCard deal={topDiscounts[2]} slot="c" />
            <div className="collage__dog" aria-hidden="true">
              <span className="bubble">Found it!</span>
              <Dog size="md" mood="sniff" />
            </div>
            <CurlyArrow className="collage__arrow" />
          </div>
        </div>
      </section>

      <section className="bands" aria-labelledby="bands-title">
        <h2 id="bands-title" className="sr-only">
          Jump into a category
        </h2>
        {bands.map((list, i) => (
          <div key={bandTones[i]} className={`band band--${bandTones[i]}`}>
            <Marquee speedToken="--marquee-band" direction={i % 2 === 0 ? 'left' : 'right'} repeat={5}>
              <ul className="band__list">
                {list.map((category) => (
                  <li key={category} className="band__item">
                    <Link to={browseCategory(category)} className="band__link">
                      {category}
                    </Link>
                    <span className="band__sep" aria-hidden="true">
                      {bandIcons[i]}
                    </span>
                  </li>
                ))}
              </ul>
            </Marquee>
          </div>
        ))}
      </section>

      <section className="block block--yellow" id="top-discounts" aria-labelledby="top-title">
        <div className="wrap">
          <header className="block__head">
            <h2 id="top-title" className="shout">
              Top Discounts
            </h2>
            <p className="aside">The eight deepest cuts in the pile right now.</p>
          </header>
          <ol className="grid grid--top">
            {topDiscounts.map((deal, i) => (
              <li key={deal.id}>
                <DealCard deal={deal} rank={i + 1} />
              </li>
            ))}
          </ol>
          <p className="block__more">
            <Link to="/browse?sort=discount" className="btn btn--ink">
              All deals, biggest cut first
              <ArrowIcon />
            </Link>
          </p>
        </div>
      </section>

      <section className="block" aria-labelledby="cat-title">
        <div className="wrap">
          <header className="block__head">
            <h2 id="cat-title" className="shout">
              Dig by category
            </h2>
            <p className="aside">Twelve piles. Pick one.</p>
          </header>
          <ul className="tiles">
            {byCategory.map(({ category, count, best }, i) => (
              <li key={category}>
                <Link to={browseCategory(category)} className={`tile tile--${bandTones[i % bandTones.length]}`}>
                  <img src={imageUrl(best)} alt="" loading="lazy" width={900} height={900} className="tile__photo" />
                  <span className="tile__name">{category}</span>
                  <span className="tile__meta">
                    {count} deals, up to {best.discountPct}% off
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="block block--tight" aria-label="More deals">
        <div className="wrap duo">
          <div className="panel panel--pink">
            <header className="panel__head">
              <h2 className="shout shout--sm">Ending soon</h2>
              <Link to="/browse?sort=ending" className="text-link">
                <CenterUnderline>See all</CenterUnderline>
              </Link>
            </header>
            <ul className="rows">
              {endingSoon.map((deal) => (
                <li key={deal.id}>
                  <DealRow deal={deal} note={timeLeft(deal)} />
                </li>
              ))}
            </ul>
          </div>
          <div className="panel panel--green">
            <header className="panel__head">
              <h2 className="shout shout--sm">Just sniffed out</h2>
              <Link to="/browse?sort=newest" className="text-link">
                <CenterUnderline>See all</CenterUnderline>
              </Link>
            </header>
            <ul className="rows">
              {justFound.map((deal) => (
                <li key={deal.id}>
                  <DealRow deal={deal} note={foundAgo(deal)} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="block block--blue" aria-labelledby="near-title">
        <div className="wrap near">
          <div>
            <h2 id="near-title" className="shout">
              In a shop near you
            </h2>
            <p className="aside">Some cuts only happen at the counter. Pick a prefecture.</p>
          </div>
          <ul className="near__list">
            {inStoreByPrefecture.map(({ prefecture, count }) => (
              <li key={prefecture}>
                <Link to={`/browse?channel=in-store&prefecture=${encodeURIComponent(prefecture)}`} className="btn btn--paper">
                  <PinIcon />
                  {prefecture}
                  <span className="count">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

// A plain "#top-discounts" href would replace the route hash, so scroll by hand instead.
function scrollToTopDiscounts() {
  const target = document.getElementById('top-discounts')
  if (!target) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
}
