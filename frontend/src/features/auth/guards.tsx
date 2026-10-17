import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router'

import { PageLoader } from '@/components/ui/PageLoader'

import { safeNext } from './safeNext'
import { useAuth } from './useAuth'

/** Signed-in guests only; everyone else goes to the login page and comes back afterwards. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader />
  if (status === 'signed-out') {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <Outlet />
}

/** Resort staff only. Signed-in guests are sent to their account. */
export function RequireAdmin() {
  const { status, isAdmin } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoader />
  if (status === 'signed-out') {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  }
  if (!isAdmin) return <Navigate to="/account" replace />
  return <Outlet />
}

/**
 * Login and register pages: signed-in visitors skip them. This is also what moves the guest
 * on right after signing in, to the page they came from (`?next=`) or their home area.
 */
export function GuestOnly() {
  const { status, isAdmin } = useAuth()
  const [searchParams] = useSearchParams()
  if (status === 'loading') return <PageLoader />
  if (status === 'signed-in') {
    const home = isAdmin ? '/admin' : '/account'
    return <Navigate to={safeNext(searchParams.get('next')) ?? home} replace />
  }
  return <Outlet />
}
