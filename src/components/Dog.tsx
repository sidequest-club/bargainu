// The Bargainu dog mark. Drawn by hand for this prototype: a white dog with one yellow
// eye patch and an oversized nose, because the nose does the work.
type Mood = 'happy' | 'sniff' | 'sleepy'
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface DogProps {
  mood?: Mood
  size?: Size
  className?: string
  /** Set when the dog is the only content of a link or needs announcing. */
  title?: string
}

export function Dog({ mood = 'happy', size = 'md', className, title }: DogProps) {
  return (
    <svg
      viewBox="0 0 120 116"
      className={['dog', `dog--${size}`, className].filter(Boolean).join(' ')}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {/* ears sit behind the head */}
      <path className="dog__fur dog__line" d="M30 46 C22 34 19 20 23 9 C35 12 46 19 53 29 Z" />
      <path
        className="dog__ear dog__line-thin"
        d="M30 36 C27 29 26 23 27 17 C33 20 38 24 42 29 Z"
      />
      <path
        className="dog__patch dog__line"
        d="M90 47 C100 37 106 25 105 12 C92 12 79 18 69 28 Z"
      />
      {/* head */}
      <path
        className="dog__fur dog__line"
        d="M60 23 C40 22 24 35 23 55 C22 67 26 76 33 84 C39 96 49 104 60 104 C72 104 82 96 88 84 C95 76 98 66 97 55 C96 35 80 23 60 23 Z"
      />
      {/* eye patch */}
      <path
        className="dog__patch dog__line-thin"
        d="M66 34 C74 30 86 34 90 44 C93 52 88 62 79 62 C70 62 63 54 63 45 C63 41 64 37 66 34 Z"
      />
      {/* muzzle */}
      <path
        className="dog__muzzle dog__line-thin"
        d="M60 58 C47 58 39 67 40 78 C41 90 50 98 60 98 C70 98 79 90 80 78 C81 67 73 58 60 58 Z"
      />
      {/* eyes */}
      {mood === 'sleepy' ? (
        <>
          <path className="dog__stroke" d="M38 51 C41 54 46 54 49 51" />
          <path className="dog__stroke" d="M72 50 C75 53 80 53 83 50" />
        </>
      ) : (
        <>
          <ellipse className="dog__ink" cx="43.500" cy="49" rx="3.800" ry="4.400" />
          <ellipse className="dog__ink" cx="77" cy="48" rx="3.800" ry="4.400" />
        </>
      )}
      {/* brows */}
      <path className="dog__stroke" d="M37 39 C40 36 44 36 47 38" />
      {/* the nose */}
      <path
        className="dog__ink"
        d="M60 62 C52 62 47 65 48 70 C49 76 55 79 60 79 C65 79 71 76 72 70 C73 65 68 62 60 62 Z"
      />
      <path className="dog__shine" d="M54 66 C56 64.500 59 64.500 61 65.500" />
      {/* mouth and tongue */}
      {mood === 'sleepy' ? (
        <path className="dog__stroke" d="M52 88 C56 86 64 86 68 88" />
      ) : (
        <>
          <path
            className="dog__tongue dog__line-thin"
            d="M56 87 C55 95 58 100 62 100 C66 100 68 95 66 87 Z"
          />
          <path
            className="dog__stroke"
            d="M60 79 V85 M60 85 C56 90 49 89 46 84 M60 85 C64 90 71 89 74 84"
          />
        </>
      )}
      {/* sniff marks */}
      {mood === 'sniff' && (
        <g className="dog__sniff">
          <path className="dog__stroke" d="M100 70 C104 68 107 68 111 70" />
          <path className="dog__stroke" d="M101 79 C106 79 109 81 113 84" />
          <path className="dog__stroke" d="M99 61 C102 57 106 55 110 55" />
        </g>
      )}
    </svg>
  )
}
