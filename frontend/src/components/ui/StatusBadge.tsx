import type { BookingStatus } from '@/lib/api/types'
import { cn } from '@/lib/cn'

const styles: Record<BookingStatus, string> = {
  pending: 'bg-gold-light/25 text-[#7a5a1c]',
  confirmed: 'bg-green/20 text-forest',
  completed: 'bg-sage/20 text-sage-deep',
  cancelled: 'bg-ink/10 text-ink-soft',
}

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 font-label text-[10px] font-extrabold tracking-[0.15em] uppercase',
        styles[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
