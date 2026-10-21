import { LogOut } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'

import { Eyebrow } from '@/components/ui/Eyebrow'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/cn'

const tabs = [
  // "My bookings" stays selected on a booking's own page too.
  {
    to: '/account',
    label: 'My bookings',
    match: (path: string) => path !== '/account/profile' && path !== '/account/club',
  },
  { to: '/account/club', label: 'Club card', match: (path: string) => path === '/account/club' },
  {
    to: '/account/profile',
    label: 'Profile',
    match: (path: string) => path === '/account/profile',
  },
]

const tierLabel = { silver: 'Silver member', gold: 'Gold member', platinum: 'Platinum member' }

export function AccountLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  if (!user) return null

  return (
    <>
      <section className="bg-forest pt-10 pb-0 text-sand">
        <div className="container-site space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Eyebrow tone="dark">{tierLabel[user.profile.membership_tier]}</Eyebrow>
              <h1 className="text-heading text-cream">Welcome, {user.profile.first_name}</h1>
            </div>
            <button
              type="button"
              onClick={() => {
                // Leave the protected page first; otherwise its guard sees the sign-out and
                // redirects to the login page. Both updates land in the same render.
                navigate('/', { replace: true })
                signOut()
              }}
              className="inline-flex cursor-pointer items-center gap-2 self-start text-sm text-sand transition-colors hover:text-gold md:self-auto"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
          <nav aria-label="Account" className="flex gap-8">
            {tabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                aria-current={tab.match(pathname) ? 'page' : undefined}
                className={cn(
                  'border-b-2 pb-3 font-sans text-xs font-semibold tracking-[0.15em] uppercase transition-colors',
                  tab.match(pathname)
                    ? 'border-gold text-cream'
                    : 'border-transparent hover:text-cream',
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <section className="py-10 lg:py-16">
        <div className="container-site">
          <Outlet />
        </div>
      </section>
    </>
  )
}
