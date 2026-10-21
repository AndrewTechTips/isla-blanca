import { describe, expect, it } from 'vitest'

import { formatPrice } from './format'

describe('formatPrice', () => {
  it('drops cents from whole amounts', () => {
    expect(formatPrice('389.00')).toBe('€389')
    expect(formatPrice(1250)).toBe('€1,250')
  })

  it('keeps cents when there are any', () => {
    expect(formatPrice('77.70')).toBe('€77.70')
    expect(formatPrice('699.3')).toBe('€699.30')
  })
})
