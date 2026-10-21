import { Link } from 'react-router'

import { cn } from '@/lib/cn'

interface LogoProps {
  className?: string
  /** Larger logo for the footer and the mobile menu. */
  size?: 'md' | 'lg'
}

/** A sun over the sea line, drawn to sit next to the wordmark. */
export function SunMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 28" fill="none" aria-hidden="true" className={className}>
      <path
        d="M8 20a12 12 0 0 1 24 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M2 20h36M7 24h26M13 27.5h14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M20 2v4M8.7 6.7l2.8 2.8M31.3 6.7l-2.8 2.8M3.5 13.5l3.6 1.2M36.5 13.5l-3.6 1.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="Isla Blanca, home"
      className={cn('inline-flex items-center gap-3 text-current', className)}
    >
      <SunMark className={cn('text-gold', size === 'lg' ? 'h-8 w-11' : 'h-6 w-9')} />
      <span
        className={cn(
          'font-serif leading-none font-medium tracking-[0.16em] whitespace-nowrap uppercase',
          size === 'lg' ? 'text-[26px]' : 'text-[21px]',
        )}
      >
        Isla Blanca
      </span>
    </Link>
  )
}
