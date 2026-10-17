import { cn } from '@/lib/cn'

/** "dark" sits on forest panels (booking, login), "light" on cream pages (account, admin). */
export type Tone = 'dark' | 'light'

export const controlClass = (tone: Tone, invalid = false) =>
  cn(
    'w-full rounded-[5px] px-3 py-2.5 text-sm outline-none transition-colors disabled:opacity-60',
    tone === 'dark'
      ? 'bg-white/10 text-cream placeholder:text-cream/60 focus:bg-white/15'
      : 'border border-ink/15 bg-white text-ink placeholder:text-ink-soft/60 focus:border-gold',
    invalid && (tone === 'dark' ? 'ring-1 ring-red-300' : 'border-red-500'),
  )
