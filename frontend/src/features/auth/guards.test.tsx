import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import type { User } from '@/lib/api/types'

import { AuthContext, type AuthState } from './authContext'
import { GuestOnly, RequireAdmin, RequireAuth } from './guards'

const guest = { role: 'guest', profile: { first_name: 'Sofia' } } as User
const admin = { role: 'admin', profile: { first_name: 'Staff' } } as User

function auth(user?: User): AuthState {
  return {
    user,
    status: user ? 'signed-in' : 'signed-out',
    isAdmin: user?.role === 'admin',
    signOut: () => {},
  }
}

/** Renders the app's guard layout at `path` and returns where it ends up. */
function renderAt(path: string, state: AuthState) {
  const router = createMemoryRouter(
    [
      { element: <RequireAuth />, children: [{ path: '/account', element: <p>account</p> }] },
      { element: <RequireAdmin />, children: [{ path: '/admin', element: <p>admin</p> }] },
      { element: <GuestOnly />, children: [{ path: '/login', element: <p>login form</p> }] },
      { path: '/book/:slug', element: <p>booking</p> },
    ],
    { initialEntries: [path] },
  )
  render(
    <AuthContext value={state}>
      <RouterProvider router={router} />
    </AuthContext>,
  )
  return router
}

describe('route guards', () => {
  it('sends signed-out visitors to login and remembers where they were going', () => {
    const router = renderAt('/account', auth())
    expect(screen.getByText('login form')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?next=%2Faccount')
  })

  it('lets signed-in guests into their account', () => {
    renderAt('/account', auth(guest))
    expect(screen.getByText('account')).toBeInTheDocument()
  })

  it('keeps guests out of the staff area', () => {
    renderAt('/admin', auth(guest))
    expect(screen.getByText('account')).toBeInTheDocument()
  })

  it('lets admins into the staff area', () => {
    renderAt('/admin', auth(admin))
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('returns a signed-in visitor to the page they came from', () => {
    const router = renderAt('/login?next=%2Fbook%2Fvilla', auth(guest))
    expect(screen.getByText('booking')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/book/villa')
  })

  it('ignores a return path that points to another site', () => {
    renderAt('/login?next=https%3A%2F%2Fevil.example', auth(guest))
    expect(screen.getByText('account')).toBeInTheDocument()
  })
})
