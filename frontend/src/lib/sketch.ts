import type { CSSProperties } from 'react'

/** Style for the `sketch-bg` utility: the line-art illustration behind a cream section. */
export const sketch = (path: string): CSSProperties =>
  ({ '--sketch': `url(${path})` }) as CSSProperties
