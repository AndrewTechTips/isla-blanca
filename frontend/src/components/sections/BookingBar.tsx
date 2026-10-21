import { type FormEvent, useId, useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { ALL_ROOMS, useRooms } from '@/lib/api/queries/catalog'
import { cn } from '@/lib/cn'
import { addDays, today as todayISO } from '@/lib/dates'

const fieldClass =
  'h-10 w-full rounded-[5px] bg-white/10 px-3 text-xs text-cream outline-none transition-colors placeholder:text-cream/70 focus:bg-white/15'

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-label text-gold">
        {label}
      </label>
      {children}
    </div>
  )
}

interface BookingBarProps {
  className?: string
  /** Pre-selects a room (room detail page). */
  roomSlug?: string
}

/**
 * The dark search panel at the bottom of every hero. Picks dates and party size, then opens
 * the room list (or the chosen room) with those filters.
 */
export function BookingBar({ className, roomSlug }: BookingBarProps) {
  const id = useId()
  const navigate = useNavigate()
  const [today] = useState(todayISO)
  const [room, setRoom] = useState(roomSlug ?? '')
  const [checkIn, setCheckIn] = useState(() => addDays(today, 14))
  const [checkOut, setCheckOut] = useState(() => addDays(today, 17))
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const rooms = useRooms(ALL_ROOMS)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const stay = { check_in: checkIn, check_out: checkOut }
    if (room) {
      // A chosen room goes straight to the booking page with the party size.
      const params = new URLSearchParams({
        ...stay,
        adults: String(adults),
        children: String(children),
      })
      navigate(`/book/${room}?${params}`)
    } else {
      navigate(`/rooms?${new URLSearchParams({ ...stay, guests: String(adults + children) })}`)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'grid gap-4 rounded-xl bg-forest/95 p-5 md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_0.55fr_0.55fr_auto] lg:items-end',
        className,
      )}
      aria-label="Check availability"
    >
      <Field label="Room" id={`${id}-room`}>
        <select
          id={`${id}-room`}
          value={room}
          onChange={(event) => setRoom(event.target.value)}
          className={fieldClass}
        >
          <option value="" className="text-ink">
            Any room
          </option>
          {rooms.data?.items.map((item) => (
            <option key={item.slug} value={item.slug} className="text-ink">
              {item.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Check In" id={`${id}-in`}>
        <input
          id={`${id}-in`}
          type="date"
          required
          min={today}
          value={checkIn}
          onChange={(event) => {
            setCheckIn(event.target.value)
            if (event.target.value >= checkOut) setCheckOut(addDays(event.target.value, 1))
          }}
          className={fieldClass}
        />
      </Field>
      <Field label="Check Out" id={`${id}-out`}>
        <input
          id={`${id}-out`}
          type="date"
          required
          min={addDays(checkIn, 1)}
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
          className={fieldClass}
        />
      </Field>
      <Field label="Adults" id={`${id}-adults`}>
        <select
          id={`${id}-adults`}
          value={adults}
          onChange={(event) => setAdults(Number(event.target.value))}
          className={fieldClass}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n} className="text-ink">
              {n}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Children" id={`${id}-children`}>
        <select
          id={`${id}-children`}
          value={children}
          onChange={(event) => setChildren(Number(event.target.value))}
          className={fieldClass}
        >
          {[0, 1, 2, 3, 4].map((n) => (
            <option key={n} value={n} className="text-ink">
              {n}
            </option>
          ))}
        </select>
      </Field>
      <Button type="submit" variant="gold" className="h-10 md:col-span-3 lg:col-span-1">
        Check Availability
      </Button>
    </form>
  )
}
