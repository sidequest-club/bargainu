/** The Bargainu mark: a shiba face printed on a discount sticker. Drawn for this prototype. */
export function DogMark({ className = '' }: { className?: string }) {
  return (
    <svg className={`dogmark ${className}`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <circle className="dogmark__sticker" cx="20" cy="20" r="20" />
      <path className="dogmark__ink" d="M7.4 6.200c-.2-1.100.9-1.900 1.900-1.300l8.900 5.800-8.600 8.300z" />
      <path className="dogmark__ink" d="M32.600 6.200c.2-1.100-.9-1.900-1.900-1.300l-8.900 5.800 8.600 8.300z" />
      <path
        className="dogmark__ink"
        d="M20 10.5c7 0 11.5 4.6 11.5 10.6 0 3.300-1.700 5.700-4.100 7.700-2.100 1.800-4.500 4.200-7.400 4.200s-5.300-2.400-7.400-4.200c-2.400-2-4.100-4.400-4.100-7.700 0-6 4.500-10.600 11.500-10.600z"
      />
      <path
        className="dogmark__sticker"
        d="M20 22.200c2.600 0 4.900 1.900 4.900 4.300 0 2.500-2.500 4.500-4.900 4.500s-4.900-2-4.900-4.500c0-2.400 2.300-4.300 4.900-4.300z"
      />
      <ellipse className="dogmark__ink" cx="20" cy="25.200" rx="2.300" ry="1.600" />
      <path className="dogmark__line" d="M20 26.800v1.700m-2.200.6c.7.700 1.500.700 2.200-.6.700 1.300 1.500 1.300 2.200.6" />
      <circle className="dogmark__sticker" cx="15" cy="19.600" r="1.400" />
      <circle className="dogmark__sticker" cx="25" cy="19.600" r="1.400" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo">
      <DogMark className="logo__mark" />
      <span className="logo__word" translate="no">
        Bargainu
      </span>
    </span>
  )
}
