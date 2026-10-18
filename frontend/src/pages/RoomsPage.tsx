import { useSearchParams } from 'react-router'

import { RoomCard, RoomCardSkeleton } from '@/components/rooms/RoomCard'
import { Faq } from '@/components/sections/Faq'
import { Reviews } from '@/components/sections/Reviews'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useRooms } from '@/lib/api/queries/catalog'
import { formatGuests } from '@/lib/format'
import { sketch } from '@/lib/sketch'

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

export function RoomsPage() {
  usePageTitle('Rooms')
  const [searchParams] = useSearchParams()
  const checkIn = searchParams.get('check_in') ?? undefined
  const checkOut = searchParams.get('check_out') ?? undefined
  const guests = Number(searchParams.get('guests')) || undefined
  const search = searchParams.toString()

  const rooms = useRooms({ check_in: checkIn, check_out: checkOut, guests, size: 24 })

  return (
    <>
      <section
        className="bg-sand/60 sketch-bg section-y"
        style={sketch('/images/home/rooms-section-bg.jpg')}
      >
        <div className="container-site space-y-12">
          <div className="max-w-[520px] space-y-4">
            <Eyebrow>Luxury suites & villas</Eyebrow>
            <h1 className="text-heading text-ink">Our Rooms</h1>
            {checkIn && checkOut ? (
              <p>
                Available from <strong className="text-ink">{formatDate(checkIn)}</strong> to{' '}
                <strong className="text-ink">{formatDate(checkOut)}</strong>
                {guests ? ` for ${formatGuests(guests)}` : ''}.
              </p>
            ) : (
              <p>
                Suites and private villas with sea, garden or pool views, all a few steps from the
                Mediterranean.
              </p>
            )}
          </div>

          {rooms.isError && (
            <p className="text-ink">Rooms are unavailable right now. Please try again shortly.</p>
          )}
          {rooms.isSuccess && rooms.data.items.length === 0 && (
            <p className="text-ink">
              Every room is booked for these dates. Try different dates or fewer guests.
            </p>
          )}
          {/* Keeps the outline in order: page title, then each room card's title. */}
          <h2 className="sr-only">Rooms</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.isPending
              ? [0, 1, 2, 3, 4, 5].map((n) => <RoomCardSkeleton key={n} />)
              : rooms.data?.items.map((room, index) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    index={index % 3}
                    search={search ? `?${search}` : ''}
                  />
                ))}
          </div>
        </div>
      </section>
      <Reviews />
      <Faq />
    </>
  )
}
