import { Globe, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router'

import { Logo } from '@/components/brand/Logo'
import { SocialIcon } from '@/components/brand/SocialIcon'
import { navigation, site, socials } from '@/data/site'

function ColumnTitle({ children }: { children: string }) {
  return <h2 className="font-label text-base font-bold text-sand">{children}</h2>
}

const YEAR = new Date().getFullYear()

const linkClass =
  'inline-flex items-center gap-3 text-sm text-cream/90 transition-colors hover:text-gold'

export function Footer() {
  return (
    <footer className="bg-forest text-sand">
      <div className="container-site grid gap-12 py-8 md:grid-cols-[1.4fr_1fr_1fr_0.6fr] md:py-20">
        <div className="space-y-6">
          <Logo size="lg" className="text-cream" />
          <address className="text-sm not-italic">
            <p className="font-label font-bold">Isla Blanca Resort</p>
            {site.address.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </address>
          <p className="max-w-64 text-sm">{site.tagline}</p>
        </div>

        <div className="space-y-5">
          <ColumnTitle>Contact</ColumnTitle>
          <ul className="space-y-3">
            <li>
              <a href={`https://${site.website}`} className={linkClass}>
                <Globe className="size-5" strokeWidth={1.4} /> {site.website}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className={linkClass}>
                <Mail className="size-5" strokeWidth={1.4} /> {site.email}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phone.replaceAll(' ', '')}`} className={linkClass}>
                <Phone className="size-5" strokeWidth={1.4} /> {site.phone}
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-5">
          <ColumnTitle>Social</ColumnTitle>
          <ul className="space-y-3">
            {socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noreferrer" className={linkClass}>
                  <SocialIcon name={social.label} className="size-5" /> {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <ColumnTitle>Pages</ColumnTitle>
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-6 text-sm text-[#cccccc] md:flex-row md:justify-between">
          <p>© {YEAR} Isla Blanca. All rights reserved.</p>
          <p>{site.location}</p>
        </div>
      </div>
    </footer>
  )
}
