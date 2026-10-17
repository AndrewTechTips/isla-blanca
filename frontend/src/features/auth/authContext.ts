import { createContext } from 'react'

import type { User } from '@/lib/api/types'

export interface AuthState {
  user: User | undefined
  /** "loading" only while a stored token is being checked on startup. */
  status: 'loading' | 'signed-out' | 'signed-in'
  isAdmin: boolean
  signOut: () => void
}

export const AuthContext = createContext<AuthState | null>(null)
