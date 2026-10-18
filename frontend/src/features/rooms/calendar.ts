import { addDays, fromISODate, MAX_NIGHTS, toISODate } from '@/lib/dates'

/** Months are identified by their first day: "2026-11-01". */
export const monthOf = (iso: string) => `${iso.slice(0, 7)}-01`

export const addMonths = (month: string, count: number) => {
  const date = fromISODate(month)
  date.setMonth(date.getMonth() + count, 1)
  return toISODate(date)
}

/** The weeks of a month, Monday first; cells outside the month are null. */
export function monthWeeks(month: string): (string | null)[][] {
  const first = fromISODate(month)
  const leading = (first.getDay() + 6) % 7 // Monday = 0
  const length = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length }, (_, day) => addDays(month, day)),
  ]
  while (cells.length % 7) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, week) => cells.slice(week * 7, week * 7 + 7))
}

/**
 * Every booked night. A stay from the 20th to the 23rd books the nights of the 20th, 21st and
 * 22nd: the morning of the 23rd is free for the next guest to arrive.
 */
export function bookedNights(ranges: readonly { check_in: string; check_out: string }[]) {
  const nights = new Set<string>()
  for (const range of ranges) {
    for (let night = range.check_in; night < range.check_out; night = addDays(night, 1)) {
      nights.add(night)
    }
  }
  return nights
}

/**
 * The last departure date open to a guest arriving on `checkIn`: the morning of the next booked
 * night, the longest stay allowed, or `limit` (the end of the known calendar), whichever is first.
 */
export function latestCheckOut(checkIn: string, booked: ReadonlySet<string>, limit: string) {
  for (let nights = 1; nights < MAX_NIGHTS; nights++) {
    const day = addDays(checkIn, nights)
    if (booked.has(day) || day >= limit) return day
  }
  return addDays(checkIn, MAX_NIGHTS)
}
