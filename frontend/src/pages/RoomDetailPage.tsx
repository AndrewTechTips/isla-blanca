import { motion } from 'motion/react'
import { Link, useParams, useSearchParams } from 'react-router'

import { Reveal } from '@/components/motion/Reveal'
import { BookingBar } from '@/components/sections/BookingBar'
import { CtaBand } from '@/components/sections/CtaBand'
import { Faq } from '@/components/sections/Faq'
import { PageHero } from '@/components/sections/PageHero'
import { Reviews } from '@/components/sections/Reviews'
import { RoomsShowcase } from '@/components/sections/RoomsShowcase'
import { ButtonLink } from '@/components/ui/Button'
import { MaskIcon } from '@/components/ui/MaskIcon'
import { AvailabilityCalendar } from '@/features/rooms/AvailabilityCalendar'
import { PanoramaTour } from '@/features/rooms/PanoramaTour'
import { RoomReviews } from '@/features/rooms/RoomReviews'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ApiError } from '@/lib/api/client'
import { useRoom } from '@/lib/api/queries/catalog'
import type { RoomDetail } from '@/lib/api/types'
import { formatBed, formatGuests, formatPrice } from '@/lib/format'
import { photo } from '@/lib/images'
import { inViewOnce, spring, useMove } from '@/lib/motion'

function RoomInfo({ room, bookHref }: { room: RoomDetail; bookHref: string }) {
  const [main, ...rest] = room.images
  const move = useMove()

  return (
    <section className="section-y">
      <div className="container-site space-y-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-5">
            <h2 className="text-heading text-ink">About {room.name}</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <li className="inline-flex items-center gap-2">
                <MaskIcon name="meta-size" className="size-5 text-gold" /> {room.size_m2}m²
              </li>
              <li className="inline-flex items-center gap-2">
                <MaskIcon name="meta-bed" className="size-5 text-gold" /> {formatBed(room.bed_type)}
              </li>
              <li className="inline-flex items-center gap-2">
                <MaskIcon name="meta-guests" className="size-5 text-gold" />{' '}
                {formatGuests(room.max_guests)}
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start">
            <p className="rounded-[5px] bg-forest px-4 py-2.5 font-sans text-sm font-extrabold tracking-[0.2em]">
              <span className="text-gold-light">From </span>
              <span className="text-cream">{formatPrice(room.price_per_night)}</span>
              <span className="text-cream/70"> / night</span>
            </p>
            <ButtonLink to={bookHref} variant="gold">
              Book This Room
            </ButtonLink>
          </div>
        </div>

        {main && (
          <div className="grid gap-4 md:grid-cols-[2fr_1fr] md:grid-rows-2">
            <Reveal
              scale={1.04}
              className="overflow-hidden rounded-lg md:row-span-2"
              transition={spring(1.5, 0.2)}
            >
              <img
                {...photo(main.url, '(min-width: 810px) 66vw, 100vw')}
                alt={main.alt_text}
                className="size-full object-cover"
              />
            </Reveal>
            {rest.slice(0, 2).map((image, index) => (
              <Reveal
                key={image.url}
                scale={1.04}
                className="overflow-hidden rounded-lg"
                transition={spring(1.5, 0.2, 0.15 * (index + 1))}
              >
                <img
                  {...photo(image.url, '(min-width: 810px) 33vw, 100vw')}
                  alt={image.alt_text}
                  loading="lazy"
                  className="aspect-[4/3] size-full object-cover"
                />
              </Reveal>
            ))}
          </div>
        )}

        <div className="max-w-[900px] space-y-4">
          <p className="text-lg text-ink">{room.tagline}</p>
          <p>{room.description}</p>
        </div>

        {room.amenities.length > 0 && (
          <div className="space-y-8 pt-6">
            <h2 className="text-heading text-ink">Room Amenities</h2>
            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {room.amenities.map((amenity, index) => (
                <motion.li
                  key={amenity.id}
                  className="flex flex-col items-center gap-4 rounded-lg bg-white/60 px-4 py-10 text-center"
                  initial={move('translateY(20px)', { opacity: 0 })}
                  whileInView={move('translateY(0px)', { opacity: 1 })}
                  viewport={inViewOnce}
                  transition={spring(1.2, 0.2, (index % 4) * 0.1)}
                >
                  <MaskIcon name={amenity.icon} className="size-10 text-gold" />
                  <span className="text-label font-semibold text-ink-soft">{amenity.name}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

/** Carries dates and party size from a search (or the calendar) on to the booking page. */
function bookingLink(slug: string, search: URLSearchParams, dates?: Record<string, string>) {
  const params = new URLSearchParams()
  for (const key of ['check_in', 'check_out', 'adults', 'children']) {
    const value = dates?.[key] ?? search.get(key)
    if (value) params.set(key, value)
  }
  if (!params.has('adults') && search.get('guests')) params.set('adults', search.get('guests')!)
  return `/book/${slug}${params.size ? `?${params}` : ''}`
}

function RoomNotFound() {
  return (
    <section className="bg-forest section-y pt-40 text-center text-sand">
      <div className="container-site space-y-6">
        <h1 className="text-heading">This room doesn’t exist</h1>
        <Link to="/rooms" className="text-gold underline underline-offset-4">
          See all rooms
        </Link>
      </div>
    </section>
  )
}

export function RoomDetailPage() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const room = useRoom(slug)
  usePageTitle(room.data?.name)

  if (room.isError) {
    return room.error instanceof ApiError && room.error.status === 404 ? (
      <RoomNotFound />
    ) : (
      <section className="section-y pt-40 text-center">
        <p className="text-ink">The room couldn’t be loaded. Please try again shortly.</p>
      </section>
    )
  }

  if (room.isPending) {
    return <div className="min-h-svh animate-pulse bg-forest" aria-busy="true" />
  }

  return (
    <>
      <PageHero
        image={room.data.cover_image ?? '/images/home/hero.jpg'}
        eyebrow="Luxury suites & villas"
        title={room.data.name}
        text={room.data.tagline}
        footer={<BookingBar roomSlug={room.data.slug} />}
      />
      <RoomInfo room={room.data} bookHref={bookingLink(room.data.slug, searchParams)} />
      <AvailabilityCalendar
        slug={room.data.slug}
        initialCheckIn={searchParams.get('check_in')}
        initialCheckOut={searchParams.get('check_out')}
        bookHref={(checkIn, checkOut) =>
          bookingLink(room.data.slug, searchParams, { check_in: checkIn, check_out: checkOut })
        }
      />
      {room.data.panorama_url && (
        <PanoramaTour panorama={room.data.panorama_url} roomName={room.data.name} />
      )}
      <CtaBand />
      <RoomsShowcase title="Other Rooms" excludeSlug={room.data.slug} />
      <RoomReviews slug={room.data.slug} roomName={room.data.name} />
      <Reviews />
      <Faq />
    </>
  )
}
