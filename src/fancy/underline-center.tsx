// Copied from fancy (https://github.com/danielpetho/fancy, commit f9f62c6), src/fancy/components/text/underline-center.tsx.
// MIT License, Copyright (c) 2024 Daniel Petho. Full notice in ./LICENSE.
// Adapted for Bargainu: Tailwind class names ported to plain CSS classes in ../styles/fancy.css,
// type-only imports, and the underline is a span (not a div) so it is valid inside <p> and <a>.
// Reduced motion is handled by the callers.

import { type ElementType, useEffect, useRef, useMemo } from 'react'
import { motion, type ValueAnimationTransition } from 'motion/react'
import { cn } from './cn'

interface UnderlineProps {
  /**
   * The content to be displayed and animated
   */
  children: React.ReactNode

  /**
   * HTML Tag to render the component as
   * @default span
   */
  as?: ElementType

  /**
   * Optional class name for styling
   */
  className?: string

  /**
   * Animation transition configuration
   * @default { duration: 0.25, ease: "easeInOut" }
   */
  transition?: ValueAnimationTransition

  /**
   * Height of the underline as a ratio of font size
   * @default 0.1
   */
  underlineHeightRatio?: number

  /**
   * Padding of the underline as a ratio of font size
   * @default 0.01
   */
  underlinePaddingRatio?: number
}

const CenterUnderline = ({
  children,
  as,
  className,
  transition = { duration: 0.25, ease: 'easeInOut' },
  underlineHeightRatio = 0.1,
  underlinePaddingRatio = 0.01,
  ...props
}: UnderlineProps) => {
  const textRef = useRef<HTMLSpanElement>(null)
  const MotionComponent = useMemo(() => motion.create(as ?? 'span'), [as])

  useEffect(() => {
    const updateUnderlineStyles = () => {
      if (textRef.current) {
        const fontSize = parseFloat(getComputedStyle(textRef.current).fontSize)
        const underlineHeight = fontSize * underlineHeightRatio
        const underlinePadding = fontSize * underlinePaddingRatio
        textRef.current.style.setProperty('--underline-height', `${underlineHeight}px`)
        textRef.current.style.setProperty('--underline-padding', `${underlinePadding}px`)
      }
    }

    updateUnderlineStyles()
    window.addEventListener('resize', updateUnderlineStyles)

    return () => window.removeEventListener('resize', updateUnderlineStyles)
  }, [underlineHeightRatio, underlinePaddingRatio])

  const underlineVariants = {
    hidden: {
      width: 0,
      originX: 0.5,
    },
    visible: {
      width: '100%',
      transition: transition,
    },
  }

  return (
    <MotionComponent
      className={cn('fx-relative fx-inline-block fx-pointer', className)}
      whileHover="visible"
      ref={textRef}
      {...props}
    >
      <span>{children}</span>
      <motion.span
        className="fx-underline-center"
        style={{
          height: 'var(--underline-height)',
          bottom: 'calc(-1 * var(--underline-padding))',
        }}
        variants={underlineVariants}
        aria-hidden="true"
      />
    </MotionComponent>
  )
}

CenterUnderline.displayName = 'CenterUnderline'

export default CenterUnderline
