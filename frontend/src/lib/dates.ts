/** Dates travel as "YYYY-MM-DD" strings, in the guest's local calendar (no time zones). */

export const toISODate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export const fromISODate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const addDays = (iso: string, days: number) => {
  const date = fromISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

export const today = () => toISODate(new Date())

export const nightsBetween = (checkIn: string, checkOut: string) =>
  Math.round((fromISODate(checkOut).getTime() - fromISODate(checkIn).getTime()) / 86_400_000)

export const formatDay = (iso: string, withYear = false) => {
  const date = fromISODate(iso)
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' })
  const day = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(withYear && { year: 'numeric' }),
  })
  return `${weekday} ${day}` // "Sat 31 Oct", "Tue 3 Nov 2026"
}

export const formatRange = (checkIn: string, checkOut: string) =>
  `${formatDay(checkIn)} – ${formatDay(checkOut, true)}`

/** Do [aStart, aEnd) and [bStart, bEnd) share at least one night? */
export const rangesOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  aStart < bEnd && aEnd > bStart
