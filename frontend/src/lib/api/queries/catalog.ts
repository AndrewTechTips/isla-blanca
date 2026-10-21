import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query'

import { client, unwrap } from '../client'
import type { paths } from '../schema'
import { keys } from './keys'

export type RoomSearchParams = NonNullable<paths['/api/v1/rooms']['get']['parameters']['query']>

export const roomsQuery = (params: RoomSearchParams = {}) =>
  queryOptions({
    queryKey: keys.rooms.list(params),
    queryFn: ({ signal }) =>
      unwrap(client.GET('/api/v1/rooms', { params: { query: params }, signal })),
  })

export const useRooms = (params: RoomSearchParams = {}) =>
  useQuery({ ...roomsQuery(params), placeholderData: keepPreviousData })

/** The Rooms page's search, read from its URL (shared with the router, which starts the
 * request while the page's code is still downloading). */
export const roomSearch = (searchParams: URLSearchParams): RoomSearchParams => ({
  check_in: searchParams.get('check_in') ?? undefined,
  check_out: searchParams.get('check_out') ?? undefined,
  guests: Number(searchParams.get('guests')) || undefined,
  size: 24,
})

/** Every room, for the booking bar's room list and the featured rooms: one shared request. */
export const ALL_ROOMS = { size: 50 }

export const roomQuery = (slug: string) =>
  queryOptions({
    queryKey: keys.rooms.detail(slug),
    queryFn: ({ signal }) =>
      unwrap(client.GET('/api/v1/rooms/{slug}', { params: { path: { slug } }, signal })),
  })

export const useRoom = (slug: string) => useQuery(roomQuery(slug))

export const useRoomReviews = (slug: string) =>
  useQuery({
    queryKey: keys.rooms.reviews(slug),
    queryFn: ({ signal }) =>
      unwrap(client.GET('/api/v1/rooms/{slug}/reviews', { params: { path: { slug } }, signal })),
  })

export const useRoomAvailability = (slug: string, start?: string, end?: string) =>
  useQuery({
    queryKey: keys.rooms.availability(slug, start, end),
    queryFn: ({ signal }) =>
      unwrap(
        client.GET('/api/v1/rooms/{slug}/availability', {
          params: { path: { slug }, query: { start, end } },
          signal,
        }),
      ),
  })

export const useServices = () =>
  useQuery({
    queryKey: keys.services,
    queryFn: ({ signal }) => unwrap(client.GET('/api/v1/services', { signal })),
    staleTime: 5 * 60_000,
  })

export const useAmenities = () =>
  useQuery({
    queryKey: keys.amenities,
    queryFn: ({ signal }) => unwrap(client.GET('/api/v1/amenities', { signal })),
    staleTime: 5 * 60_000,
  })
