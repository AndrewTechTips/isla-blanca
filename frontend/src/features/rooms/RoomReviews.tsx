import { Star } from 'lucide-react'

import { Eyebrow } from '@/components/ui/Eyebrow'
import { useRoomReviews } from '@/lib/api/queries/catalog'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

/** Reviews left by guests who stayed in this room. Hidden while there are none. */
export function RoomReviews({ slug, roomName }: { slug: string; roomName: string }) {
  const reviews = useRoomReviews(slug)
  if (!reviews.data?.items.length) return null

  return (
    <section className="bg-sand/60 section-y">
      <div className="container-site space-y-10">
        <div className="space-y-4">
          <Eyebrow>Guest reviews</Eyebrow>
          <h2 className="text-heading text-ink">Stays in {roomName}</h2>
        </div>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.data.items.map((review) => (
            <li key={review.id} className="flex flex-col gap-4 rounded-lg bg-cream p-6">
              <div className="flex gap-1 text-gold" aria-label={`${review.rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={n <= review.rating ? 'size-4 fill-current' : 'size-4 text-gold/30'}
                    strokeWidth={n <= review.rating ? 0 : 1.5}
                  />
                ))}
              </div>
              <h3 className="text-card-title text-ink">{review.title}</h3>
              <p className="flex-1">{review.comment}</p>
              <p className="text-caption text-sage uppercase">
                {review.author_name} · {formatDate(review.created_at)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
