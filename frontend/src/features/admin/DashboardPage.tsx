import { Alert } from '@/components/ui/form'
import { PageLoader } from '@/components/ui/PageLoader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAdminStats } from '@/lib/api/queries/admin'
import type { BookingStatus } from '@/lib/api/types'
import { formatPrice } from '@/lib/format'
import { photo } from '@/lib/images'

import { AdminHeader } from './AdminLayout'
import { RevenueChart } from './RevenueChart'

function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg bg-white p-5">
      <p className="text-label font-semibold">{label}</p>
      <p className="mt-2 font-serif text-4xl font-semibold text-ink">{value}</p>
      {note && <p className="mt-1 text-xs">{note}</p>}
    </div>
  )
}

const STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

export function DashboardPage() {
  usePageTitle('Dashboard')
  const stats = useAdminStats()

  if (stats.isPending) return <PageLoader className="min-h-[40svh]" />
  if (stats.isError) return <Alert>{stats.error.message}</Alert>
  const s = stats.data

  return (
    <>
      <AdminHeader title="Dashboard" text="How Isla Blanca is doing today." />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Revenue"
            value={formatPrice(s.revenue_total)}
            note="All non-cancelled stays"
          />
          <StatTile
            label="Occupancy"
            value={`${Math.round(s.occupancy_next_30_days * 100)}%`}
            note="Room-nights booked, next 30 days"
          />
          <StatTile
            label="Arrivals"
            value={String(s.upcoming_check_ins)}
            note="Check-ins in the next 7 days"
          />
          <StatTile
            label="Guests"
            value={String(s.total_guests)}
            note={`${s.active_rooms} of ${s.total_rooms} rooms open`}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <section className="rounded-lg bg-white p-6">
            <h2 className="mb-1 text-card-title text-ink">Revenue by month</h2>
            <p className="mb-6 text-sm">By check-in month, cancelled stays excluded.</p>
            <RevenueChart data={s.revenue_by_month} />
          </section>
          <section className="rounded-lg bg-white p-6">
            <h2 className="mb-5 text-card-title text-ink">Bookings</h2>
            <ul className="space-y-3">
              {STATUSES.map((status) => (
                <li key={status} className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="font-serif text-2xl font-semibold text-ink">
                    {s.bookings_by_status[status] ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="overflow-x-auto rounded-lg bg-white p-6">
          <h2 className="mb-5 text-card-title text-ink">Top rooms</h2>
          <table className="w-full text-left text-sm">
            <thead className="text-label font-semibold">
              <tr className="border-b border-ink/10">
                <th className="py-2 pr-4">Room</th>
                <th className="py-2 pr-4 text-right">Bookings</th>
                <th className="py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {s.top_rooms.map(({ room, bookings, revenue }) => (
                <tr key={room.id} className="border-b border-ink/5 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {room.cover_image && (
                        <img
                          {...photo(room.cover_image, '40px')}
                          alt=""
                          className="size-10 rounded object-cover"
                        />
                      )}
                      <span className="font-semibold text-ink">{room.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right">{bookings}</td>
                  <td className="py-3 text-right font-semibold text-ink">{formatPrice(revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  )
}
