import { describe, expect, it } from 'vitest'

import { cn } from './cn'

describe('cn', () => {
  it('lets a later class of the same kind win', () => {
    expect(cn('h-[45px] px-4', 'h-10')).toBe('px-4 h-10')
  })

  it('keeps our type utilities next to colors', () => {
    expect(cn('text-heading text-ink')).toBe('text-heading text-ink')
    expect(cn('text-eyebrow text-gold', 'text-white')).toBe('text-eyebrow text-white')
  })

  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b')
  })
})
