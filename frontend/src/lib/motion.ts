/**
 * The site's animation presets (docs/design-spec.md → Animations). Springs are time-based:
 * Motion's `{ type: 'spring', duration, bounce }`.
 */
import type { Transition } from 'motion/react'

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
