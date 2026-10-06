// Small hand-drawn marks that sit on top of type. Decorative only.
const cls = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(' ')

export const Squiggle = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 300 24"
    preserveAspectRatio="none"
    className={cls('doodle doodle--squiggle', className)}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M4 15 C28 4 44 22 70 12 C96 2 110 22 138 12 C164 3 180 21 206 12 C232 4 250 20 296 9" />
  </svg>
)

export const Spark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 40 40"
    className={cls('doodle doodle--spark', className)}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M20 3 V14 M20 26 V37 M3 20 H14 M26 20 H37 M8.500 8.500 l6 6 M25.500 25.500 l6 6 M31.500 8.500 l-6 6 M14.500 25.500 l-6 6" />
  </svg>
)

export const Loop = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 220 90"
    preserveAspectRatio="none"
    className={cls('doodle doodle--loop', className)}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M24 52 C10 26 66 6 118 8 C170 10 214 26 208 50 C202 76 150 84 104 82 C58 80 14 70 18 42 C20 28 40 18 62 14" />
  </svg>
)

export const CurlyArrow = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 90 70"
    className={cls('doodle doodle--arrow', className)}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M6 12 C30 4 56 14 54 32 C52 46 34 46 36 34 C38 22 62 26 76 54 M62 52 L77 56 L80 40" />
  </svg>
)
