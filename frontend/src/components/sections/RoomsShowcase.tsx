import { Reveal } from '@/components/motion/Reveal'
import { RoomCard, RoomCardSkeleton } from '@/components/rooms/RoomCard'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { useApi } from '@/hooks/useApi'
import { api } from '@/lib/api/client'
import { spring } from '@/lib/motion'
import { sketch } from '@/lib/sketch'

interface RoomsShowcaseProps {
  title?: string
  /** Hide this room from the list (on its own detail page). */
  excludeSlug?: string
}

/** "Featured Rooms" on the home page, "Other Rooms" on a room page. */
export function RoomsShowcase({ title = 'Featured Rooms', excludeSlug }: RoomsShowcaseProps) {
  const rooms = useApi('showcase-rooms', (signal) => api.rooms.search({ size: 4 }, signal))
  const items = rooms.data?.items.filter((room) => room.slug !== excludeSlug).slice(0, 3)

  return (
    <section
      className="bg-sand/60 sketch-bg section-y"
      style={sketch('/images/home/rooms-section-bg.jpg')}
    >
      <div className="container-site space-y-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[420px] space-y-4">
            <Eyebrow>Luxury suites & villas</Eyebrow>
            <h2 className="text-heading text-ink">{title}</h2>
            <p>
              A collection of suites and private villas, each designed around the sea, the light and
              complete privacy.
            </p>
          </div>
          <Reveal transition={spring(1, 0.2, 0.5)}>
            <ArrowLink to="/rooms">All Rooms</ArrowLink>
          </Reveal>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items
            ? items.map((room, index) => <RoomCard key={room.id} room={room} index={index} />)
            : rooms.status === 'loading' && [0, 1, 2].map((n) => <RoomCardSkeleton key={n} />)}
          {rooms.status === 'error' && (
            <p className="text-ink">Rooms are unavailable right now. Please try again shortly.</p>
          )}
        </div>
      </div>
    </section>
  )
}
