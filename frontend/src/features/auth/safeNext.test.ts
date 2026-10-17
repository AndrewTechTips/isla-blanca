import { describe, expect, it } from 'vitest'

import { safeNext } from './safeNext'

describe('safeNext', () => {
  it('keeps in-app paths with their query string', () => {
    expect(safeNext('/book/villa?check_in=2026-11-20')).toBe('/book/villa?check_in=2026-11-20')
  })

  it.each([
    null,
    '',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
  ])('rejects %s', (next) => {
    expect(safeNext(next)).toBeNull()
  })
})
