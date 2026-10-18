import { Star } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'

import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Alert, Field } from '@/components/ui/form'
import { controlClass } from '@/lib/controlClass'
import { PageLoader } from '@/components/ui/PageLoader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ApiError } from '@/lib/api/client'
import { useBooking, useCancelBooking, useReviewBooking } from '@/lib/api/queries/bookings'
import type { Booking } from '@/lib/api/types'
import { cn } from '@/lib/cn'
import { formatDay } from '@/lib/dates'
import { formatPrice } from '@/lib/format'
import { photo } from '@/lib/images'

function CancelBooking({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false)
  const cancel = useCancelBooking()

  return (
    <>
      <Button variant="ghost" className="w-full" onClick={() => setOpen(true)}>
        Cancel Booking
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Cancel this booking?">
        <div className="space-y-5">
          <p>
            Your stay in <strong className="text-ink">{booking.room.name}</strong> from{' '}
            {formatDay(booking.check_in)} will be cancelled and the room released. This can’t be
            undone.
          </p>
          {cancel.error && <Alert>{cancel.error.message}</Alert>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep Booking
            </Button>
            <Button
              variant="gold"
              disabled={cancel.isPending}
              onClick={() => cancel.mutate(booking.reference, { onSuccess: () => setOpen(false) })}
            >
              {cancel.isPending ? 'Cancelling…' : 'Yes, Cancel'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}

function StarRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className="cursor-pointer text-gold"
        >
          <Star className={cn('size-7', n <= value && 'fill-current')} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  )
}

function ReviewForm({ booking }: { booking: Booking }) {
  const id = useId()
  const review = useReviewBooking()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const fields = review.error instanceof ApiError ? review.error.fields : {}

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    review.mutate({ reference: booking.reference, review: { rating, title, comment } })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-lg bg-white p-6">
      <div className="space-y-1">
        <h2 className="text-card-title text-ink">How was your stay?</h2>
        <p className="text-sm">Your review helps future guests choose their room.</p>
      </div>
      <StarRating value={rating} onChange={setRating} />
      <Field id={`${id}-title`} label="Title" error={fields.title}>
        <input
          id={`${id}-title`}
          required
          minLength={3}
          maxLength={120}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={controlClass('light', Boolean(fields.title))}
        />
      </Field>
      <Field
        id={`${id}-comment`}
        label="Your review"
        error={fields.comment}
        hint="At least 10 characters."
      >
        <textarea
          id={`${id}-comment`}
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className={controlClass('light', Boolean(fields.comment))}
        />
      </Field>
      {review.error && !Object.keys(fields).length && <Alert>{review.error.message}</Alert>}
      <Button type="submit" variant="sage" disabled={review.isPending}>
        {review.isPending ? 'Sending…' : 'Publish Review'}
      </Button>
    </form>
  )
}

export function BookingDetailPage() {
  const { reference = '' } = useParams()
  const [searchParams] = useSearchParams()
  const booking = useBooking(reference)
  usePageTitle(`Booking ${reference}`)

  if (booking.isPending) return <PageLoader className="min-h-[30svh]" />
  if (booking.isError) {
    return (
      <div className="space-y-4">
        <Alert>{booking.error.message}</Alert>
        <Link to="/account" className="text-gold-deep underline underline-offset-4">
          Back to my bookings
        </Link>
      </div>
    )
  }

  const b = booking.data
  const guests = b.adults + b.children

  return (
    <div className="space-y-8">
      <Link to="/account" className="text-sm text-gold-deep underline underline-offset-4">
        ← My bookings
      </Link>
      {searchParams.has('created') && b.status === 'confirmed' && (
        <Alert kind="success">
          Your stay is confirmed. We’ve saved everything under reference{' '}
          <strong>{b.reference}</strong>.
        </Alert>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div className="overflow-hidden rounded-lg bg-white">
            {b.room.cover_image && (
              <img
                {...photo(b.room.cover_image, '(min-width: 1200px) 800px, 100vw')}
                alt=""
                className="aspect-[21/9] w-full object-cover"
              />
            )}
            <div className="space-y-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-subheading text-ink">
                  <Link to={`/rooms/${b.room.slug}`} className="hover:text-gold-deep">
                    {b.room.name}
                  </Link>
                </h1>
                <StatusBadge status={b.status} />
              </div>
              <dl className="grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-label font-semibold">Check in</dt>
                  <dd className="text-ink">{formatDay(b.check_in, true)} · from 3 PM</dd>
                </div>
                <div>
                  <dt className="text-label font-semibold">Check out</dt>
                  <dd className="text-ink">{formatDay(b.check_out, true)} · by 11 AM</dd>
                </div>
                <div>
                  <dt className="text-label font-semibold">Guests</dt>
                  <dd className="text-ink">
                    {b.adults} {b.adults === 1 ? 'adult' : 'adults'}
                    {b.children > 0 && `, ${b.children} ${b.children === 1 ? 'child' : 'children'}`}
                  </dd>
                </div>
              </dl>
              {b.special_requests && (
                <div className="rounded-[5px] bg-cream p-4 text-sm">
                  <p className="mb-1 text-label font-semibold">Your requests</p>
                  <p>{b.special_requests}</p>
                </div>
              )}
            </div>
          </div>

          {b.review ? (
            <div className="space-y-3 rounded-lg bg-white p-6">
              <h2 className="text-card-title text-ink">Your review</h2>
              <div
                className="flex gap-1 text-gold"
                role="img"
                aria-label={`${b.review.rating} out of 5`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn('size-5', n <= b.review!.rating && 'fill-current')}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p className="font-semibold text-ink">{b.review.title}</p>
              <p>{b.review.comment}</p>
            </div>
          ) : (
            b.can_review && <ReviewForm booking={b} />
          )}
        </div>

        <aside className="space-y-5 self-start rounded-lg bg-forest p-6 text-sand">
          <p className="text-caption text-gold">Reference {b.reference}</p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt>
                Room · {b.nights} {b.nights === 1 ? 'night' : 'nights'}
              </dt>
              <dd className="text-cream">
                {formatPrice(
                  Number(b.total_price) -
                    b.services.reduce((sum, line) => sum + Number(line.subtotal), 0),
                )}
              </dd>
            </div>
            {b.services.map((line) => (
              <div key={line.service.id} className="flex justify-between gap-4">
                <dt>
                  {line.service.name}
                  {line.quantity > 1 && ` × ${line.quantity}`}
                </dt>
                <dd className="text-cream">{formatPrice(line.subtotal)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
              <dt className="font-semibold text-cream">
                Total for {guests} {guests === 1 ? 'guest' : 'guests'}
              </dt>
              <dd className="font-serif text-2xl text-gold">{formatPrice(b.total_price)}</dd>
            </div>
          </dl>
          {b.can_cancel && <CancelBooking booking={b} />}
        </aside>
      </div>
    </div>
  )
}
