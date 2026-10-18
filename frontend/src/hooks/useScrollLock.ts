import { useEffect } from 'react'

import { lockScroll, unlockScroll } from '@/lib/smoothScroll'

/** Locks page scrolling while `active` is true (dialogs, the mobile menu). */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    lockScroll()
    return unlockScroll
  }, [active])
}
