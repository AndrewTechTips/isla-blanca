/**
 * Friendly names for the API types generated from the backend's OpenAPI schema
 * (`npm run api:types` regenerates schema.d.ts). Money values are decimal strings.
 */
import type { components } from './schema'

type Schemas = components['schemas']

export type BedType = Schemas['BedType']
export type PricingUnit = Schemas['PricingUnit']
export type BookingStatus = Schemas['BookingStatus']
export type UserRole = Schemas['UserRole']
export type MembershipTier = Schemas['MembershipTier']

export type RatingSummary = Schemas['RatingSummary']
export type Amenity = Schemas['AmenityRead']
export type RoomImage = Schemas['RoomImageRead']
export type RoomBrief = Schemas['RoomBrief']
export type RoomSummary = Schemas['RoomSummary']
export type RoomDetail = Schemas['RoomDetail']
export type RoomAvailability = Schemas['RoomAvailability']
export type Service = Schemas['ServiceRead']
export type Review = Schemas['ReviewRead']

export type User = Schemas['UserRead']
export type TokenResponse = Schemas['TokenResponse']
export type RegisterRequest = Schemas['RegisterRequest']
export type ProfileUpdate = Schemas['ProfileUpdate']
export type TierInfo = Schemas['TierRead']
export type Membership = Schemas['MembershipRead']

export type StayRequest = Schemas['StayRequest']
export type BookingCreate = Schemas['BookingCreate']
export type BookingQuote = Schemas['BookingQuote']
export type QuoteLine = Schemas['QuoteLine']
export type Booking = Schemas['BookingRead']
export type AdminBooking = Schemas['AdminBookingRead']
export type ReviewCreate = Schemas['ReviewCreate']

export type DashboardStats = Schemas['DashboardStats']
export type RoomCreate = Schemas['RoomCreate']
export type RoomUpdate = Schemas['RoomUpdate']
export type ServiceCreate = Schemas['ServiceCreate']
export type ServiceUpdate = Schemas['ServiceUpdate']
export type AmenityCreate = Schemas['AmenityCreate']
export type AmenityUpdate = Schemas['AmenityUpdate']

export interface Page<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}
