import {
  BedDouble,
  CalendarRange,
  ConciergeBell,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Users,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'

import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/cn'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarRange },
  { to: '/admin/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/admin/services', label: 'Services', icon: ConciergeBell },
  { to: '/admin/amenities', label: 'Amenities', icon: Sparkles },
  { to: '/admin/guests', label: 'Guests', icon: Users },
]

export function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="bg-cream py-8 lg:py-12">
      <div className="container-site grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div>
            <p className="text-eyebrow text-gold-deep">Staff area</p>
            <p className="text-sm">{user?.profile.full_name}</p>
          </div>
          <nav aria-label="Admin" className="-mx-1 flex gap-1 overflow-x-auto lg:flex-col">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-3 rounded-[5px] px-3 py-2.5 text-sm font-semibold transition-colors',
                    isActive ? 'bg-forest text-cream' : 'text-ink hover:bg-sand',
                  )
                }
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => {
              // Leave the protected page first; otherwise its guard sees the sign-out and
              // redirects to the login page. Both updates land in the same render.
              navigate('/', { replace: true })
              signOut()
            }}
            className="hidden cursor-pointer items-center gap-2 px-3 text-sm hover:text-gold lg:flex"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

/** Heading row shared by every admin page. */
export function AdminHeader({
  title,
  text,
  action,
}: {
  title: string
  text?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-heading text-ink">{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  )
}
