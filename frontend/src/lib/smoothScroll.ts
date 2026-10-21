import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { cancelFrame, frame, type FrameData } from 'motion/react'

/**
 * One Lenis instance for the whole site: wheel and trackpad scrolling glide instead of jumping.
 * Native scrolling is kept (Motion's scroll effects and the browser's
 * scroll restoration keep working), and nothing smooths when the visitor asked for reduced motion.
 *
 * Lenis runs inside Motion's frame loop instead of its own requestAnimationFrame, so each frame
 * moves the page first and then updates every scroll-linked effect from that same position:
 * one loop, and no effect a frame behind the scroll.
 */
let lenis: Lenis | null = null
let locks = 0

export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  lenis = new Lenis({
    autoRaf: false,
    lerp: 0.1,
    smoothWheel: true,
    anchors: true,
  })
  const step = ({ timestamp }: FrameData) => lenis?.raf(timestamp)
  frame.update(step, true)
  return () => {
    cancelFrame(step)
    lenis?.destroy()
    lenis = null
  }
}

/** Freeze page scrolling while a dialog or the mobile menu is open. Calls nest. */
export function lockScroll() {
  locks += 1
  if (locks > 1) return
  document.documentElement.style.overflow = 'hidden'
  lenis?.stop()
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1)
  if (locks > 0) return
  document.documentElement.style.overflow = ''
  lenis?.start()
}
