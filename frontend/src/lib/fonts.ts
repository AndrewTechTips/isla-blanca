import { asset } from './assets'

/**
 * Adds the fonts stylesheet (public/fonts/fonts.css) once the page has loaded and the app has
 * painted, so the fonts never compete with the first paint or the first screen's photos for
 * bandwidth. Until then, local fonts resized to the same metrics stand in, so the swap doesn't
 * move the text. Call it after the first render (RootLayout does).
 */
export function loadFonts() {
  const add = () =>
    requestAnimationFrame(() =>
      setTimeout(() => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = asset('/fonts/fonts.css')
        document.head.append(link)
      }),
    )
  if (document.readyState === 'complete') add()
  else window.addEventListener('load', add, { once: true })
}
