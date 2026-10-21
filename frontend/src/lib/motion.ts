/**
 * The site's animation presets (docs/design-spec.md → Animations). Springs are time-based:
 * Motion's `{ type: 'spring', duration, bounce }`.
 */
import { type Transition, useReducedMotion } from 'motion/react'

export const softEase = [0.44, 0, 0.56, 1] as const

export const spring = (duration: number, bounce: number, delay = 0): Transition => ({
  type: 'spring',
  duration,
  bounce,
  delay,
})

export const tween = (duration: number, delay = 0): Transition => ({
  type: 'tween',
  duration,
  delay,
  ease: softEase,
})

/** Hover and small UI changes (buttons, links, accordion). */
export const hoverSpring = spring(0.4, 0.2)

/** Elements reveal once, when 20% of them is visible. */
export const inViewOnce = { once: true, amount: 0.2 } as const

export const hero = {
  photo: tween(4),
  title: spring(2, 0.3, 0.5),
  eyebrow: spring(2, 0.2, 0.7),
  text: spring(2, 0.2, 1),
  actions: spring(1, 0.2, 1.3),
}

/**
 * Movement as one `transform`, which Motion hands to the browser (WAAPI) so it runs on the
 * compositor, not the main thread. Separate `x`/`y`/`scale` values would be animated from
 * JavaScript on every frame. Motion's reduced-motion setting only covers those separate values,
 * so `move()` leaves the transform out itself for visitors who ask for less motion:
 * `initial={move('translateY(40px)', { opacity: 0 })}`.
 *
 * End on the identity spelled out (`translateY(0px)`, `scale(1)`), never `none`: Motion reads
 * `none` as zero for every function of the start value, which would end on `scale(0)`.
 */
export function useMove() {
  const reduce = useReducedMotion()
  return <T extends object>(transform: string, rest?: T) =>
    reduce ? { ...rest } : { ...rest, transform }
}
