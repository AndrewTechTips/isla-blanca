import { CalendarCheck, CalendarX, Minus, Plus } from 'lucide-react'
import { type FormEvent, useId, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'

import { ButtonLink, Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Alert, Field } from '@/components/ui/form'
import { controlClass } from '@/lib/controlClass'
import { MaskIcon } from '@/components/ui/MaskIcon'
import { PageLoader, Spinner } from '@/components/ui/PageLoader'
import { useAuth } from '@/features/auth/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useCreateBooking, useQuote } from '@/lib/api/queries/bookings'
import { useRoom, useRoomAvailability, useServices } from '@/lib/api/queries/catalog'
import type { PricingUnit, RoomDetail, Service, StayRequest } from '@/lib/api/types'
import { cn } from '@/lib/cn'
import { addDays, formatRange, MAX_NIGHTS, nightsBetween, rangesOverlap, today } from '@/lib/dates'
import { formatPrice } from '@/lib/format'
import { photo } from '@/lib/images'

const unitLabel: Record<PricingUnit, string> = {
  per_stay: 'per stay',
  per_night: 'per night',
  per_guest: 'per guest',
}

function Counter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  const button =
    'grid size-9 cursor-pointer place-items-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-gold disabled:cursor-not-allowed disabled:opacity-40'
  return (
    <div className="flex items-center justify-between gap-4 rounded-[5px] border border-ink/15 bg-white px-3 py-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={button}
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`Fewer ${label.toLowerCase()}`}
        >
          <Minus className="size-4" />
        </button>
        <output className="w-5 text-center font-semibold text-ink" aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className={button}
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`More ${label.toLowerCase()}`}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  )
}

function ServiceOption({
  service,
  selected,
  onToggle,
}: {
  service: Service
  selected: boolean
  onToggle: () => void
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-4 rounded-lg border bg-white p-4 transition-colors',
        selected ? 'border-gold ring-1 ring-gold' : 'border-ink/15 hover:border-gold/60',
      )}
    >
      <input
        type="checkbox"
        aria-label={`Add ${service.name}`}
        checked={selected}
        onChange={onToggle}
        className="mt-1 size-4 accent-[#b99a6b]"
      />
      {service.icon && <MaskIcon name={service.icon} className="size-7 text-gold" />}
      <span className="flex-1 space-y-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-4">
          <span className="font-semibold text-ink">{service.name}</span>
          <span className="text-sm font-semibold text-ink">
            {formatPrice(service.price)}{' '}
            <span className="font-medium text-ink-soft">{unitLabel[service.pricing_unit]}</span>
          </span>
        </span>
        <span className="block text-sm">{service.description}</span>
      </span>
    </label>
  )
}

function useStayFromUrl() {
  const [params] = useSearchParams()
  const start = params.get('check_in') ?? addDays(today(), 14)
  const end = params.get('check_out') ?? addDays(start, 3)
  return {
    checkIn: start,
    checkOut: end > start ? end : addDays(start, 1),
    adults: Math.max(1, Number(params.get('adults')) || 2),
    children: Math.max(0, Number(params.get('children')) || 0),
    services: (params.get('services') ?? '').split(',').map(Number).filter(Boolean),
  }
}

function BookingForm({ room }: { room: RoomDetail }) {
  const id = useId()
  const navigate = useNavigate()
  const location = useLocation()
  const { status } = useAuth()
  const initial = useStayFromUrl()
  const services = useServices()
  const createBooking = useCreateBooking()

  const [checkIn, setCheckIn] = useState(initial.checkIn)
  const [checkOut, setCheckOut] = useState(initial.checkOut)
  const [adults, setAdults] = useState(Math.min(initial.adults, room.max_guests))
  const [children, setChildren] = useState(
    Math.min(initial.children, room.max_guests - Math.min(initial.adults, room.max_guests)),
  )
  const [selected, setSelected] = useState<number[]>(initial.services)
  const [requests, setRequests] = useState('')

  const nights = nightsBetween(checkIn, checkOut)
  const dateError =
    checkIn < today()
      ? 'Check-in can’t be in the past.'
      : nights < 1
        ? 'Check-out must be after check-in.'
        : nights > MAX_NIGHTS
          ? `Stays can last up to ${MAX_NIGHTS} nights.`
          : undefined

  const request = useMemo<StayRequest | null>(
    () =>
      dateError
        ? null
        : {
            room_id: room.id,
            check_in: checkIn,
            check_out: checkOut,
            adults,
            children,
            services: selected.map((service_id) => ({ service_id })),
          },
    [dateError, room.id, checkIn, checkOut, adults, children, selected],
  )
  const quote = useQuote(request)
  const availability = useRoomAvailability(room.slug, checkIn, dateError ? undefined : checkOut)
  const isBooked =
    !dateError &&
    availability.data?.booked.some((range) =>
      rangesOverlap(checkIn, checkOut, range.check_in, range.check_out),
    )

  const toggle = (serviceId: number) =>
    setSelected((current) =>
      current.includes(serviceId)
        ? current.filter((s) => s !== serviceId)
        : [...current, serviceId],
    )

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!request || isBooked) return
    createBooking.mutate(
      { ...request, special_requests: requests.trim() || null },
      {
        onSuccess: (booking) =>
          navigate(`/account/bookings/${booking.reference}?created=1`, { replace: true }),
      },
    )
  }

  // Coming back from sign-in restores everything the guest picked.
  const draft = new URLSearchParams({
    check_in: checkIn,
    check_out: checkOut,
    adults: String(adults),
    children: String(children),
    ...(selected.length && { services: selected.join(',') }),
  })
  const signInHref = `/login?next=${encodeURIComponent(`${location.pathname}?${draft}`)}`

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-10">
        <fieldset className="space-y-5">
          <legend className="mb-5 text-card-title text-ink">Your stay</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={`${id}-in`} label="Check In" error={dateError}>
              <input
                id={`${id}-in`}
                type="date"
                required
                min={today()}
                value={checkIn}
                onChange={(event) => {
                  setCheckIn(event.target.value)
                  if (event.target.value >= checkOut) setCheckOut(addDays(event.target.value, 1))
                }}
                className={controlClass('light', Boolean(dateError))}
              />
            </Field>
            <Field id={`${id}-out`} label="Check Out">
              <input
                id={`${id}-out`}
                type="date"
                required
                min={addDays(checkIn, 1)}
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
                className={controlClass('light')}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Counter
              label="Adults"
              value={adults}
              min={1}
              max={room.max_guests - children}
              onChange={setAdults}
            />
            <Counter
              label="Children"
              value={children}
              min={0}
              max={room.max_guests - adults}
              onChange={setChildren}
            />
          </div>
          <p className="text-sm">
            {room.name} sleeps up to {room.max_guests} guests.
          </p>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-5 text-card-title text-ink">Make it yours</legend>
          {services.isPending && <Spinner />}
          <div className="space-y-3">
            {services.data?.map((service) => (
              <ServiceOption
                key={service.id}
                service={service}
                selected={selected.includes(service.id)}
                onToggle={() => toggle(service.id)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-5 text-card-title text-ink">Special requests</legend>
          <Field
            id={`${id}-requests`}
            label="Anything we should prepare?"
            hint="Arrival time, celebrations, dietary needs… (optional)"
          >
            <textarea
              id={`${id}-requests`}
              rows={4}
              maxLength={1000}
              value={requests}
              onChange={(event) => setRequests(event.target.value)}
              className={controlClass('light')}
            />
          </Field>
        </fieldset>
      </div>

      <aside className="space-y-5 rounded-xl bg-forest p-6 text-sand lg:sticky lg:top-6">
        {room.cover_image && (
          <img
            {...photo(room.cover_image, '(min-width: 1200px) 400px, 100vw')}
            alt=""
            className="aspect-[16/9] w-full rounded-lg object-cover"
          />
        )}
        <div>
          <h2 className="text-card-title text-cream">{room.name}</h2>
          {!dateError && (
            <p className="text-sm">
              {formatRange(checkIn, checkOut)} · {nights} {nights === 1 ? 'night' : 'nights'}
            </p>
          )}
        </div>

        {!dateError &&
          availability.data &&
          (isBooked ? (
            <p className="flex items-center gap-2 text-sm text-red-200">
              <CalendarX className="size-4" /> Already booked for these dates. Try other dates.
            </p>
          ) : (
            <p className="flex items-center gap-2 text-sm text-green">
              <CalendarCheck className="size-4" /> Available for your dates
            </p>
          ))}

        <dl className="space-y-2 border-t border-white/10 pt-4 text-sm">
          {quote.data ? (
            <>
              <div className="flex justify-between gap-4">
                <dt>
                  {formatPrice(quote.data.price_per_night)} × {quote.data.nights} nights
                </dt>
                <dd className="text-cream">{formatPrice(quote.data.room_total)}</dd>
              </div>
              {quote.data.services.map((line) => (
                <div key={line.service.id} className="flex justify-between gap-4">
                  <dt>
                    {line.service.name}
                    {line.quantity > 1 && ` × ${line.quantity}`}
                  </dt>
                  <dd className="text-cream">{formatPrice(line.subtotal)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3 font-semibold">
                <dt className="text-cream">Total</dt>
                <dd className="font-serif text-2xl text-gold">{formatPrice(quote.data.total)}</dd>
              </div>
            </>
          ) : quote.isFetching ? (
            <Spinner />
          ) : (
            <p className="text-sand/80">Choose valid dates to see the price.</p>
          )}
        </dl>

        {quote.error && <Alert>{quote.error.message}</Alert>}
        {createBooking.error && <Alert>{createBooking.error.message}</Alert>}

        {status === 'signed-in' ? (
          <Button
            type="submit"
            variant="gold"
            className="w-full"
            disabled={!quote.data || Boolean(isBooked) || createBooking.isPending}
          >
            {createBooking.isPending ? 'Booking…' : 'Confirm Booking'}
          </Button>
        ) : (
          <ButtonLink to={signInHref} variant="gold" className="w-full">
            Sign In to Book
          </ButtonLink>
        )}
        <p className="text-center text-xs text-sand/70">
          Free cancellation until the day before arrival.
        </p>
      </aside>
    </form>
  )
}

export function BookingPage() {
  const { slug = '' } = useParams()
  const room = useRoom(slug)
  usePageTitle(room.data ? `Book ${room.data.name}` : 'Book')

  if (room.isPending) return <PageLoader />
  if (room.isError) {
    return (
      <section className="section-y text-center">
        <p className="text-ink">This room isn’t available for booking.</p>
        <Link to="/rooms" className="text-gold-deep underline underline-offset-4">
          See all rooms
        </Link>
      </section>
    )
  }

  return (
    <section className="py-12 lg:py-20">
      <div className="container-site space-y-10">
        <div className="space-y-3">
          <Eyebrow>Reservation</Eyebrow>
          <h1 className="text-heading text-ink">Book {room.data.name}</h1>
          <Link
            to={`/rooms/${room.data.slug}`}
            className="text-sm text-gold-deep underline underline-offset-4"
          >
            ← Back to the room
          </Link>
        </div>
        <BookingForm room={room.data} />
      </div>
    </section>
  )
}
