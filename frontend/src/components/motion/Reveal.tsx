import { motion, type Transition, useReducedMotion } from 'motion/react'
import type { ElementType, ReactNode } from 'react'

import { inViewOnce, spring } from '@/lib/motion'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Start offset in px. Negative values drop in from above (room cards). */
  y?: number
  /** Initial scale, e.g. 1.2 for photos that settle into place. */
  scale?: number
  transition?: Transition
  /** Animate on mount instead of when scrolled into view (hero). */
  onMount?: boolean
  as?: 'div' | 'section' | 'li' | 'p' | 'span' | 'h1' | 'h2' | 'h3'
}

/** Fades (and optionally slides or scales) its content in, once.
 *
 * The movement is animated as one `transform`, which Motion hands to the browser (WAAPI), so it
 * runs on the compositor instead of the main thread while the page scrolls. Visitors who ask for
 * reduced motion get the fade only. */
export function Reveal({
  children,
  className,
  y = 0,
  scale = 1,
  transition = spring(2, 0.2),
  onMount = false,
  as = 'div',
}: RevealProps) {
  const Component = motion[as] as ElementType
  const still = useReducedMotion() || (y === 0 && scale === 1)
  const hidden = still
    ? { opacity: 0 }
    : { opacity: 0, transform: `translateY(${y}px) scale(${scale})` }
  // The end state is spelled out: Motion would read `none` as zero for every function, scale(0).
  const shown = still ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px) scale(1)' }

  return (
    <Component
      className={className}
      initial={hidden}
      transition={transition}
      {...(onMount ? { animate: shown } : { whileInView: shown, viewport: inViewOnce })}
    >
      {children}
    </Component>
  )
}
