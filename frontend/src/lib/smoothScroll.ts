import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/**
 * One Lenis instance for the whole site: wheel and trackpad scrolling glide instead of jumping,
 * like the Framer template. Native scrolling is kept (Motion's scroll effects and the browser's
 * scroll restoration keep working), and nothing smooths when the visitor asked for reduced motion.
 */
let lenis: Lenis | null = null
let locks = 0

export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.1,
    smoothWheel: true,
    anchors: true,
  })
  return () => {
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
