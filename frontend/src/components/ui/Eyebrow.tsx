import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface EyebrowProps {
  children: ReactNode
  className?: string
  /** "lines" draws `— TEXT —`, "stars" draws `☆ TEXT ☆` (hero only). */
  decoration?: 'lines' | 'stars' | 'none'
  /** The surface behind it: the template's gold reads well only on dark ones. */
  tone?: 'light' | 'dark'
}

export function Eyebrow({
  children,
  className,
  decoration = 'lines',
  tone = 'light',
}: EyebrowProps) {
  const mark =
    decoration === 'lines' ? (
      <span aria-hidden="true" className="h-px w-4 bg-current" />
    ) : decoration === 'stars' ? (
      <span aria-hidden="true">☆</span>
    ) : null

  return (
    <p
      className={cn(
        'inline-flex items-center gap-3 text-eyebrow',
        tone === 'dark' ? 'text-gold' : 'text-gold-deep',
        className,
      )}
    >
      {mark}
      <span>{children}</span>
      {mark}
    </p>
  )
}
