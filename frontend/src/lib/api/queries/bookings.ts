import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { client, unwrap } from '../client'
import type { BookingCreate, ReviewCreate, StayRequest } from '../types'
import { keys } from './keys'

/** Live price for a stay. Pass null while the form is incomplete. */
export const useQuote = (request: StayRequest | null) =>
  useQuery({
    queryKey: keys.quote(request ?? {}),
    queryFn: ({ signal }) =>
      unwrap(client.POST('/api/v1/bookings/quote', { body: request!, signal })),
    enabled: request !== null,
    placeholderData: keepPreviousData,
    retry: false,
  })

export const useMyBookings = (page = 1) =>
  useQuery({
    queryKey: keys.bookings.mine(page),
    queryFn: ({ signal }) =>
      unwrap(client.GET('/api/v1/bookings', { params: { query: { page, size: 20 } }, signal })),
  })

export const useBooking = (reference: string) =>
  useQuery({
    queryKey: keys.bookings.detail(reference),
    queryFn: ({ signal }) =>
      unwrap(
        client.GET('/api/v1/bookings/{reference}', { params: { path: { reference } }, signal }),
      ),
  })

/** After any booking change: bookings, room availability and admin numbers are stale. */
function useInvalidateBookings() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: keys.bookings.all }),
      queryClient.invalidateQueries({ queryKey: keys.rooms.all }),
      queryClient.invalidateQueries({ queryKey: keys.admin.all }),
    ])
}

export function useCreateBooking() {
  const invalidate = useInvalidateBookings()
  return useMutation({
    mutationFn: (body: BookingCreate) => unwrap(client.POST('/api/v1/bookings', { body })),
    onSuccess: invalidate,
  })
}

export function useCancelBooking() {
  const invalidate = useInvalidateBookings()
  return useMutation({
    mutationFn: (reference: string) =>
      unwrap(
        client.POST('/api/v1/bookings/{reference}/cancel', { params: { path: { reference } } }),
      ),
    onSuccess: invalidate,
  })
}

export function useReviewBooking() {
  const invalidate = useInvalidateBookings()
  return useMutation({
    mutationFn: ({ reference, review }: { reference: string; review: ReviewCreate }) =>
      unwrap(
        client.POST('/api/v1/bookings/{reference}/review', {
          params: { path: { reference } },
          body: review,
        }),
      ),
    onSuccess: invalidate,
  })
}
