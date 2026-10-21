import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { client, unwrap } from '../client'
import type { paths } from '../schema'
import type {
  AmenityCreate,
  AmenityUpdate,
  BookingStatus,
  MembershipTier,
  RoomCreate,
  RoomUpdate,
  ServiceCreate,
  ServiceUpdate,
} from '../types'
import { keys } from './keys'

export type AdminBookingFilters = NonNullable<
  paths['/api/v1/admin/bookings']['get']['parameters']['query']
>

export const useAdminStats = () =>
  useQuery({
    queryKey: keys.admin.stats,
    queryFn: ({ signal }) => unwrap(client.GET('/api/v1/admin/stats', { signal })),
  })

export const useAdminBookings = (filters: AdminBookingFilters) =>
  useQuery({
    queryKey: keys.admin.bookings(filters),
    queryFn: ({ signal }) =>
      unwrap(client.GET('/api/v1/admin/bookings', { params: { query: filters }, signal })),
    placeholderData: keepPreviousData,
  })

export const useAdminRooms = () =>
  useQuery({
    queryKey: keys.admin.rooms,
    queryFn: ({ signal }) => unwrap(client.GET('/api/v1/admin/rooms', { signal })),
  })

export const useAdminServices = () =>
  useQuery({
    queryKey: keys.admin.services,
    queryFn: ({ signal }) => unwrap(client.GET('/api/v1/admin/services', { signal })),
  })

export const useAdminUsers = (page: number) =>
  useQuery({
    queryKey: keys.admin.users(page),
    queryFn: ({ signal }) =>
      unwrap(client.GET('/api/v1/admin/users', { params: { query: { page, size: 20 } }, signal })),
    placeholderData: keepPreviousData,
  })

/** Staff edits change what guests see too, so refresh public and admin data. */
function useInvalidateAll() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all(
      [
        keys.admin.all,
        keys.rooms.all,
        keys.services,
        keys.amenities,
        keys.bookings.all,
        // Completing a stay or setting a tier can change a guest's club card, staff's own too.
        keys.membership.all,
        keys.me,
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    )
}

export function useUpdateBookingStatus() {
  const onSuccess = useInvalidateAll()
  return useMutation({
    mutationFn: ({ reference, status }: { reference: string; status: BookingStatus }) =>
      unwrap(
        client.PATCH('/api/v1/admin/bookings/{reference}', {
          params: { path: { reference } },
          body: { status },
        }),
      ),
    onSuccess,
  })
}

export function useSetMembership() {
  const onSuccess = useInvalidateAll()
  return useMutation({
    mutationFn: ({ userId, tier }: { userId: number; tier: MembershipTier }) =>
      unwrap(
        client.PUT('/api/v1/admin/users/{user_id}/membership', {
          params: { path: { user_id: userId } },
          body: { tier },
        }),
      ),
    onSuccess,
  })
}

export function useSaveRoom() {
  const onSuccess = useInvalidateAll()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: RoomCreate | RoomUpdate }) =>
      id === undefined
        ? unwrap(client.POST('/api/v1/admin/rooms', { body: data as RoomCreate }))
        : unwrap(
            client.PATCH('/api/v1/admin/rooms/{room_id}', {
              params: { path: { room_id: id } },
              body: data,
            }),
          ),
    onSuccess,
  })
}

export function useDeleteRoom() {
  const onSuccess = useInvalidateAll()
  return useMutation({
    mutationFn: (id: number) =>
      unwrap(client.DELETE('/api/v1/admin/rooms/{room_id}', { params: { path: { room_id: id } } })),
    onSuccess,
  })
}

export function useSaveService() {
  const onSuccess = useInvalidateAll()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: ServiceCreate | ServiceUpdate }) =>
      id === undefined
        ? unwrap(client.POST('/api/v1/admin/services', { body: data as ServiceCreate }))
        : unwrap(
            client.PATCH('/api/v1/admin/services/{service_id}', {
              params: { path: { service_id: id } },
              body: data,
            }),
          ),
    onSuccess,
  })
}

export function useDeleteService() {
  const onSuccess = useInvalidateAll()
  return useMutation({
    mutationFn: (id: number) =>
      unwrap(
        client.DELETE('/api/v1/admin/services/{service_id}', {
          params: { path: { service_id: id } },
        }),
      ),
    onSuccess,
  })
}

export function useSaveAmenity() {
  const onSuccess = useInvalidateAll()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: AmenityCreate | AmenityUpdate }) =>
      id === undefined
        ? unwrap(client.POST('/api/v1/admin/amenities', { body: data as AmenityCreate }))
        : unwrap(
            client.PATCH('/api/v1/admin/amenities/{amenity_id}', {
              params: { path: { amenity_id: id } },
              body: data,
            }),
          ),
    onSuccess,
  })
}

export function useDeleteAmenity() {
  const onSuccess = useInvalidateAll()
  return useMutation({
    mutationFn: (id: number) =>
      unwrap(
        client.DELETE('/api/v1/admin/amenities/{amenity_id}', {
          params: { path: { amenity_id: id } },
        }),
      ),
    onSuccess,
  })
}
