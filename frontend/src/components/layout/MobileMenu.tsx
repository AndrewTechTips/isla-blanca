import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router'

import { Logo } from '@/components/brand/Logo'
import { AccountLink } from '@/components/layout/Navbar'
import { navigation, site } from '@/data/site'
import { useScrollLock } from '@/hooks/useScrollLock'
import { photo } from '@/lib/images'
import { spring, tween } from '@/lib/motion'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { pathname } = useLocation()

  const closeButton = useRef<HTMLButtonElement>(null)

  // Close when the route changes; lock page scroll and move focus inside while open.
  useEffect(onClose, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  useScrollLock(open)
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    closeButton.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener?.focus() // back to the menu button
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-forest text-white lg:hidden"
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={tween(0.4)}
        >
          <img
            {...photo('/images/home/mobile-menu-bg.jpg')}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-25"
          />
          <div className="relative container-site flex h-[72px] items-center justify-between">
            <Logo />
            <button
              ref={closeButton}
              type="button"
              onClick={onClose}
              className="grid size-11 cursor-pointer place-items-center rounded-full border border-white/80"
              aria-label="Close menu"
            >
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>

          <nav
            aria-label="Mobile"
            className="relative container-site flex flex-1 flex-col justify-center"
          >
            <ul className="space-y-4">
              {navigation.map((item, index) => (
                <motion.li
                  key={item.to}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring(1, 0.2, 0.1 + index * 0.06)}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `font-serif text-5xl font-semibold tracking-[-0.04em] ${isActive ? 'text-gold' : ''}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="relative container-site space-y-1 pb-10 text-sm text-sand">
            <AccountLink className="mb-4 text-base text-cream" />
            <p>{site.location}</p>
            <a href={`tel:${site.phone.replaceAll(' ', '')}`} className="block">
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="block">
              {site.email}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
