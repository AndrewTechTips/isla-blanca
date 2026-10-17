import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { client, unwrap } from '../client'
import { tokenStore } from '../token'
import type { ProfileUpdate, RegisterRequest, TokenResponse } from '../types'
import { keys } from './keys'

export const useMe = (enabled: boolean) =>
  useQuery({
    queryKey: keys.me,
    queryFn: ({ signal }) => unwrap(client.GET('/api/v1/auth/me', { signal })),
    enabled,
    staleTime: 5 * 60_000,
    retry: false,
  })

/** Stores the token and primes the "me" cache, so the UI switches to signed-in at once. */
function useSignIn() {
  const queryClient = useQueryClient()
  return (session: TokenResponse) => {
    queryClient.setQueryData(keys.me, session.user)
    tokenStore.set(session.access_token)
  }
}

export function useLogin() {
  const signIn = useSignIn()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      unwrap(
        client.POST('/api/v1/auth/login', {
          body: { username: email, password, scope: '' },
          // OAuth2 password flow: the API expects a form, not JSON.
          bodySerializer: (body) => new URLSearchParams(body as Record<string, string>),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      ),
    onSuccess: signIn,
  })
}

export function useRegister() {
  const signIn = useSignIn()
  return useMutation({
    mutationFn: (body: RegisterRequest) => unwrap(client.POST('/api/v1/auth/register', { body })),
    onSuccess: signIn,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ProfileUpdate) => unwrap(client.PATCH('/api/v1/auth/me', { body })),
    onSuccess: (user) => queryClient.setQueryData(keys.me, user),
  })
}
