import { asset } from '@/lib/assets'
import { cn } from '@/lib/cn'

interface MaskIconProps {
  /** File name in /images/icons without extension, e.g. "amenity-wifi". */
  name: string
  className?: string
}

/**
 * Single-color line icon, painted with CSS mask so it takes the current text color
 * (gold by default).
 */
export function MaskIcon({ name, className }: MaskIconProps) {
  const url = `url(${asset(`/images/icons/${name}.svg`)})`
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-6 shrink-0 bg-current', className)}
      style={{
        maskImage: url,
        WebkitMaskImage: url,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
    />
  )
}
