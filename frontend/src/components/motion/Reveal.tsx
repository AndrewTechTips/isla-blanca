import { motion, type Transition } from 'motion/react'
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

/** Fades (and optionally slides or scales) its content in, once. */
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
  const hidden = { opacity: 0, y, scale }
  const shown = { opacity: 1, y: 0, scale: 1 }

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
