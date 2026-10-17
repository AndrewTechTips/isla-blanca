import { useEffect } from 'react'

const SITE = 'Isla Blanca'

/** Sets the browser tab title: "Rooms · Isla Blanca", or the full site title on the home page. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `${SITE} · Luxury Resort & Spa in Ibiza`
  }, [title])
}
