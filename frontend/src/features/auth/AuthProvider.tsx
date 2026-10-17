import { useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useCallback, useMemo, useSyncExternalStore } from 'react'

import { useMe } from '@/lib/api/queries/auth'
import { keys } from '@/lib/api/queries/keys'
import { tokenStore } from '@/lib/api/token'

import { AuthContext, type AuthState } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const token = useSyncExternalStore(tokenStore.subscribe, tokenStore.get)
  const me = useMe(token !== null)

  const signOut = useCallback(() => {
    tokenStore.set(null)
    // Forget everything that belonged to this account.
    queryClient.removeQueries({ queryKey: keys.me })
    queryClient.removeQueries({ queryKey: keys.bookings.all })
    queryClient.removeQueries({ queryKey: keys.admin.all })
  }, [queryClient])

  const value = useMemo<AuthState>(() => {
    const user = token ? me.data : undefined
    const status = !token
      ? 'signed-out'
      : user
        ? 'signed-in'
        : me.isError
          ? 'signed-out'
          : 'loading'
    return { user, status, isAdmin: user?.role === 'admin', signOut }
  }, [token, me.data, me.isError, signOut])

  return <AuthContext value={value}>{children}</AuthContext>
}
