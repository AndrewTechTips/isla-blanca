/**
 * The site's photos (public/images/**.jpg) have WebP copies 400, 800, 1200 and 1600 px wide,
 * made by scripts/optimize-images.sh. `photo()` returns the props that let the browser pick the
 * smallest one that looks sharp at the size the image is shown; `sizes` describes that size.
 * Photos decode off the main thread (`decoding="async"`), so a large one coming into view never
 * holds up a frame while the page scrolls.
 * Any other address (an external image, a video poster) is passed through unchanged.
 */
import { asset } from './assets'

const WIDTHS = [400, 800, 1200, 1600]

const OPTIMIZED = /^\/images\/(?!.*(?:-poster|panorama-360)\.jpg$).+\.jpg$/

export function photo(src: string, sizes = '100vw') {
  if (!OPTIMIZED.test(src)) return { src: asset(src), decoding: 'async' as const }
  const base = asset(src.slice(0, -'.jpg'.length))
  const srcSet = WIDTHS.map((width) => `${base}-${width}.webp ${width}w`).join(', ')
  return { src: asset(src), srcSet, sizes, decoding: 'async' as const }
}

/** Common `sizes` for the card grids: one column on phones, two on tablets, three on desktops. */
export const GRID_SIZES = '(min-width: 1200px) 33vw, (min-width: 810px) 50vw, 100vw'
