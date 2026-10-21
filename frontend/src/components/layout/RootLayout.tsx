import { MotionConfig, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { ScrollRestoration, useLocation, useMatches, useOutlet } from 'react-router'

import { Footer } from '@/components/layout/Footer'
import { Navbar, type NavbarVariant } from '@/components/layout/Navbar'
import { loadFonts } from '@/lib/fonts'
import { tween } from '@/lib/motion'
import { startSmoothScroll } from '@/lib/smoothScroll'

export interface RouteHandle {
  /** Pages that open with a full-bleed photo use the transparent navbar. */
  navbar?: NavbarVariant
}

/**
 * Which navigations count as "a new page" for the transition. Moving between tabs of the
 * account or the staff area keeps their layout still and only swaps the content.
 */
function transitionKey(pathname: string) {
  const [, section] = pathname.split('/')
  return section === 'admin' || section === 'account' ? section : pathname
}

export function RootLayout() {
  const matches = useMatches()
  const { pathname } = useLocation()
  const outlet = useOutlet()
  // The deepest route that says how the navbar should look (child routes inherit it).
  const handle = matches
    .map((match) => match.handle as RouteHandle | undefined)
    .findLast((h) => h?.navbar)

  const key = transitionKey(pathname)
  // The page the visitor landed on appears at once (it matters for Largest Contentful Paint).
  const [landingKey] = useState(key)

  useEffect(startSmoothScroll, [])
  // After the first page has been committed, so the fonts never delay the first paint.
  useEffect(loadFonts, [])

  return (
    // Respect the visitor's "reduce motion" setting for every animation in the app.
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only z-[60] rounded-[5px] bg-gold px-4 py-2 font-semibold text-forest focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="flex min-h-svh flex-col">
        <Navbar variant={handle?.navbar ?? 'transparent'} />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {/* Each new page fades in; no exit animation, so scroll restoration never waits. */}
          <motion.div
            key={key}
            initial={key === landingKey ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={tween(0.45)}
          >
            {outlet}
          </motion.div>
        </main>
        <Footer />
      </div>
      <ScrollRestoration />
    </MotionConfig>
  )
}
