import { describe, expect, it } from 'vitest'

import { addMonths, bookedNights, latestCheckOut, monthOf, monthWeeks } from './calendar'

describe('availability calendar', () => {
  it('lays a month out in Monday-first weeks', () => {
    const weeks = monthWeeks('2026-11-01') // 1 November 2026 is a Sunday
    expect(weeks[0]).toEqual([null, null, null, null, null, null, '2026-11-01'])
    expect(weeks.at(-1)).toEqual(['2026-11-30', null, null, null, null, null, null])
    expect(weeks.flat().filter(Boolean)).toHaveLength(30)
  })

  it('moves between months across a year end', () => {
    expect(monthOf('2026-12-24')).toBe('2026-12-01')
    expect(addMonths('2026-12-01', 1)).toBe('2027-01-01')
    expect(addMonths('2027-01-01', -1)).toBe('2026-12-01')
  })

  it('books the nights of a stay but not its departure morning', () => {
    const nights = bookedNights([{ check_in: '2026-11-20', check_out: '2026-11-23' }])
    expect([...nights]).toEqual(['2026-11-20', '2026-11-21', '2026-11-22'])
  })

  it('ends a new stay at the next booked night', () => {
    const booked = bookedNights([{ check_in: '2026-11-20', check_out: '2026-11-23' }])
    // Leaving on the morning another guest arrives is fine.
    expect(latestCheckOut('2026-11-15', booked, '2027-11-01')).toBe('2026-11-20')
    expect(latestCheckOut('2026-11-23', booked, '2027-11-01')).toBe('2026-12-23') // 30 nights
    expect(latestCheckOut('2027-10-30', booked, '2027-11-01')).toBe('2027-11-01')
  })
})
