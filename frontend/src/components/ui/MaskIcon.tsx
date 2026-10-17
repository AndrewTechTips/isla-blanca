import { cn } from '@/lib/cn'

interface MaskIconProps {
  /** File name in /images/icons without extension, e.g. "amenity-wifi". */
  name: string
  className?: string
}

/**
 * Single-color line icon from the template, painted with CSS mask so it takes the current
 * text color (gold by default), exactly like the original.
 */
export function MaskIcon({ name, className }: MaskIconProps) {
  const url = `url(/images/icons/${name}.svg)`
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
