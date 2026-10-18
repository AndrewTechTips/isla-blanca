import { CalendarDays, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { ButtonLink } from '@/components/ui/Button'
import { Alert } from '@/components/ui/form'
import { PageLoader } from '@/components/ui/PageLoader'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useMyBookings } from '@/lib/api/queries/bookings'
import type { Booking } from '@/lib/api/types'
import { formatRange, today } from '@/lib/dates'
import { formatGuests, formatPrice } from '@/lib/format'
import { photo } from '@/lib/images'

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <li>
      <Link
        to={`/account/bookings/${booking.reference}`}
        className="group grid gap-4 overflow-hidden rounded-lg bg-white transition-shadow hover:shadow-lg sm:grid-cols-[200px_1fr]"
      >
        {booking.room.cover_image && (
          <img
            {...photo(booking.room.cover_image, '(min-width: 640px) 200px, 100vw')}
            alt=""
            loading="lazy"
            className="aspect-[16/10] size-full object-cover sm:aspect-auto"
          />
        )}
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-card-title text-ink group-hover:text-gold">
                {booking.room.name}
              </h3>
              <StatusBadge status={booking.status} />
            </div>
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-gold" />
                {formatRange(booking.check_in, booking.check_out)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="size-4 text-gold" />
                {formatGuests(booking.adults + booking.children)}
              </span>
            </p>
            <p className="text-caption text-sage">{booking.reference}</p>
          </div>
          <p className="font-serif text-2xl font-semibold text-ink">
            {formatPrice(booking.total_price)}
          </p>
        </div>
      </Link>
    </li>
  )
}

export function MyBookingsPage() {
  usePageTitle('My bookings')
  const [page, setPage] = useState(1)
  const bookings = useMyBookings(page)

  if (bookings.isPending) return <PageLoader className="min-h-[30svh]" />
  if (bookings.isError) return <Alert>{bookings.error.message}</Alert>

  const items = bookings.data.items
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-lg bg-white px-6 py-16 text-center">
        <h2 className="text-subheading text-ink">Your first stay is waiting</h2>
        <p className="max-w-[420px]">
          Browse our suites and villas, pick your dates and your booking will appear here.
        </p>
        <ButtonLink to="/rooms" variant="sage">
          Explore Rooms
        </ButtonLink>
      </div>
    )
  }

  const upcoming = items.filter((b) => b.check_out > today() && b.status !== 'cancelled')
  const past = items.filter((b) => !upcoming.includes(b))

  return (
    <div className="space-y-12">
      {upcoming.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-subheading text-ink">Upcoming stays</h2>
          <ul className="space-y-4">
            {upcoming.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </ul>
        </section>
      )}
      {past.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-subheading text-ink">Past and cancelled</h2>
          <ul className="space-y-4">
            {past.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </ul>
        </section>
      )}
      <Pagination
        page={bookings.data.page}
        pages={bookings.data.pages}
        total={bookings.data.total}
        onChange={setPage}
      />
    </div>
  )
}
