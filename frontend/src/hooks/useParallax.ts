import { type MotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { RefObject } from 'react'

/**
 * Drifts an element at its own speed while `target` scrolls past, for a sense of depth.
 *
 * - `through` (default): from when the target enters the bottom of the screen until it leaves the top.
 * - `away`: for a hero at the top of the page, from no scroll until it has left the screen.
 *
 * `from` and `to` are the element's vertical offsets at those two moments (px or %).
 * Visitors who ask for reduced motion get a still image.
 */
export function useParallax(
  target: RefObject<HTMLElement | null>,
  from: number | string,
  to: number | string,
  range: 'through' | 'away' = 'through',
): MotionValue<number | string> {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target,
    offset: range === 'away' ? ['start start', 'end start'] : ['start end', 'end start'],
  })
  return useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [from, to])
}
