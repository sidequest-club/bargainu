import { useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import { DealRow } from '../components/DealCard'
import { Dog } from '../components/Dog'
import { CurlyArrow, Spark, Squiggle } from '../components/Doodles'
import { ArrowIcon, BoneIcon, PawIcon, StarIcon } from '../components/Icons'
import { Marquee } from '../components/Marquee'
import { Sticker } from '../components/Sticker'
import TextRotate from '../fancy/text-rotate'
import CenterUnderline from '../fancy/underline-center'
import VerticalCutReveal from '../fancy/vertical-cut-reveal'
import { formatYen, useCatalog } from '../lib/catalog'
import type { Category, Deal } from '../lib/catalog'
import { byEnding, foundAgo, priceAsOf, timeLeft } from '../lib/format'
import { spring, tokenNumber, useAfter, useSettled } from '../lib/tokens'

const LIST_LENGTH = 4
const BAND_COUNT = 3
const HERO_LINE = 'Big cuts on'
const COLLAGE_SLOTS = ['a', 'b', 'c'] as const

// "More deals" on Home skips anything already shown higher up the page, so each list adds new finds.
const notIn = (shown: Deal[]) => (deal: Deal) => !shown.includes(deal)

const bandTones = ['pink', 'green', 'blue'] as const
const bandIcons = [<StarIcon key="s" />, <PawIcon key="p" />, <BoneIcon key="b" />]

const browseCategory = (category: Category) => `/browse?category=${encodeURIComponent(category)}`

function CollageCard({ deal, slot }: { deal: Deal; slot: 'a' | 'b' | 'c' }) {
  return (
    <Link to={`/deal/${deal.id}`} className={`collage__card collage__card--${slot}`}>
      <span className="collage__tape" aria-hidden="true" />
      <img src={deal.image} alt="" width={900} height={900} />
      <span className="collage__caption">
        <span className="collage__name">{deal.title}</span>
        <span className="price">{formatYen(deal.price)}</span>
        <span className="collage__asof">{priceAsOf(deal)}</span>
      </span>
      <Sticker rate={deal.pointRate} size="md" className="collage__sticker" />
    </Link>
  )
}

export function Home() {
  const reduced = useReducedMotion()
  const revealed = useSettled()
  const rotating = useAfter('--rotate-hold')
  const { deals, categories } = useCatalog()
  const words = categories.map((c) => c.toUpperCase())

  const ending = deals.toSorted(byEnding)
  const collage = ending.slice(0, COLLAGE_SLOTS.length)
  // Deals with no end date have nothing to count down, so they never count as ending soon.
  const endingSoon = ending
    .filter((d) => d.endsInHours !== null)
    .filter(notIn(collage))
    .slice(0, LIST_LENGTH)
  const justFound = deals
    .filter(notIn([...collage, ...endingSoon]))
    .sort((a, b) => a.postedHoursAgo - b.postedHoursAgo)
    .slice(0, LIST_LENGTH)

  const byCategory = categories.map((category) => {
    const list = deals.filter((d) => d.category === category)
    const cover = list.toSorted(byEnding)[0]
    return { category, count: list.length, cover }
  })
  const bands = Array.from({ length: BAND_COUNT }, (_, band) =>
    categories.filter((_, i) => i % BAND_COUNT === band),
  )

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
              Bargainu collects the live sales at Rakuten and lays them out in one pile. The dog has
              already been through it.
            </p>
            <div className="hero__actions">
              <Link to="/browse" className="btn btn--cta btn--lg">
                Browse all {deals.length} deals
                <ArrowIcon />
              </Link>
              <button type="button" className="text-link" onClick={scrollToEndingSoon}>
                <CenterUnderline>See what ends soon</CenterUnderline>
              </button>
            </div>
          </div>

          <div className="hero__media">
            <div className="collage">
              {COLLAGE_SLOTS.map(
                (slot, i) => collage[i] && <CollageCard key={slot} deal={collage[i]} slot={slot} />,
              )}
              <div className="collage__dog" aria-hidden="true">
                <span className="bubble">Found it!</span>
                <Dog size="md" mood="sniff" />
              </div>
              <CurlyArrow className="collage__arrow" />
            </div>
            {/* Each collage card is one link, so Rakuten's notice is linked once here (decision 6). */}
            <a href="#price-notice" className="text-link">
              <CenterUnderline>About these prices</CenterUnderline>
            </a>
          </div>
        </div>
      </section>

      <section className="bands" aria-labelledby="bands-title">
        <h2 id="bands-title" className="sr-only">
          Jump into a category
        </h2>
        {bands.map((list, i) => (
          <div key={bandTones[i]} className={`band band--${bandTones[i]}`}>
            <Marquee
              speedToken="--marquee-band"
              direction={i % 2 === 0 ? 'left' : 'right'}
              repeat={5}
            >
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

      <section className="block" aria-labelledby="cat-title">
        <div className="wrap">
          <header className="block__head">
            <h2 id="cat-title" className="shout">
              Dig by category
            </h2>
            <p className="aside">{categories.length} piles. Pick one.</p>
          </header>
          <ul className="tiles">
            {byCategory.map(({ category, count, cover }, i) => (
              <li key={category}>
                <Link
                  to={browseCategory(category)}
                  className={`tile tile--${bandTones[i % bandTones.length]}`}
                >
                  <img
                    src={cover.image}
                    alt=""
                    loading="lazy"
                    width={900}
                    height={900}
                    className="tile__photo"
                  />
                  <span className="tile__name">{category}</span>
                  <span className="tile__meta">
                    {count} {count === 1 ? 'deal' : 'deals'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="block block--tight" aria-label="More deals">
        <div className="wrap duo">
          <div className="panel panel--pink" id="ending-soon">
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
    </>
  )
}

// Scrolls by hand so the move is smooth only for people who have not asked for less motion.
function scrollToEndingSoon() {
  const target = document.getElementById('ending-soon')
  if (!target) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
}
