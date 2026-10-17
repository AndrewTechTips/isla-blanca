import { cn } from '@/lib/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block size-6 animate-spin rounded-full border-2 border-gold/30 border-t-gold',
        className,
      )}
    />
  )
}

/** Full-area loading state for pages waiting on their data. */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn('grid min-h-[60svh] place-items-center', className)}>
      <Spinner className="size-8" />
    </div>
  )
}
