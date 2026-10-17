import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface EyebrowProps {
  children: ReactNode
  className?: string
  /** "lines" draws `— TEXT —`, "stars" draws `☆ TEXT ☆` (hero only). */
  decoration?: 'lines' | 'stars' | 'none'
}

export function Eyebrow({ children, className, decoration = 'lines' }: EyebrowProps) {
  const mark =
    decoration === 'lines' ? (
      <span aria-hidden="true" className="h-px w-4 bg-current" />
    ) : decoration === 'stars' ? (
      <span aria-hidden="true">☆</span>
    ) : null

  return (
    <p className={cn('inline-flex items-center gap-3 text-eyebrow text-gold', className)}>
      {mark}
      <span>{children}</span>
      {mark}
    </p>
  )
}
