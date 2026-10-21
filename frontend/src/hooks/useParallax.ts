import { type MotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { RefObject } from 'react'

const px = (offset: number | string) => (typeof offset === 'number' ? `${offset}px` : offset)

/**
 * Drifts an element at its own speed while `target` scrolls past, for a sense of depth.
 * Bind the result to `style.transform`.
 *
 * - `through` (default): from when the target enters the bottom of the screen until it leaves the top.
 * - `away`: for a hero at the top of the page, from no scroll until it has left the screen.
 *
 * `from` and `to` are the element's vertical offsets at those two moments (px or %).
 *
 * The value is a whole `transform`, which lets Motion attach it to a native scroll timeline:
 * where the browser supports it (Chrome, Edge, Safari 26), the drift runs on the compositor and
 * stays glued to the scroll even while the main thread is busy. Elsewhere Motion updates it from
 * JavaScript as before. Visitors who ask for reduced motion get a still image.
 */
export function useParallax(
  target: RefObject<HTMLElement | null>,
  from: number | string,
  to: number | string,
  range: 'through' | 'away' = 'through',
): MotionValue<string> {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target,
    offset: range === 'away' ? ['start start', 'end start'] : ['start end', 'end start'],
  })
  return useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion
      ? ['translateY(0px)', 'translateY(0px)']
      : [`translateY(${px(from)})`, `translateY(${px(to)})`],
  )
}
