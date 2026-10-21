/** Query keys in one place, so mutations can invalidate exactly what they change. */
export const keys = {
  me: ['me'] as const,
  rooms: {
    all: ['rooms'] as const,
    list: (params: object) => ['rooms', 'list', params] as const,
    detail: (slug: string) => ['rooms', 'detail', slug] as const,
    reviews: (slug: string) => ['rooms', 'reviews', slug] as const,
    availability: (slug: string, start?: string, end?: string) =>
      ['rooms', 'availability', slug, start, end] as const,
  },
  services: ['services'] as const,
  amenities: ['amenities'] as const,
  // The price depends on who asks: signed-in guests get their club discount.
  quote: (request: object, tier?: string) => ['quote', request, tier ?? 'guest'] as const,
  membership: {
    all: ['membership'] as const,
    tiers: ['membership', 'tiers'] as const,
    mine: ['membership', 'mine'] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    mine: (page: number) => ['bookings', 'mine', page] as const,
    detail: (reference: string) => ['bookings', 'detail', reference] as const,
  },
  admin: {
    all: ['admin'] as const,
    stats: ['admin', 'stats'] as const,
    bookings: (filters: object) => ['admin', 'bookings', filters] as const,
    rooms: ['admin', 'rooms'] as const,
    services: ['admin', 'services'] as const,
    users: (page: number) => ['admin', 'users', page] as const,
  },
}
