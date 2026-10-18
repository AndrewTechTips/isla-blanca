/**
 * The site's photos (public/images/**.jpg) have WebP copies 800 and 1600 px wide, made by
 * scripts/optimize-images.sh. `photo()` returns the props that let the browser pick the
 * smallest one that looks sharp at the size the image is shown; `sizes` describes that size.
 * Any other address (an external image, a video poster) is passed through unchanged.
 */
const OPTIMIZED = /^\/images\/(?!.*(?:-poster|panorama-360)\.jpg$).+\.jpg$/

export function photo(src: string, sizes = '100vw') {
  if (!OPTIMIZED.test(src)) return { src }
  const base = src.slice(0, -'.jpg'.length)
  return { src, srcSet: `${base}-800.webp 800w, ${base}-1600.webp 1600w`, sizes }
}

/** Common `sizes` for the card grids: one column on phones, two on tablets, three on desktops. */
export const GRID_SIZES = '(min-width: 1200px) 33vw, (min-width: 810px) 50vw, 100vw'
