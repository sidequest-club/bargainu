interface StickerProps {
  pct: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/** The discount sticker. It is the one loud element in the system: use it only for discount %. */
export function Sticker({ pct, size = 'md', className = '' }: StickerProps) {
  return (
    <span className={`sticker sticker--${size} ${className}`}>
      <span className="sr-only">{pct}% off</span>
      <span className="sticker__figure" aria-hidden="true">
        {pct}
        <span className="sticker__unit">%</span>
      </span>
      <span className="sticker__label" aria-hidden="true">
        off
      </span>
    </span>
  )
}
