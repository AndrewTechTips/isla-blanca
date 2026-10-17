import { MapPin, Menu, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useState } from 'react'
import { NavLink } from 'react-router'

import { Logo } from '@/components/brand/Logo'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { navigation, site } from '@/data/site'
import { cn } from '@/lib/cn'
import { hoverSpring } from '@/lib/motion'

export type NavbarVariant = 'transparent' | 'filled'

function NavItem({ label, to }: { label: string; to: string }) {
  return (
    <NavLink to={to} end={to === '/'}>
      {({ isActive }) => (
        <motion.span
          className="relative block py-1 font-sans text-xs font-semibold tracking-[0.15em] uppercase"
          initial="rest"
          whileHover="hover"
          animate={isActive ? 'hover' : 'rest'}
        >
          {label}
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-current"
            variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
            transition={hoverSpring}
          />
        </motion.span>
      )}
    </NavLink>
  )
}

export function Navbar({ variant }: { variant: NavbarVariant }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <header
      className={cn(
        'z-40 w-full text-white',
        variant === 'transparent' ? 'absolute inset-x-0 top-0' : 'relative bg-forest',
      )}
    >
      <div className="container-site flex h-[72px] items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {navigation.map((item) => (
              <li key={item.to}>
                <NavItem {...item} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-6 text-caption text-[13px] font-semibold tracking-[0.15em] normal-case lg:flex">
          <span className="inline-flex items-center gap-2 font-sans">
            <MapPin className="size-4" strokeWidth={1.5} />
            {site.location}
          </span>
          <a
            href={`tel:${site.phone.replaceAll(' ', '')}`}
            className="inline-flex items-center gap-2 font-sans"
          >
            <Phone className="size-4" strokeWidth={1.5} />
            {site.phone}
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-white/80 lg:hidden"
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <Menu className="size-5" strokeWidth={1.5} />
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </header>
  )
}
