import { describe, expect, it } from 'vitest'

import { addDays, formatDay, formatRange, nightsBetween, rangesOverlap, toISODate } from './dates'

describe('dates', () => {
  it('formats local dates without time-zone shifts', () => {
    // 00:30 local time must stay on the same calendar day (toISOString would not).
    expect(toISODate(new Date(2026, 10, 20, 0, 30))).toBe('2026-11-20')
  })

  it('adds days across month and year ends', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02')
  })

  it('counts nights, including across a daylight-saving change', () => {
    expect(nightsBetween('2026-11-20', '2026-11-23')).toBe(3)
    expect(nightsBetween('2026-10-24', '2026-10-27')).toBe(3) // clocks go back on 25 Oct
  })

  it('treats checkout day as free for the next guest', () => {
    expect(rangesOverlap('2026-07-01', '2026-07-04', '2026-07-04', '2026-07-06')).toBe(false)
    expect(rangesOverlap('2026-07-01', '2026-07-05', '2026-07-04', '2026-07-06')).toBe(true)
  })

  it('formats days and ranges for people', () => {
    expect(formatDay('2026-11-20')).toBe('Fri 20 Nov')
    expect(formatRange('2026-11-20', '2026-11-23')).toBe('Fri 20 Nov – Mon 23 Nov 2026')
  })
})
