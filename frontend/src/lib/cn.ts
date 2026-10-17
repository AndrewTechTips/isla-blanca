import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Tailwind-aware class merge: a later class wins over an earlier one of the same kind
 * (`h-10` replaces `h-[45px]`). Our typography utilities are registered as font sizes,
 * so `text-heading text-ink` keeps both instead of treating them as two colors.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display',
            'heading',
            'subheading',
            'card-title',
            'quote',
            'eyebrow',
            'button',
            'label',
            'caption',
          ],
        },
      ],
    },
  },
})

export const cn = (...classes: ClassValue[]) => twMerge(clsx(classes))
