import type { ReactNode } from 'react'

// Starburst price sticker. Geometry is in SVG user units inside a fixed viewBox;
// the rendered size, colours and tilt all come from tokens via the .sticker classes.
const POINTS = 16
const OUTER = 50
const INNER = 40.5
const SHADOW_OFFSET = 4

const burst = Array.from({ length: POINTS * 2 }, (_, i) => {
  const radius = i % 2 === 0 ? OUTER : INNER
  const angle = (Math.PI * i) / POINTS
  return `${(Math.sin(angle) * radius).toFixed(2)},${(-Math.cos(angle) * radius).toFixed(2)}`
}).join(' ')

const BIG_BOOST = 10

interface StickerProps {
  /** The point rate the sticker shouts, or null for a sale with no boosted points. */
  rate: number | null
  size?: 'sm' | 'md' | 'lg'
  /** Overrides the rate, e.g. with an animated ticker. Decorative only: the label still reads the rate. */
  number?: ReactNode
  className?: string
}

// Rakuten gives no original price, so the sticker says why the item is a deal instead of a % off.
export function Sticker({ rate, size = 'md', number, className }: StickerProps) {
  const tone = rate === null || rate >= BIG_BOOST ? 'red' : 'yellow'
  return (
    <span
      className={['sticker', `sticker--${size}`, `sticker--${tone}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      <svg viewBox="-53 -53 112 112" aria-hidden="true" focusable="false">
        <polygon
          className="sticker__shadow"
          points={burst}
          transform={`translate(${SHADOW_OFFSET} ${SHADOW_OFFSET})`}
        />
        <polygon className="sticker__burst" points={burst} />
      </svg>
      <span className="sr-only">{rate === null ? 'On sale' : `${rate}× points`}</span>
      {rate === null ? (
        <span className="sticker__text" aria-hidden="true">
          <span className="sticker__word">Sale</span>
        </span>
      ) : (
        <span className="sticker__text" aria-hidden="true">
          <span className="sticker__num">
            {number ?? rate}
            <span className="sticker__pct">×</span>
          </span>
          <span className="sticker__off">Points</span>
        </span>
      )}
    </span>
  )
}
