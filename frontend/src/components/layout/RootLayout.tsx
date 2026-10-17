import { MotionConfig } from 'motion/react'
import { Outlet, ScrollRestoration, useMatches } from 'react-router'

import { Footer } from '@/components/layout/Footer'
import { Navbar, type NavbarVariant } from '@/components/layout/Navbar'

export interface RouteHandle {
  /** Pages that open with a full-bleed photo use the transparent navbar. */
  navbar?: NavbarVariant
}

export function RootLayout() {
  const matches = useMatches()
  const handle = matches.at(-1)?.handle as RouteHandle | undefined

  return (
    // Respect the visitor's "reduce motion" setting for every animation in the app.
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-svh flex-col">
        <Navbar variant={handle?.navbar ?? 'transparent'} />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ScrollRestoration />
    </MotionConfig>
  )
}
