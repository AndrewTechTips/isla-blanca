import type { CSSProperties } from 'react'

import { asset } from './assets'

/**
 * Style for the `sketch-bg` utility: the line-art illustration behind a cream section, as the
 * 800 px WebP copy on phones and the 1600 px one from tablets up (see lib/images.ts).
 */
export const sketch = (path: string): CSSProperties => {
  const base = asset(path.replace(/\.jpg$/, ''))
  return {
    '--sketch': `url(${base}-800.webp)`,
    '--sketch-lg': `url(${base}-1600.webp)`,
  } as CSSProperties
}
