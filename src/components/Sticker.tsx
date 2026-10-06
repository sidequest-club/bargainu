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

const BIG_CUT = 40

interface StickerProps {
  pct: number
  size?: 'sm' | 'md' | 'lg'
  /** Overrides the number, e.g. with an animated ticker. Decorative only: the label still reads pct. */
  number?: ReactNode
  className?: string
}

export function Sticker({ pct, size = 'md', number, className }: StickerProps) {
  const tone = pct >= BIG_CUT ? 'red' : 'yellow'
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
      <span className="sr-only">{pct}% off</span>
      <span className="sticker__text" aria-hidden="true">
        <span className="sticker__num">
          {number ?? pct}
          <span className="sticker__pct">%</span>
        </span>
        <span className="sticker__off">OFF</span>
      </span>
    </span>
  )
}
