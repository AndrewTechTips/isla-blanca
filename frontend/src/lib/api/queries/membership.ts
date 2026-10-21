import { useQuery } from '@tanstack/react-query'

import { clubTiers } from '@/data/club'

import { client, unwrap } from '../client'
import { keys } from './keys'

/** Club tiers, lowest first. The built-in copy shows until the API answers (it may be
 * waking up), so the page never waits on it. */
export const useTiers = () =>
  useQuery({
    queryKey: keys.membership.tiers,
    queryFn: ({ signal }) => unwrap(client.GET('/api/v1/membership/tiers', { signal })),
    placeholderData: clubTiers,
    staleTime: 60 * 60_000,
  })

/** The signed-in guest's card: tier, discount and progress to the next tier. */
export const useMyMembership = (enabled = true) =>
  useQuery({
    queryKey: keys.membership.mine,
    queryFn: ({ signal }) => unwrap(client.GET('/api/v1/membership/me', { signal })),
    enabled,
  })
