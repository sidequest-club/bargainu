import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import SimpleMarquee from '../fancy/simple-marquee'
import { tokenNumber } from '../lib/tokens'

interface MarqueeProps {
  children: ReactNode
  /** Name of a unitless speed token, e.g. "--marquee-band". */
  speedToken: string
  direction?: 'left' | 'right'
  repeat?: number
  className?: string
}

/**
 * Wraps fancy's SimpleMarquee with the two things the app needs on top of it:
 * it stands still under prefers-reduced-motion, and the repeated copies
 * (already aria-hidden) are taken out of the tab order.
 */
export function Marquee({
  children,
  speedToken,
  direction = 'left',
  repeat = 4,
  className,
}: MarqueeProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current
      ?.querySelectorAll<HTMLElement>('[aria-hidden="true"] a, [aria-hidden="true"] button')
      .forEach((el) => el.setAttribute('tabindex', '-1'))
  })

  return (
    <div ref={ref} className={className}>
      <SimpleMarquee
        direction={direction}
        baseVelocity={reduced ? 0 : tokenNumber(speedToken)}
        slowdownOnHover
        slowDownFactor={tokenNumber('--marquee-hover-factor')}
        repeat={repeat}
      >
        {children}
      </SimpleMarquee>
    </div>
  )
}
