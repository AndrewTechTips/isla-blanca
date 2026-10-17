import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { client, unwrap } from '../client'
import type { paths } from '../schema'
import { keys } from './keys'

export type RoomSearchParams = NonNullable<paths['/api/v1/rooms']['get']['parameters']['query']>

export const useRooms = (params: RoomSearchParams = {}) =>
  useQuery({
    queryKey: keys.rooms.list(params),
    queryFn: ({ signal }) =>
      unwrap(client.GET('/api/v1/rooms', { params: { query: params }, signal })),
    placeholderData: keepPreviousData,
  })

export const useRoom = (slug: string) =>
  useQuery({
    queryKey: keys.rooms.detail(slug),
    queryFn: ({ signal }) =>
      unwrap(client.GET('/api/v1/rooms/{slug}', { params: { path: { slug } }, signal })),
  })

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
