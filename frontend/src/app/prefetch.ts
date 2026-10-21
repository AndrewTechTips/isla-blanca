/**
 * Every page is its own chunk, downloaded the first time someone opens it. To make moving around
 * feel instant without slowing the first visit, a page's code is fetched:
 * - as soon as the visitor shows intent: a pointer over a link to it, or a finger on one;
 * - otherwise a few seconds after the page has loaded, when the browser is idle, so it never
 *   competes with the photos and data of the page being viewed.
 * Nothing is prefetched when the visitor has asked to save data.
 */
const pages: [RegExp, () => Promise<unknown>][] = [
  [/^\/rooms\/?$/, () => import('@/pages/RoomsPage')],
  [/^\/rooms\/[^/]+$/, () => import('@/pages/RoomDetailPage')],
  [/^\/services\/?$/, () => import('@/pages/ServicesPage')],
  [/^\/gallery\/?$/, () => import('@/pages/GalleryPage')],
  [/^\/club\/?$/, () => import('@/pages/ClubPage')],
  [/^\/contact\/?$/, () => import('@/pages/ContactPage')],
  [/^\/book\/[^/]+$/, () => import('@/features/booking/BookingPage')],
]

const fetched = new Set<() => Promise<unknown>>()
const load = (page: () => Promise<unknown>) => {
  if (fetched.has(page)) return
  fetched.add(page)
  page().catch(() => fetched.delete(page))
}

function onIntent(event: Event) {
  const link = (event.target as Element | null)?.closest?.('a[href]')
  if (!(link instanceof HTMLAnchorElement) || link.origin !== location.origin) return
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = link.pathname.slice(base.length) || '/'
  const page = pages.find(([pattern]) => pattern.test(path))
  if (page) load(page[1])
}

export function prefetchPages() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (connection?.saveData) return

  for (const type of ['pointerover', 'focusin', 'touchstart']) {
    document.addEventListener(type, onIntent, { passive: true, capture: true })
  }

  const later = () =>
    setTimeout(() => {
      const idle = window.requestIdleCallback ?? ((task: () => void) => setTimeout(task, 0))
      idle(() => pages.forEach(([, page]) => load(page)))
    }, 5000)
  if (document.readyState === 'complete') later()
  else window.addEventListener('load', later, { once: true })
}
