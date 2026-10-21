import { motion } from 'motion/react'
import { Link } from 'react-router'

import { ButtonLink } from '@/components/ui/Button'
import { MaskIcon } from '@/components/ui/MaskIcon'
import type { RoomSummary } from '@/lib/api/types'
import { formatBed, formatGuests, formatPrice } from '@/lib/format'
import { GRID_SIZES, photo } from '@/lib/images'
import { hoverSpring, inViewOnce, spring, useMove } from '@/lib/motion'

interface RoomCardProps {
  room: RoomSummary
  /** Position in the row: each card drops in 0.4 s after the previous one. */
  index?: number
  /** Query string carried to the room page (dates and guests from a search). */
  search?: string
  /** Cards on the first screen load their photo straight away (the first one with high
   * priority: it is the page's largest image); the rest wait until they are near. */
  priority?: 'high' | 'eager'
}

export function RoomCard({ room, index = 0, search = '', priority }: RoomCardProps) {
  const href = `/rooms/${room.slug}${search}`
  const move = useMove()

  return (
    <motion.article
      className="group flex h-full flex-col overflow-hidden rounded-lg bg-cream shadow-[0_1px_0_rgba(0,0,0,0.04)]"
      initial={move('translateY(-40px)', { opacity: 0 })}
      whileInView={move('translateY(0px)', { opacity: 1 })}
      viewport={inViewOnce}
      transition={spring(2, 0.2, index * 0.4)}
    >
      <Link to={href} className="relative block aspect-[372/248] overflow-hidden" tabIndex={-1}>
        {room.cover_image && (
          <motion.img
            {...photo(room.cover_image, GRID_SIZES)}
            alt={room.name}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority === 'high' ? 'high' : undefined}
            className="size-full object-cover"
            whileHover={{ scale: 1.04 }}
            transition={hoverSpring}
          />
        )}
        <span className="absolute top-4 right-4 rounded-[5px] bg-forest/90 px-3 py-2 font-sans text-xs font-extrabold tracking-[0.2em]">
          <span className="text-gold-light">From </span>
          <span className="text-cream">{formatPrice(room.price_per_night)}</span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <h3 className="text-card-title text-ink">
          <Link to={href}>{room.name}</Link>
        </h3>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <li className="inline-flex items-center gap-2">
            <MaskIcon name="meta-size" className="size-4 text-gold" />
            {room.size_m2}m²
          </li>
          <li className="inline-flex items-center gap-2">
            <MaskIcon name="meta-bed" className="size-4 text-gold" />
            {formatBed(room.bed_type)}
          </li>
          <li className="inline-flex items-center gap-2">
            <MaskIcon name="meta-guests" className="size-4 text-gold" />
            {formatGuests(room.max_guests)}
          </li>
        </ul>
        <p className="flex-1">{room.tagline}</p>
        <ButtonLink to={href} variant="sage" className="w-full">
          Explore Room
        </ButtonLink>
      </div>
    </motion.article>
  )
}

export function RoomCardSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-lg bg-cream">
      <div className="aspect-[372/248] bg-sand" />
      <div className="space-y-4 p-4">
        <div className="h-7 w-3/4 rounded bg-sand" />
        <div className="h-4 w-2/3 rounded bg-sand" />
        <div className="h-12 rounded bg-sand" />
        <div className="h-[45px] rounded-[5px] bg-sand" />
      </div>
    </div>
  )
}
