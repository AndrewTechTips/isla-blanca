import { Search } from 'lucide-react'
import { useDeferredValue, useId, useState } from 'react'

import { Alert } from '@/components/ui/form'
import { cn } from '@/lib/cn'
import { controlClass } from '@/lib/controlClass'
import { PageLoader } from '@/components/ui/PageLoader'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAdminBookings, useUpdateBookingStatus } from '@/lib/api/queries/admin'
import type { AdminBooking, BookingStatus } from '@/lib/api/types'
import { formatRange } from '@/lib/dates'
import { formatPrice } from '@/lib/format'

import { AdminHeader } from './AdminLayout'

/** Same rules as the API: cancelled and completed bookings are final. */
const NEXT_STATUSES: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

const STATUS_FILTERS: (BookingStatus | '')[] = [
  '',
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]

function StatusControl({ booking }: { booking: AdminBooking }) {
  const update = useUpdateBookingStatus()
  const options = NEXT_STATUSES[booking.status]
  if (options.length === 0) return <StatusBadge status={booking.status} />

  return (
    <div className="space-y-1">
      <select
        aria-label={`Status of ${booking.reference}`}
        value={booking.status}
        disabled={update.isPending}
        onChange={(event) =>
          update.mutate({
            reference: booking.reference,
            status: event.target.value as BookingStatus,
          })
        }
        className={cn(controlClass('light'), 'py-1.5 text-xs font-semibold capitalize')}
      >
        <option value={booking.status}>{booking.status}</option>
        {options.map((status) => (
          <option key={status} value={status}>
            → {status}
          </option>
        ))}
      </select>
      {update.error && <p className="text-xs text-red-600">{update.error.message}</p>}
    </div>
  )
}

export function AdminBookingsPage() {
  usePageTitle('Bookings')
  const id = useId()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<BookingStatus | ''>('')
  const [guest, setGuest] = useState('')
  const deferredGuest = useDeferredValue(guest.trim())

  const bookings = useAdminBookings({
    page,
    size: 15,
    status: status || undefined,
    guest_email: deferredGuest || undefined,
  })

  return (
    <>
      <AdminHeader title="Bookings" text="Every reservation, newest arrivals first." />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`${id}-guest`} className="sr-only">
          Search by guest email
        </label>
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            id={`${id}-guest`}
            type="search"
            placeholder="Search by guest email"
            value={guest}
            onChange={(event) => {
              setGuest(event.target.value)
              setPage(1)
            }}
            className={cn(controlClass('light'), 'pl-9')}
          />
        </div>
        <label htmlFor={`${id}-status`} className="sr-only">
          Filter by status
        </label>
        <select
          id={`${id}-status`}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as BookingStatus | '')
            setPage(1)
          }}
          className={cn(controlClass('light'), 'capitalize sm:w-48')}
        >
          {STATUS_FILTERS.map((value) => (
            <option key={value} value={value}>
              {value || 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      {bookings.isPending ? (
        <PageLoader className="min-h-[30svh]" />
      ) : bookings.isError ? (
        <Alert>{bookings.error.message}</Alert>
      ) : (
        <div className="space-y-5">
          <div className="overflow-x-auto rounded-lg bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-ink/10 text-label font-semibold">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Stay</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.data.items.map((booking) => (
                  <tr key={booking.id} className="border-b border-ink/5 align-top last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-ink">{booking.reference}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{booking.guest.full_name}</p>
                      <p className="text-xs">{booking.guest.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink">{booking.room.name}</td>
                    <td className="px-4 py-3">
                      {formatRange(booking.check_in, booking.check_out)}
                      <p className="text-xs">
                        {booking.adults + booking.children} guests
                        {booking.services.length > 0 && ` · ${booking.services.length} extras`}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      {formatPrice(booking.total_price)}
                    </td>
                    <td className="w-40 px-4 py-3">
                      <StatusControl booking={booking} />
                    </td>
                  </tr>
                ))}
                {bookings.data.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      No bookings match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={bookings.data.page}
            pages={bookings.data.pages}
            total={bookings.data.total}
            onChange={setPage}
          />
        </div>
      )}
    </>
  )
}
