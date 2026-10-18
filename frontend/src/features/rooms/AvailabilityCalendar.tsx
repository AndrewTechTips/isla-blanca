import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'

import { ButtonLink } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useRoomAvailability } from '@/lib/api/queries/catalog'
import { cn } from '@/lib/cn'
import { addDays, formatDay, formatRange, fromISODate, nightsBetween, today } from '@/lib/dates'

import { addMonths, bookedNights, latestCheckOut, monthOf, monthWeeks } from './calendar'

/** How far ahead the calendar reaches (the API returns up to 366 days at once). */
const WINDOW_DAYS = 365

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** Arrow keys move one day or one week, like any date picker. */
const KEY_STEPS: Partial<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
  PageUp: -28,
  PageDown: 28,
}

const monthLabel = (month: string) =>
  fromISODate(month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

const dayLabel = (iso: string) =>
  fromISODate(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

interface AvailabilityCalendarProps {
  slug: string
  /** Dates already chosen elsewhere (e.g. in a search), shown as the starting selection. */
  initialCheckIn?: string | null
  initialCheckOut?: string | null
  /** Where "Book these dates" leads for the chosen stay. */
  bookHref: (checkIn: string, checkOut: string) => string
}

/**
 * Two months of the room's calendar (one on phones) with booked nights struck through. Guests
 * pick an arrival and a departure date and go on to book with them. A stay may end on the
 * morning another guest arrives, so a booked night is still offered as a departure date.
 */
export function AvailabilityCalendar({
  slug,
  initialCheckIn,
  initialCheckOut,
  bookHref,
}: AvailabilityCalendarProps) {
  const first = today()
  const limit = addDays(first, WINDOW_DAYS)
  const availability = useRoomAvailability(slug, first, limit)
  const booked = useMemo(() => bookedNights(availability.data?.booked ?? []), [availability.data])

  const startsValid = !!initialCheckIn && initialCheckIn >= first && initialCheckIn < limit
  const [checkIn, setCheckIn] = useState(startsValid ? initialCheckIn : null)
  const [checkOut, setCheckOut] = useState(
    startsValid && initialCheckOut && initialCheckOut > initialCheckIn ? initialCheckOut : null,
  )
  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState(checkIn ?? first)
  const [month, setMonth] = useState(monthOf(checkIn ?? first))

  const wide = useMediaQuery('(min-width: 810px)')
  const shown = wide ? 2 : 1
  const months = [month, addMonths(month, 1)].slice(0, shown)
  const firstMonth = monthOf(first)
  const lastMonth = addMonths(monthOf(limit), 1 - shown)

  // Choosing the departure date: anything up to the next booked night (or the longest stay).
  const picking = checkIn !== null && checkOut === null
  const maxCheckOut = picking ? latestCheckOut(checkIn, booked, limit) : null
  const isDeparture = (day: string) =>
    picking && day > checkIn && maxCheckOut !== null && day <= maxCheckOut
  const isArrival = (day: string) => day >= first && day < limit && !booked.has(day)
  const selectable = (day: string) => isDeparture(day) || isArrival(day)

  const end = checkOut ?? (hovered && isDeparture(hovered) ? hovered : null)
  const clash =
    checkIn !== null && checkOut !== null && checkOut > latestCheckOut(checkIn, booked, limit)

  function select(day: string) {
    if (isDeparture(day)) {
      setCheckOut(day)
    } else if (isArrival(day)) {
      setCheckIn(day)
      setCheckOut(null)
    }
  }

  function clear() {
    setCheckIn(null)
    setCheckOut(null)
  }

  // Roving focus: one day is in the tab order; arrow keys move it and pull it into view.
  const grid = useRef<HTMLDivElement>(null)
  const moveFocus = useRef(false)
  const visible = (day: string) => monthOf(day) >= months[0] && monthOf(day) <= months.at(-1)!
  const tabStop = visible(focused) ? focused : months[0] < first ? first : months[0]

  useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    grid.current?.querySelector<HTMLElement>(`[data-date="${focused}"]`)?.focus()
  }, [focused, month])

  function onKeyDown(event: KeyboardEvent) {
    const day = (event.target as HTMLElement).dataset.date
    if (!day) return
    const weekday = (fromISODate(day).getDay() + 6) % 7
    const step =
      event.key === 'Home' ? -weekday : event.key === 'End' ? 6 - weekday : KEY_STEPS[event.key]
    if (step === undefined) return
    event.preventDefault()
    const next = addDays(day, step)
    if (next < first || next > limit) return
    if (monthOf(next) < months[0]) setMonth(monthOf(next))
    if (monthOf(next) > months.at(-1)!) setMonth(addMonths(monthOf(next), 1 - shown))
    moveFocus.current = true
    setFocused(next)
  }

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0

  return (
    <section className="bg-sand/60 section-y" aria-labelledby="availability-title">
      <div className="container-site grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-start">
        <div className="space-y-5">
          <Eyebrow>Availability</Eyebrow>
          <h2 id="availability-title" className="text-heading text-ink">
            Plan your stay
          </h2>
          <p>
            Pick the day you arrive and the day you leave. Struck-through dates are already taken.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink" aria-label="Legend">
            <li className="inline-flex items-center gap-2">
              <span className="size-3 rounded-sm border border-ink/25 bg-white" /> Available
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="text-ink-soft line-through">14</span> Booked
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="size-3 rounded-sm bg-forest" /> Your stay
            </li>
          </ul>

          <div className="space-y-4 rounded-lg bg-cream p-5" aria-live="polite">
            {checkIn && checkOut ? (
              <>
                <p className="font-semibold text-ink">
                  {formatRange(checkIn, checkOut)} · {nights} {nights === 1 ? 'night' : 'nights'}
                </p>
                {clash && (
                  <p className="text-sm text-red-700">
                    Some of these nights are already booked. Please choose other dates.
                  </p>
                )}
              </>
            ) : picking ? (
              <p className="text-ink">
                Arriving {formatDay(checkIn)}. Now choose your departure date, up to{' '}
                {formatDay(maxCheckOut!)}.
              </p>
            ) : (
              <p className="text-ink">Choose your arrival date.</p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              {checkIn && checkOut && !clash && (
                <ButtonLink to={bookHref(checkIn, checkOut)} variant="gold">
                  Book these dates
                </ButtonLink>
              )}
              {checkIn && (
                <button
                  type="button"
                  onClick={clear}
                  className="cursor-pointer text-sm text-ink underline underline-offset-4"
                >
                  Clear dates
                </button>
              )}
            </div>
          </div>
          {availability.isError && (
            <p className="text-sm text-red-700">
              Booked dates couldn’t be loaded. We still check your dates before you book.
            </p>
          )}
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonth(addMonths(month, -1))}
              disabled={month <= firstMonth}
              aria-label="Previous month"
              className="grid size-9 cursor-pointer place-items-center rounded-full text-ink transition-colors hover:bg-sand disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setMonth(addMonths(month, 1))}
              disabled={month >= lastMonth}
              aria-label="Next month"
              className="grid size-9 cursor-pointer place-items-center rounded-full text-ink transition-colors hover:bg-sand disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div
            ref={grid}
            onKeyDown={onKeyDown}
            onMouseLeave={() => setHovered(null)}
            aria-busy={availability.isPending}
            className={cn(
              'grid gap-8 transition-opacity md:grid-cols-2',
              availability.isPending && 'opacity-50',
            )}
          >
            {months.map((shownMonth) => (
              <table
                key={shownMonth}
                role="grid"
                aria-label={monthLabel(shownMonth)}
                className="w-full table-fixed border-collapse"
              >
                <caption className="pb-3 font-serif text-xl text-ink">
                  {monthLabel(shownMonth)}
                </caption>
                <thead>
                  <tr>
                    {WEEKDAYS.map((weekday) => (
                      <th
                        key={weekday}
                        scope="col"
                        abbr={weekday}
                        className="pb-2 text-xs font-semibold text-ink-soft"
                      >
                        {weekday.slice(0, 2)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthWeeks(shownMonth).map((week) => (
                    <tr key={week.find(Boolean)}>
                      {week.map((day, index) => {
                        if (!day) return <td key={index} />
                        const isStart = day === checkIn
                        const isEnd = day === end
                        const inside = !!checkIn && !!end && day > checkIn && day < end
                        const open = selectable(day)
                        const taken = booked.has(day) && !open && !isEnd
                        return (
                          <td
                            key={day}
                            role="gridcell"
                            aria-selected={isStart || isEnd || inside}
                            className={cn(
                              'p-0 py-0.5',
                              inside && 'bg-sand',
                              isStart &&
                                end &&
                                'bg-linear-to-r from-transparent from-50% to-sand to-50%',
                              isEnd && 'bg-linear-to-l from-transparent from-50% to-sand to-50%',
                            )}
                          >
                            <button
                              type="button"
                              data-date={day}
                              tabIndex={day === tabStop ? 0 : -1}
                              aria-disabled={!open || undefined}
                              aria-label={`${dayLabel(day)}${taken ? ', booked' : ''}`}
                              onClick={() => select(day)}
                              onMouseEnter={() => setHovered(day)}
                              onFocus={() => {
                                setFocused(day)
                                setHovered(day)
                              }}
                              className={cn(
                                'mx-auto grid h-10 w-full max-w-11 place-items-center rounded-[5px] text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-gold',
                                open
                                  ? 'cursor-pointer text-ink hover:bg-sand'
                                  : 'cursor-not-allowed text-ink-soft/50',
                                taken && 'line-through',
                                (isStart || isEnd) &&
                                  'bg-forest font-semibold text-cream hover:bg-forest',
                              )}
                            >
                              {fromISODate(day).getDate()}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
